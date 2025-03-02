import { TVShow, Episode, Season, Genre, Network, Creator } from "./types";

interface TMDBTVShowData {
	id: number;
	name: string;
	overview?: string;
	poster_path?: string | null;
	backdrop_path?: string | null;
	vote_average?: number;
	first_air_date?: string;
	next_episode_to_air?: TMDBEpisodeData;
	last_episode_to_air?: TMDBEpisodeData;
	number_of_seasons?: number;
	status?: string;
	genres?: unknown[];
	networks?: unknown[];
	created_by?: unknown[];
}

interface TMDBTVShowResponse {
	results: TMDBTVShowData[];
}

interface TMDBEpisodeData {
	id: number;
	name: string;
	overview?: string;
	still_path?: string | null;
	air_date?: string;
	episode_number: number;
	season_number: number;
	vote_average?: number;
	runtime?: number;
}

interface TMDBSeasonData {
	id: number;
	name: string;
	overview?: string;
	poster_path?: string | null;
	air_date?: string;
	season_number: number;
	episodes?: TMDBEpisodeData[];
}

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = import.meta.env.VITE_TMDB_BASE_URL || "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = import.meta.env.VITE_TMDB_IMAGE_BASE_URL || "https://image.tmdb.org/t/p";

if (!API_KEY) {
	throw new Error("TMDB API key is not configured. Please set VITE_TMDB_API_KEY in your .env file.");
}

export const getImageUrl = (path: string | null, size: string = "original"): string => {
	if (!path) return "/placeholder.svg";
	return `${IMAGE_BASE_URL}/${size}${path}`;
};

// Enhanced fetch function with error handling and timeout
const fetchWithTimeout = async (
	url: string,
	options: RequestInit = {},
	timeout = 8000
): Promise<unknown> => {
	const controller = new AbortController();
	const id = setTimeout(() => controller.abort(), timeout);

	const headers = {
		Authorization: `Bearer ${API_KEY}`,
		"Content-Type": "application/json",
		...options.headers,
	};

	try {
		const response = await fetch(url, {
			...options,
			headers,
			signal: controller.signal
		});

		clearTimeout(id);

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw new Error(
				`TMDB API request failed: ${response.status} ${response.statusText}${errorData.status_message ? ` - ${errorData.status_message}` : ""
				}`
			);
		}

		return await response.json();
	} catch (error: unknown) {
		if (error instanceof Error) {
			if (error.name === "AbortError") {
				throw new Error("Request timeout: The TMDB API request took too long to respond");
			}
			throw error;
		}
		throw new Error("An unknown error occurred while fetching from TMDB API");
	} finally {
		clearTimeout(id);
	}
};

// Helper function to build API URLs without the api_key parameter
const buildApiUrl = (path: string, params: Record<string, string> = {}): string => {
	const searchParams = new URLSearchParams(params);
	return `${BASE_URL}${path}?${searchParams.toString()}`;
};

// Helper functions to transform raw data into proper types
const transformGenreData = (genre: unknown): Genre => {
	const g = genre as { id: number; name: string };
	return { id: g.id, name: g.name };
};

const transformNetworkData = (network: unknown): Network => {
	const n = network as { id: number; name: string; logo_path: string };
	return { id: n.id, name: n.name, logo_path: n.logo_path };
};

const transformCreatorData = (creator: unknown): Creator => {
	const c = creator as { id: number; name: string; profile_path: string };
	return { id: c.id, name: c.name, profile_path: c.profile_path };
};

// Helper function to transform API TV show data to our TVShow type
const transformTVShowData = (data: TMDBTVShowData): TVShow => {
	return {
		id: data.id,
		name: data.name,
		overview: data.overview || "",
		poster_path: data.poster_path,
		backdrop_path: data.backdrop_path,
		vote_average: data.vote_average || 0,
		first_air_date: data.first_air_date || "",
		next_episode_to_air: data.next_episode_to_air
			? transformEpisodeData(data.next_episode_to_air)
			: undefined,
		last_episode_to_air: data.last_episode_to_air
			? transformEpisodeData(data.last_episode_to_air)
			: undefined,
		number_of_seasons: data.number_of_seasons || 0,
		status: data.status || "",
		genres: Array.isArray(data.genres) ? data.genres.map(transformGenreData) : [],
		networks: Array.isArray(data.networks) ? data.networks.map(transformNetworkData) : [],
		created_by: Array.isArray(data.created_by) ? data.created_by.map(transformCreatorData) : []
	};
};

// Helper function to check if a show should be filtered out based on genres
const shouldFilterOutShow = (show: TVShow): boolean => {
	// Genre IDs to filter out: News (10763), Talk (10767), Reality (10764)
	const filteredGenreIds = [10763, 10767, 10764];
	
	// Check if the show has any of the filtered genres
	return show.genres.some(genre => filteredGenreIds.includes(genre.id));
};

