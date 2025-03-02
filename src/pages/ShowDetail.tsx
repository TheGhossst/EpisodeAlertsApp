import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { AnimatedTransition } from '@/components/ui-custom/AnimatedTransition';
import { CountdownTimer } from '@/components/ui-custom/CountdownTimer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getTVShowDetails, getImageUrl, getSeasonDetails } from '@/lib/tmdb-api';
import { Season, Episode } from '@/lib/types';
import { toast } from '@/components/ui/use-toast';
import { useWatchlistStore } from '@/lib/watchlist-store';
import { BookmarkIcon, BookmarkPlusIcon, ChevronLeft, StarIcon, CalendarIcon, InfoIcon, ClockIcon } from 'lucide-react';
import { formatDate, formatYear } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';

export default function ShowDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);

  const { data: show, isLoading, error } = useQuery({
    queryKey: ['showDetails', id],
    queryFn: () => getTVShowDetails(Number(id)),
    enabled: !!id && !isNaN(Number(id))
  });

  // Fetch all seasons data
  const { data: seasons, isLoading: seasonsLoading } = useQuery({
    queryKey: ['showSeasons', id],
    queryFn: async () => {
      if (!show) return [];

      // Create an array of promises to fetch each season
      const seasonPromises = Array.from({ length: show.number_of_seasons }, (_, i) =>
        getSeasonDetails(show.id, i + 1)
      );

      // Wait for all promises to resolve
      const results = await Promise.all(seasonPromises);

      // Filter out any undefined results
      return results.filter((season): season is Season => !!season);
    },
    enabled: !!show && show.number_of_seasons > 0
  });

  // Set the first season as selected by default when seasons data is loaded
  useEffect(() => {
    if (seasons && seasons.length > 0 && selectedSeason === null) {
      setSelectedSeason(seasons[0].season_number);
    }
  }, [seasons, selectedSeason]);

  // Fetch episodes for the selected season
  const { data: selectedSeasonData, isLoading: episodesLoading } = useQuery({
    queryKey: ['seasonEpisodes', id, selectedSeason],
    queryFn: () => {
      if (!show || selectedSeason === null) return null;
      return getSeasonDetails(show.id, selectedSeason);
    },
    enabled: !!show && selectedSeason !== null
  });

  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlistStore();
  const inWatchlist = id ? isInWatchlist(Number(id)) : false;

  const handleWatchlistToggle = () => {
    if (!show) return;

    if (inWatchlist) {
      removeFromWatchlist(show.id);
      toast({
        title: "Removed from Watchlist",
        description: `${show.name} has been removed from your watchlist.`,
      });
    } else {
      addToWatchlist(show.id);
      toast({
        title: "Added to Watchlist",
        description: `${show.name} has been added to your watchlist.`,
      });
    }
  };

  // Handle season selection
  const handleSeasonSelect = (seasonNumber: number) => {
    setSelectedSeason(seasonNumber);
  };

  if (error) {
    toast({
      title: "Error",
      description: "Failed to load show details. Please try again later.",
      variant: "destructive"
    });
  }

  if (isLoading) {
    return (
      <motion.div 
        className="min-h-screen flex flex-col pb-24"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Header />
        <div className="flex-1 pt-16">
          <Skeleton className="w-full h-[40vh]" />
          <div className="-mt-20 relative z-10 px-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Skeleton className="w-full aspect-[2/3] rounded-xl" />
              </div>
              <div className="col-span-2 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!show) {
    return (
      <motion.div 
        className="min-h-screen flex flex-col pb-24"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Header />
        <div className="flex-1 flex items-center justify-center pt-16">
          <div className="text-center px-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <InfoIcon className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <h1 className="text-xl font-bold mb-2">Show Not Found</h1>
            <p className="text-muted-foreground mb-6 text-sm">The show you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/')} className="rounded-full px-6">Back to Home</Button>
          </div>
        </div>
      </motion.div>
    );
  }

  const hasNextEpisode = show.next_episode_to_air && show.next_episode_to_air.air_date;

  return (
    <motion.div 
      className="min-h-screen flex flex-col pb-24"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <main className="flex-1">
        <div className="relative w-full h-[45vh]">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/20" />
          <img
            src={getImageUrl(show.backdrop_path, 'original')}
            alt={show.name}
            className="w-full h-full object-cover"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 left-4 h-10 w-10 rounded-full bg-background/30 backdrop-blur-md hover:bg-background/50"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </div>

        <div className="-mt-28 relative z-10 px-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
              <AnimatedTransition animation="slide-up">
                <div className="rounded-xl overflow-hidden shadow-lg border border-border/50 bg-card">
                  <img
                    src={getImageUrl(show.poster_path, 'w500')}
                    alt={show.name}
                    className="w-full aspect-[2/3] object-cover"
                  />
                </div>
              </AnimatedTransition>
            </div>

            <div className="col-span-2">
              <AnimatedTransition animation="slide-up" delay={100}>
                <h1 className="text-xl font-bold mb-2 text-white drop-shadow-md">{show.name}</h1>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {show.genres.slice(0, 3).map((genre) => (
                    <Badge key={genre.id} variant="secondary" className="text-xs font-medium">
                      {genre.name}
                    </Badge>
                  ))}
                </div>

                <div className="mb-3 flex items-center gap-2">
                  <div className="flex items-center bg-background/70 backdrop-blur-sm px-2 py-1 rounded-full text-xs">
                    <StarIcon className="h-3.5 w-3.5 text-yellow-400 mr-1" fill="currentColor" />
                    <span className="font-medium">{show.vote_average.toFixed(1)}</span>
                  </div>
                  
                  <div className="flex items-center bg-background/70 backdrop-blur-sm px-2 py-1 rounded-full text-xs">
                    <span>{formatYear(show.first_air_date)}</span>
                  </div>
                  
                  <div className="flex items-center bg-background/70 backdrop-blur-sm px-2 py-1 rounded-full text-xs">
                    <span>{show.number_of_seasons} Season{show.number_of_seasons !== 1 ? 's' : ''}</span>
                  </div>
                </div>

                <Button
                  onClick={handleWatchlistToggle}
                  variant={inWatchlist ? "default" : "secondary"}
                  size="sm"
                  className="rounded-full mb-3 text-xs px-4 py-1 h-8 shadow-md"
                >
                  {inWatchlist ? (
                    <>
                      <BookmarkIcon className="h-3.5 w-3.5 mr-1.5" fill="currentColor" />
                      In Watchlist
                    </>
                  ) : (
                    <>
                      <BookmarkPlusIcon className="h-3.5 w-3.5 mr-1.5" />
                      Add to Watchlist
                    </>
                  )}
                </Button>

                <p className="text-xs line-clamp-3 text-white/90 drop-shadow-sm">{show.overview}</p>
              </AnimatedTransition>
            </div>
          </div>

          <div className="mt-6">
            {hasNextEpisode && (
              <AnimatedTransition animation="slide-up" delay={200}>
                <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 mb-4">
                  <div className="flex flex-col">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 mb-2">
                          <CalendarIcon className="h-4 w-4 text-primary" />
                          <h3 className="text-sm font-semibold">Next Episode</h3>
                        </div>
                        <p className="text-sm font-medium mb-1">
                          S{show.next_episode_to_air.season_number} E{show.next_episode_to_air.episode_number} - {show.next_episode_to_air.name}
                        </p>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(show.next_episode_to_air.air_date)}
                        </div>
                      </div>
                      
                      <div className="flex items-center bg-primary/10 px-2.5 py-1.5 rounded-lg">
                        <ClockIcon className="h-3.5 w-3.5 text-primary mr-1.5" />
                        <CountdownTimer airDate={show.next_episode_to_air.air_date} />
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedTransition>
            )}

            <AnimatedTransition animation="slide-up" delay={300}>
              <Tabs defaultValue="seasons" className="mt-2">
                <TabsList className="grid grid-cols-2 w-full mb-4 rounded-lg">
                  <TabsTrigger value="seasons" className="rounded-lg">Seasons</TabsTrigger>
                  <TabsTrigger value="episodes" className="rounded-lg">Episodes</TabsTrigger>
                </TabsList>

                <TabsContent value="seasons" className="space-y-3">
                  {seasonsLoading ? (
                    // Show skeletons while loading
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex gap-3 p-3 rounded-lg border border-border/50">
                        <Skeleton className="w-12 h-16 rounded-lg" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-24 mb-2" />
                          <Skeleton className="h-3 w-32 mb-2" />
                          <Skeleton className="h-3 w-full" />
                        </div>
                      </div>
                    ))
                  ) : seasons && seasons.length > 0 ? (
                    // Show actual seasons data
                    seasons.map((season) => (
                      <motion.div
                        key={season.id}
                        className={`flex gap-3 p-3 rounded-xl border ${selectedSeason === season.season_number ? 'border-primary bg-primary/5' : 'border-border/50 hover:border-primary/50 bg-card/50'} transition-all cursor-pointer`}
                        onClick={() => handleSeasonSelect(season.season_number)}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <div className="w-14 rounded-lg overflow-hidden shadow-sm">
                          <img
                            src={getImageUrl(season.poster_path, 'w200')}
                            alt={season.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1">
                          <h3 className="text-sm font-medium mb-1">{season.name}</h3>
                          <p className="text-muted-foreground text-xs mb-1">
                            {season.episode_count} Episodes • {season.air_date ? new Date(season.air_date).getFullYear() : 'TBA'}
                          </p>
                          <p className="text-xs line-clamp-2 text-muted-foreground">
                            {season.overview || 'No overview available.'}
                          </p>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    // Fallback message if no seasons data
                    <div className="text-center p-6 bg-card/50 rounded-xl border border-border/50">
                      <p className="text-sm text-muted-foreground">No season information available.</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="episodes" className="space-y-3">
                  {episodesLoading ? (
                    // Show skeletons while loading episodes
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="p-3 rounded-lg border border-border/50">
                        <div className="flex items-center justify-between mb-1">
                          <Skeleton className="h-4 w-40" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                        <Skeleton className="h-3 w-24 mb-2" />
                        <Skeleton className="h-3 w-full" />
                      </div>
                    ))
                  ) : selectedSeasonData && selectedSeasonData.episodes && selectedSeasonData.episodes.length > 0 ? (
                    // Show episodes for the selected season
                    <>
                      <div className="mb-3 px-1">
                        <h3 className="text-sm font-medium flex items-center gap-1.5">
                          <CalendarIcon className="h-4 w-4 text-primary" />
                          {selectedSeasonData.name} ({selectedSeasonData.episodes.length} Episodes)
                        </h3>
                      </div>

                      {selectedSeasonData.episodes.map((episode: Episode) => (
                        <motion.div
                          key={episode.id}
                          className={`p-4 rounded-xl border ${show?.next_episode_to_air &&
                              show.next_episode_to_air.season_number === episode.season_number &&
                              show.next_episode_to_air.episode_number === episode.episode_number
                              ? 'border-primary/50 bg-primary/5'
                              : 'border-border/50 bg-card/50'
                            }`}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <h4 className="text-sm font-medium line-clamp-1">
                              E{episode.episode_number} - {episode.name}
                            </h4>
                            {show?.next_episode_to_air &&
                              show.next_episode_to_air.season_number === episode.season_number &&
                              show.next_episode_to_air.episode_number === episode.episode_number ? (
                              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">
                                Upcoming
                              </Badge>
                            ) : new Date(episode.air_date) <= new Date() ? (
                              <Badge variant="outline" className="bg-secondary text-secondary-foreground text-xs">
                                Aired
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">
                                Future
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground mb-1.5">
                            {formatDate(episode.air_date)}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {episode.overview || "No overview available."}
                          </p>
                        </motion.div>
                      ))}
                    </>
                  ) : selectedSeason === null ? (
                    // No season selected
                    <div className="text-center p-6 bg-card/50 rounded-xl border border-border/50">
                      <p className="text-sm text-muted-foreground">
                        Select a season to view episodes.
                      </p>
                    </div>
                  ) : (
                    // No episodes available for the selected season
                    <div className="text-center p-6 bg-card/50 rounded-xl border border-border/50">
                      <p className="text-sm text-muted-foreground">
                        No episodes available for {seasons?.find(s => s.season_number === selectedSeason)?.name || `Season ${selectedSeason}`}.
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </AnimatedTransition>
          </div>
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-lg border-t border-border/50 py-2 px-4 shadow-lg">
        <div className="flex items-center justify-around max-w-md mx-auto">
          <Link
            to="/"
            className={`flex flex-col items-center gap-1 p-2 rounded-full ${location.pathname === '/' ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <motion.div whileTap={{ scale: 0.9 }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </motion.div>
            <span className="text-xs">Home</span>
          </Link>

          <Link
            to="/search"
            className={`flex flex-col items-center gap-1 p-2 rounded-full ${location.pathname === '/search' ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <motion.div whileTap={{ scale: 0.9 }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </motion.div>
            <span className="text-xs">Search</span>
          </Link>

          <Link
            to="/watchlist"
            className={`flex flex-col items-center gap-1 p-2 rounded-full ${location.pathname === '/watchlist' ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <motion.div whileTap={{ scale: 0.9 }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </motion.div>
            <span className="text-xs">Watchlist</span>
          </Link>
        </div>
      </nav>
    </motion.div>
  );
};