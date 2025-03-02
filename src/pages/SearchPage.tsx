import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/layout/Header';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ShowCard } from '@/components/ui-custom/ShowCard';
import { AnimatedTransition } from '@/components/ui-custom/AnimatedTransition';
import { Skeleton } from '@/components/ui/skeleton';
import { searchTVShows } from '@/lib/tmdb-api';
import { useWatchlistStore } from '@/lib/watchlist-store';
import { Search, X, FilterIcon, TvIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const { isInWatchlist } = useWatchlistStore();
  const location = useLocation();

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['searchTVShows', debouncedQuery],
    queryFn: () => searchTVShows(debouncedQuery),
    enabled: debouncedQuery.length > 0
  });

  const handleClearSearch = () => {
    setSearchQuery('');
    setDebouncedQuery('');
  };

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
          <div className="relative mb-6">
            <div className="relative flex items-center">
              <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for TV shows..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-16 h-12 rounded-full shadow-sm text-base border-border/50 focus-visible:ring-primary/30"
                autoFocus
              />

              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-full hover:bg-muted"
                    onClick={handleClearSearch}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-full hover:bg-muted"
                >
                  <FilterIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {debouncedQuery && isLoading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="flex flex-col space-y-2">
                  <Skeleton className="aspect-[2/3] w-full rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          )}

          {debouncedQuery && searchResults && searchResults.length === 0 && (
            <motion.div 
              className="text-center py-12 px-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground text-base font-medium mb-1">
                No results found
              </p>
              <p className="text-muted-foreground/70 text-sm max-w-md mx-auto">
                We couldn't find any shows matching "{debouncedQuery}". Try a different search term.
              </p>
            </motion.div>
          )}

          {debouncedQuery && searchResults && searchResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium">
                    {searchResults.length} results
                  </p>
                  <p className="text-xs text-muted-foreground">
                    for "{debouncedQuery}"
                  </p>
                </div>
                <div className="text-xs text-muted-foreground/70 bg-muted px-3 py-1 rounded-full">
                  Excluding talk shows, news & reality TV
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {searchResults.map((show, index) => (
                  <AnimatedTransition
                    key={show.id}
                    animation="fade-in"
                    delay={50 * index}
                  >
                    <ShowCard
                      show={show}
                      inWatchlist={isInWatchlist(show.id)}
                    />
                  </AnimatedTransition>
                ))}
              </div>
            </motion.div>
          )}

          {!debouncedQuery && (
            <motion.div 
              className="text-center py-12 px-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <TvIcon className="h-10 w-10 text-muted-foreground/30" />
              </div>
              <p className="text-muted-foreground text-base font-medium mb-1">
                Find your favorite shows
              </p>
              <p className="text-muted-foreground/70 text-sm max-w-md mx-auto">
                Search for TV shows by title, actor, or genre
              </p>
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