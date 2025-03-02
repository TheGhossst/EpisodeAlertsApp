import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/layout/Header';
import { ShowCard } from '@/components/ui-custom/ShowCard';
import { AnimatedTransition } from '@/components/ui-custom/AnimatedTransition';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getTVShowDetails } from '@/lib/tmdb-api';
import { TVShow } from '@/lib/types';
import { useWatchlistStore } from '@/lib/watchlist-store';
import { formatDate } from '@/lib/utils';
import { BookmarkIcon, AlertTriangle, PlusCircleIcon, CalendarIcon, ChevronRightIcon } from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function WatchlistPage() {
  const { watchlist, isInWatchlist } = useWatchlistStore();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: watchlistShows, isLoading } = useQuery({
    queryKey: ['watchlistShows', watchlist],
    queryFn: async () => {
      if (watchlist.length === 0) return [];

      const showPromises = watchlist.map(id => getTVShowDetails(id));
      const shows = await Promise.all(showPromises);
      return shows.filter((show): show is TVShow => !!show);
    },
    enabled: watchlist.length > 0
  });

  const sortedShows = React.useMemo(() => {
    if (!watchlistShows) return [];

    return [...watchlistShows].sort((a, b) => {
      const aHasNext = a.next_episode_to_air?.air_date;
      const bHasNext = b.next_episode_to_air?.air_date;

      if (aHasNext && !bHasNext) return -1;
      if (!aHasNext && bHasNext) return 1;
      if (aHasNext && bHasNext) {
        return new Date(aHasNext).getTime() - new Date(bHasNext).getTime();
      }

      return a.name.localeCompare(b.name);
    });
  }, [watchlistShows]);

  const upcomingEpisodes = React.useMemo(() => {
    if (!sortedShows) return [];
    
    return sortedShows
      .filter(show => show.next_episode_to_air)
      .sort((a, b) => {
        const aDate = new Date(a.next_episode_to_air!.air_date).getTime();
        const bDate = new Date(b.next_episode_to_air!.air_date).getTime();
        return aDate - bDate;
      })
      .slice(0, 5);
  }, [sortedShows]);

  return (
    <motion.div 
      className="min-h-screen flex flex-col pb-24"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Header />

      <main className="flex-1 pt-20">
        <div className="px-4 sm:px-6 mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-bold">My Watchlist</h1>
              {!isLoading && watchlist.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {watchlist.length} {watchlist.length === 1 ? 'show' : 'shows'}
                </p>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="text-xs rounded-full px-4 h-9 flex items-center gap-1.5"
              onClick={() => navigate('/search')}
            >
              <PlusCircleIcon className="h-3.5 w-3.5" />
              <span>Add Shows</span>
            </Button>
          </div>

          {isLoading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[...Array(watchlist.length || 4)].map((_, i) => (
                <div key={i} className="flex flex-col space-y-2">
                  <Skeleton className="aspect-[2/3] w-full rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          )}

          {!isLoading && watchlist.length === 0 && (
            <motion.div 
              className="text-center py-12 px-4 bg-card/50 rounded-xl border border-border/50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <BookmarkIcon className="h-10 w-10 text-muted-foreground/30" />
              </div>
              <h3 className="text-base font-medium mb-2">Your watchlist is empty</h3>
              <p className="text-muted-foreground mb-6 text-sm max-w-md mx-auto">
                Add shows to your watchlist to track when new episodes are coming out
              </p>
              <Button
                onClick={() => navigate('/search')}
                className="rounded-full h-10 text-sm px-6"
              >
                Browse Popular Shows
              </Button>
            </motion.div>
          )}

          {!isLoading && sortedShows.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {upcomingEpisodes.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-primary" />
                      <h2 className="text-base font-medium">Upcoming Episodes</h2>
                    </div>
                  </div>

                  <div className="space-y-3 bg-card/50 rounded-xl border border-border/50 p-3">
                    {upcomingEpisodes.map(show => (
                      <motion.div
                        key={`upcoming-${show.id}`}
                        className="p-3 rounded-xl border border-border bg-card hover:bg-card/80 flex items-center gap-3 transition-colors cursor-pointer"
                        onClick={() => navigate(`/show/${show.id}`)}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
                          <img
                            src={`https://image.tmdb.org/t/p/w92${show.poster_path}`}
                            alt={show.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium truncate">{show.name}</h4>
                          <p className="text-xs text-muted-foreground truncate">
                            S{show.next_episode_to_air!.season_number} E{show.next_episode_to_air!.episode_number} - {show.next_episode_to_air!.name || "New Episode"}
                          </p>
                        </div>
                        <div className="text-xs whitespace-nowrap text-primary font-medium">
                          {formatDate(show.next_episode_to_air!.air_date)}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-4">
                <h2 className="text-base font-medium mb-4">My Shows</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {sortedShows.map((show, index) => (
                    <AnimatedTransition
                      key={show.id}
                      animation="fade-in"
                      delay={50 * index}
                    >
                      <ShowCard
                        show={show}
                        inWatchlist={isInWatchlist(show.id)}
                        showNextEpisode={true}
                      />
                    </AnimatedTransition>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {!isLoading && watchlist.length > 0 && sortedShows.length === 0 && (
            <motion.div 
              className="text-center py-12 px-4 bg-card/50 rounded-xl border border-border/50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-8 w-8 text-amber-500" />
              </div>
              <h3 className="text-base font-medium mb-2">Unable to load shows</h3>
              <p className="text-muted-foreground mb-6 text-sm max-w-md mx-auto">
                There was a problem loading your watchlist. Please check your internet connection.
              </p>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="rounded-full h-10 text-sm px-6"
              >
                Try Again
              </Button>
            </motion.div>
          )}
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