// Fetch popular TV shows with improved error handling
export const getPopularTVShows = async (): Promise<TVShow[]> => {
	try {
		const data = (await fetchWithTimeout(
			buildApiUrl("/tv/popular", { language: "en-US", page: "1" })
		)) as TMDBTVShowResponse;

		// Get more details for each show including next episode data
		const shows = await Promise.all(
			data.results.map(async (show: TMDBTVShowData) => {
				try {
					const details = await getTVShowDetails(show.id);
					return details || transformTVShowData(show);
				} catch (error: unknown) {
					console.warn(`Failed to get details for show ID ${show.id}:`, error);
					return transformTVShowData(show);
				}
			})
		);

		// Filter out talk shows, news channels, and reality shows
		const filteredShows = shows.filter(show => !shouldFilterOutShow(show));
		
		return filteredShows.filter(Boolean);
	} catch (error: unknown) {
		console.error("Error fetching popular TV shows:", error);
		throw error;
	}
};

// Fetch TV show details by ID with enhanced error handling
export const getTVShowDetails = async (id: number): Promise<TVShow | undefined> => {
	try {
		const data = await fetchWithTimeout(
			buildApiUrl(`/tv/${id}`, {
				language: "en-US",
				append_to_response: "next_episode_to_air,last_episode_to_air"
			})
		);
		return transformTVShowData(data as TMDBTVShowData);
	} catch (error: unknown) {
		console.error(`Error fetching TV show details for ID: ${id}:`, error);
		throw error;
	}
};

// Search TV shows by query with enhanced error handling
export const searchTVShows = async (query: string): Promise<TVShow[]> => {
	if (!query.trim()) return [];

	try {
		const data = (await fetchWithTimeout(
			buildApiUrl("/search/tv", {
				language: "en-US",
				page: "1",
				query: encodeURIComponent(query)
			})
		)) as TMDBTVShowResponse;

		const shows = data.results.map((show: TMDBTVShowData) => transformTVShowData(show));
		
		// Filter out talk shows, news channels, and reality shows
		return shows.filter(show => !shouldFilterOutShow(show));
	} catch (error: unknown) {
		console.error("Error searching TV shows:", error);
		throw error;
	}
};

// Get the top rated TV shows
export const getTopRatedTVShows = async (): Promise<TVShow[]> => {
	try {
		const data = (await fetchWithTimeout(
			buildApiUrl("/tv/top_rated", { language: "en-US", page: "1" })
		)) as TMDBTVShowResponse;
		
		const shows = data.results.map((show: TMDBTVShowData) => transformTVShowData(show));
		
		// Filter out talk shows, news channels, and reality shows
		return shows.filter(show => !shouldFilterOutShow(show));
	} catch (error: unknown) {
		console.error("Error fetching top rated TV shows:", error);
		throw error;
	}
};

// Get TV shows airing today
export const getTVShowsAiringToday = async (): Promise<TVShow[]> => {
	try {
		const data = (await fetchWithTimeout(
			buildApiUrl("/tv/airing_today", { language: "en-US", page: "1" })
		)) as TMDBTVShowResponse;
		
		const shows = data.results.map((show: TMDBTVShowData) => transformTVShowData(show));
		
		// Filter out talk shows, news channels, and reality shows
		return shows.filter(show => !shouldFilterOutShow(show));
	} catch (error: unknown) {
		console.error("Error fetching TV shows airing today:", error);
		throw error;
	}
};

// Get season details for a TV show
export const getSeasonDetails = async (
	tvId: number,
	seasonNumber: number
): Promise<Season | undefined> => {
	try {
		const data = (await fetchWithTimeout(
			buildApiUrl(`/tv/${tvId}/season/${seasonNumber}`, { language: "en-US" })
		)) as TMDBSeasonData;

		return {
			id: data.id,
			name: data.name,
			overview: data.overview || "",
			poster_path: data.poster_path,
			air_date: data.air_date || "",
			season_number: data.season_number,
			episode_count: data.episodes?.length || 0,
			episodes:
				data.episodes?.map((episode: TMDBEpisodeData) => transformEpisodeData(episode)) || []
		};
	} catch (error: unknown) {
		console.error(`Error fetching season ${seasonNumber} details for TV show ID: ${tvId}:`, error);
		throw error;
	}
};

// Helper function to transform API episode data to our Episode type
const transformEpisodeData = (data: TMDBEpisodeData): Episode => {
	return {
		id: data.id,
		name: data.name || "",
		overview: data.overview || "",
		still_path: data.still_path,
		air_date: data.air_date || "",
		episode_number: data.episode_number || 0,
		season_number: data.season_number || 0,
		vote_average: data.vote_average || 0,
		runtime: data.runtime || 0
	};
};