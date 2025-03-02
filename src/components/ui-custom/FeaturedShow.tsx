import React from 'react';
import { Link } from 'react-router-dom';
import { TVShow } from '@/lib/types';
import { getImageUrl } from '@/lib/tmdb-api';
import { CountdownTimer } from './CountdownTimer';
import { useWatchlistStore } from '@/lib/watchlist-store';
import { BookmarkIcon, BookmarkPlusIcon, InfoIcon, StarIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatYear } from '@/lib/utils';

interface FeaturedShowProps {
  show: TVShow;
}

export const FeaturedShow: React.FC<FeaturedShowProps> = ({ show }) => {
  const hasNextEpisode = show.next_episode_to_air && show.next_episode_to_air.air_date;
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlistStore();
  const inWatchlist = isInWatchlist(show.id);

  const handleWatchlistToggle = () => {
    if (inWatchlist) {
      removeFromWatchlist(show.id);
    } else {
      addToWatchlist(show.id);
    }
  };

  return (
    <motion.div
      className="relative w-full overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent z-10" />

      <div className="relative h-[70vh] sm:h-[60vh] w-full">
        <img
          src={getImageUrl(show.backdrop_path, 'original')}
          alt={show.name}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="absolute inset-0 z-20 flex items-end">
        <div className="pb-12 px-4 w-full">
          <div className="max-w-md">
            <motion.div 
              className="inline-flex items-center rounded-full bg-black/70 backdrop-blur-sm px-3 py-1 mb-3 border border-white/10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              <StarIcon className="w-3.5 h-3.5 text-yellow-400 mr-1.5 fill-yellow-400" />
              <span className="text-sm font-medium text-white mr-2">{show.vote_average.toFixed(1)}</span>
              <span className="text-xs text-white/70">{formatYear(show.first_air_date)}</span>
              <span className="mx-1.5 text-white/40">•</span>
              <span className="text-xs text-white/70">{show.number_of_seasons} Season{show.number_of_seasons !== 1 ? 's' : ''}</span>
            </motion.div>
            
            <motion.h1
              className="text-3xl font-bold text-white mb-2 text-balance"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              {show.name}
            </motion.h1>

            <motion.p
              className="text-sm text-white/90 mb-5 line-clamp-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              {show.overview}
            </motion.p>

            {hasNextEpisode && (
              <motion.div
                className="mb-6 p-3 rounded-xl bg-black/30 backdrop-blur-sm border border-white/10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
              >
                <div className="text-white/80 text-xs mb-1 font-medium">
                  NEXT EPISODE IN:
                </div>
                <CountdownTimer
                  airDate={show.next_episode_to_air.air_date}
                  className="text-white text-lg font-semibold"
                />
              </motion.div>
            )}

            <motion.div
              className="flex gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="flex-1 bg-primary text-white py-3 px-4 rounded-full text-sm font-medium shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
              >
                <Link to={`/show/${show.id}`} className="flex items-center w-full h-full justify-center">
                  <InfoIcon className="w-4 h-4 mr-1.5" />
                  View Details
                </Link>
              </motion.button>

              <motion.button
                className={`p-3 rounded-full flex items-center justify-center ${
                  inWatchlist 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                    : 'bg-white/10 text-white backdrop-blur-sm border border-white/10'
                }`}
                whileTap={{ scale: 0.95 }}
                onClick={handleWatchlistToggle}
              >
                {inWatchlist ? (
                  <BookmarkIcon className="w-5 h-5" fill="currentColor" />
                ) : (
                  <BookmarkPlusIcon className="w-5 h-5" />
                )}
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};