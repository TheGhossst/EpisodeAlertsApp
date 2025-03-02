import { useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/layout/Header';
import { ShowCard } from '@/components/ui-custom/ShowCard';
import { FeaturedShow } from '@/components/ui-custom/FeaturedShow';
import { Skeleton } from '@/components/ui/skeleton';
import { getPopularTVShows } from '@/lib/tmdb-api';
import { toast } from 'sonner';
import { useWatchlistStore } from '@/lib/watchlist-store';
import { motion } from 'framer-motion';
import { TVShow } from '@/lib/types';
import { ChevronRightIcon, ClockIcon, BellIcon, LayoutGridIcon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function Index() {
  const location = useLocation();
  const { data: shows, isLoading, error } = useQuery({
    queryKey: ['popularShows'],
    queryFn: getPopularTVShows
  });

  const { isInWatchlist } = useWatchlistStore();

  const featuredShow = shows && shows.length > 0
    ? shows[Math.floor(Math.random() * Math.min(shows.length, 5))]
    : null;

  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  
  const upcoming = shows
    ? shows
        .filter((show: TVShow) => {
          if (!show.next_episode_to_air?.air_date) return false;
          
          const airDate = new Date(show.next_episode_to_air.air_date);
          const now = new Date();
          
          return airDate > now && airDate <= thirtyDaysFromNow;
        })
        .sort((a: TVShow, b: TVShow) => {
          const dateA = new Date(a.next_episode_to_air!.air_date);
          const dateB = new Date(b.next_episode_to_air!.air_date);
          return dateA.getTime() - dateB.getTime();
        })
    : [];

  const popular = shows?.slice(0, 6) || [];

  // Scroll handling
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (error) {
      toast.error("Failed to load TV shows. Please check your connection.");
    }
  }, [error]);

  return (
    <motion.div
      className="min-h-screen flex flex-col pb-24"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Header />

      <main className="flex-1 mt-14" ref={mainRef}>
        {isLoading ? (
          <div className="h-[60vh] bg-muted animate-pulse rounded-b-3xl" />
        ) : featuredShow ? (
          <FeaturedShow show={featuredShow} />
        ) : null}

        <section className="py-6">
          <div className="px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-between mb-4"
            >
              <div>
                <h2 className="text-xl font-bold">Upcoming Episodes</h2>
                <p className="text-xs text-muted-foreground">Next 30 Days</p>
              </div>
              {upcoming.length > 0 && (
                <Link to="/search" className="text-primary text-sm flex items-center">
                  View all <ChevronRightIcon className="h-4 w-4 ml-1" />
                </Link>
              )}
            </motion.div>

            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex flex-col space-y-2">
                    <Skeleton className="h-52 w-full rounded-2xl" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ))}
              </div>
            ) : upcoming.length > 0 ? (
              <div className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
                <div className="flex gap-4 min-w-full">
                  {upcoming.slice(0, 6).map((show, index) => (
                    <motion.div
                      key={show.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                      className="w-36 sm:w-40 flex-shrink-0"
                    >
                      <ShowCard
                        show={show}
                        inWatchlist={isInWatchlist(show.id)}
                        showNextEpisode={true}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 bg-card/50 rounded-xl border border-border/50">
                <div className="flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                    <ClockIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground text-sm font-medium">No upcoming episodes</p>
                  <p className="text-muted-foreground text-xs mt-1 max-w-[250px]">
                    Check back later or add more shows to your watchlist
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="py-8 bg-secondary/50 rounded-t-3xl rounded-b-3xl mx-2 my-2">
          <div className="px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-between mb-4"
            >
              <div>
                <h2 className="text-xl font-bold">Popular Shows</h2>
                <p className="text-xs text-muted-foreground">
                  Excluding talk shows, news, and reality TV
                </p>
              </div>
              <Link to="/search" className="text-primary text-sm flex items-center">
                View all <ChevronRightIcon className="h-4 w-4 ml-1" />
              </Link>
            </motion.div>

            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex flex-col space-y-2">
                    <Skeleton className="h-52 w-full rounded-2xl" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
                <div className="flex gap-4 min-w-full">
                  {popular.slice(0, 6).map((show, index) => (
                    <motion.div
                      key={show.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                      className="w-36 sm:w-40 flex-shrink-0"
                    >
                      <ShowCard
                        show={show}
                        inWatchlist={isInWatchlist(show.id)}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="py-8 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center mb-6"
          >
            <h2 className="text-xl font-bold mb-2">Never Miss Your Shows</h2>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Track your favorite TV shows and get notified about new episodes
            </p>
          </motion.div>

          <div className="space-y-4 max-w-md mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center p-4 bg-card rounded-2xl shadow-sm border border-border/10"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                <ClockIcon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-base font-semibold">Real-time Countdowns</h3>
                <p className="text-xs text-muted-foreground">
                  Watch as the countdown ticks towards your next episode
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="flex items-center p-4 bg-card rounded-2xl shadow-sm border border-border/10"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                <BellIcon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-base font-semibold">Custom Notifications</h3>
                <p className="text-xs text-muted-foreground">
                  Get alerts about new episodes
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="flex items-center p-4 bg-card rounded-2xl shadow-sm border border-border/10"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                <LayoutGridIcon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-base font-semibold">Show Library</h3>
                <p className="text-xs text-muted-foreground">
                  Access details about your favorite shows
                </p>
              </div>
            </motion.div>
          </div>
        </section>
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