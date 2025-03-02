import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { TVShow } from '@/lib/types';
import { getImageUrl } from '@/lib/tmdb-api';
import { CountdownTimer } from './CountdownTimer';
import { useWatchlistStore } from '@/lib/watchlist-store';
import { BookmarkIcon, BookmarkPlusIcon, StarIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatYear, formatDate } from '@/lib/utils';

interface ShowCardProps {
  show: TVShow;
  className?: string;
  featured?: boolean;
  inWatchlist?: boolean;
  showNextEpisode?: boolean;
}

export const ShowCard: React.FC<ShowCardProps> = ({
  show,
  className,
  featured = false,
  inWatchlist = false,
  showNextEpisode = false
}) => {
  const hasNextEpisode = show.next_episode_to_air && show.next_episode_to_air.air_date;
  const { addToWatchlist, removeFromWatchlist } = useWatchlistStore();

  const handleWatchlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (inWatchlist) {
      removeFromWatchlist(show.id);
    } else {
      addToWatchlist(show.id);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Link
        to={`/show/${show.id}`}
        className={cn(
          "block relative overflow-hidden rounded-2xl border border-border/40 bg-card transition-all shadow-sm h-full",
          className
        )}
      >
        <div className="relative aspect-[2/3] overflow-hidden bg-muted">
          <img
            src={getImageUrl(show.poster_path, 'w500')}
            alt={show.name}
            loading="lazy"
            className="h-full w-full object-cover transition-all"
          />

          {hasNextEpisode && showNextEpisode && (
            <div className="absolute bottom-0 left-0 right-0 p-2.5 glass-effect">
              <div className="flex flex-col space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-white/80 font-medium">Next Episode</p>
                  <div className="bg-primary/20 rounded-full px-2 py-0.5">
                    <p className="text-[10px] text-primary-foreground font-medium">
                      S{show.next_episode_to_air?.season_number} E{show.next_episode_to_air?.episode_number}
                    </p>
                  </div>
                </div>
                <p className="text-xs font-medium text-white truncate">
                  {show.next_episode_to_air?.name || "New Episode"}
                </p>
                <p className="text-xs text-white/70">
                  {formatDate(show.next_episode_to_air.air_date)}
                </p>
                <CountdownTimer
                  airDate={show.next_episode_to_air.air_date}
                  compact={true}
                  className="text-primary-foreground"
                />
              </div>
            </div>
          )}

          <div className="absolute top-2 right-2">
            <div className="flex items-center rounded-full bg-black/70 backdrop-blur-sm px-2 py-0.5 border border-white/10">
              <StarIcon className="w-3 h-3 text-yellow-400 mr-1 fill-yellow-400" />
              <span className="text-xs font-medium text-white">{show.vote_average.toFixed(1)}</span>
            </div>
          </div>

          <motion.button
            className={`absolute top-2 left-2 w-8 h-8 flex items-center justify-center rounded-full ${
              inWatchlist 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'bg-black/50 text-white border border-white/20 backdrop-blur-sm'
            }`}
            onClick={handleWatchlistToggle}
            whileTap={{ scale: 0.9 }}
          >
            {inWatchlist ? (
              <BookmarkIcon className="h-4 w-4" fill="currentColor" />
            ) : (
              <BookmarkPlusIcon className="h-4 w-4" />
            )}
          </motion.button>
        </div>

        <div className="p-3">
          <h3 className="font-medium text-sm mb-1 line-clamp-1">{show.name}</h3>
          {featured ? (
            <p className="text-muted-foreground text-xs line-clamp-2 mb-2">{show.overview}</p>
          ) : null}
          <div className="flex items-center text-xs text-muted-foreground">
            <span className="font-medium">{formatYear(show.first_air_date)}</span>
            <span className="mx-1.5 opacity-50">•</span>
            <span>{show.number_of_seasons} Season{show.number_of_seasons !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};