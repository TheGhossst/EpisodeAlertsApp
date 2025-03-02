
export interface TVShow {
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  first_air_date: string;
  next_episode_to_air?: Episode;
  last_episode_to_air?: Episode;
  number_of_seasons: number;
  status: string;
  genres: Genre[];
  networks: Network[];
  created_by: Creator[];
}

export interface Episode {
  id: number;
  name: string;
  overview: string;
  still_path: string;
  air_date: string;
  episode_number: number;
  season_number: number;
  vote_average: number;
  runtime?: number;
}

export interface Season {
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  air_date: string;
  season_number: number;
  episode_count: number;
  episodes?: Episode[];
}

export interface Genre {
  id: number;
  name: string;
}

export interface Network {
  id: number;
  name: string;
  logo_path: string;
}

export interface Creator {
  id: number;
  name: string;
  profile_path: string;
}
