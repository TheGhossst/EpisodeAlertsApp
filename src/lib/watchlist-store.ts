import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WatchlistState {
  watchlist: number[];
  addToWatchlist: (showId: number) => void;
  removeFromWatchlist: (showId: number) => void;
  isInWatchlist: (showId: number) => boolean;
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      watchlist: [],

      addToWatchlist: (showId: number) => {
        if (!get().isInWatchlist(showId)) {
          set((state) => ({
            watchlist: [...state.watchlist, showId]
          }));
        }
      },

      removeFromWatchlist: (showId: number) => {
        set((state) => ({
          watchlist: state.watchlist.filter((id) => id !== showId)
        }));
      },

      isInWatchlist: (showId: number) => {
        return get().watchlist.includes(showId);
      }
    }),
    {
      name: 'watchlist-storage',
    }
  )
);