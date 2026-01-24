import { create } from 'zustand';
export type { Track } from '@/types';
import { Track } from '@/types';

interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  queue: Track[];
  history: Track[]; // Track history for 'previous' orchestration
  isShuffled: boolean;
  repeatMode: 'none' | 'one' | 'all';
  originalQueue: Track[]; // To support 'Repeat All' properly
  isFullScreen: boolean; // [EXPERTISE] Immersive mode state
  favorites: string[]; // [EXPERTISE] Global favorite registry for real-time UI sync

  setTrack: (track: Track) => void;
  togglePlay: () => void;
  setVolume: (volume: number) => void;
  addToQueue: (track: Track) => void;
  setQueue: (tracks: Track[]) => void;
  nextTrack: () => void;
  previousTrack: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  clearQueue: () => void;
  toggleFullScreen: (state?: boolean) => void;
  toggleFavorite: (trackId: string) => Promise<void>; // [EXPERTISE] Async synchronization
  setFavorites: (trackIds: string[]) => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentTrack: null,
  isPlaying: false,
  volume: 0.8,
  queue: [],
  history: [],
  isShuffled: false,
  repeatMode: 'none',
  originalQueue: [],
  isFullScreen: false,
  favorites: [],

  setTrack: (track) => {
    const { currentTrack, history } = get();

    // [EXPERTISE] If current track is selected, we perform a reset/play orchestration.
    // If it's a new track, we update history and start the playback transition.
    const updatedHistory = currentTrack
      ? [currentTrack, ...history.filter(t => t.id !== currentTrack.id)].slice(0, 50)
      : history;

    set({
      currentTrack: track,
      isPlaying: true,
      history: updatedHistory
    });

    // [EXPERTISE] Real-time analytics signal
    fetch(`/api/tracks/${track.id}/play`, { method: 'POST' }).catch(err => {
      console.warn('Analytics signal lost:', err);
    });

  },

  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

  setVolume: (volume) => set({ volume }),

  addToQueue: (track) => set((state) => ({
    queue: [...state.queue.filter(t => t.id !== track.id), track]
  })),

  setQueue: (tracks) => {
    set({
      queue: tracks,
      originalQueue: [...tracks] // Back up the original orchestration
    });
  },

  toggleShuffle: () => set((state) => ({ isShuffled: !state.isShuffled })),

  toggleRepeat: () => set((state) => {
    const modes: ('none' | 'all' | 'one')[] = ['none', 'all', 'one'];
    const currentIndex = modes.indexOf(state.repeatMode);
    return { repeatMode: modes[(currentIndex + 1) % modes.length] };
  }),

  nextTrack: () => {
    const { queue, currentTrack, repeatMode, isShuffled, originalQueue, setTrack } = get();

    if (repeatMode === 'one' && currentTrack) {
      // [EXPERTISE] Re-triggering same track for 'Repeat One'
      set({ isPlaying: false });
      setTimeout(() => {
        set({ isPlaying: true });
      }, 10);
      return;
    }

    if (queue.length > 0) {
      let nextIndex = 0;
      if (isShuffled) {
        nextIndex = Math.floor(Math.random() * queue.length);
      }

      const nextItem = queue[nextIndex];
      const itemsToShift = queue.slice(0, nextIndex).concat(queue.slice(nextIndex + 1));

      // [EXPERTISE] Maintain history before transition
      if (currentTrack) {
        set((state) => ({
          history: [currentTrack, ...state.history].slice(0, 50)
        }));
      }

      set({
        queue: itemsToShift,
        currentTrack: nextItem,
        isPlaying: true,
      });

      // [EXPERTISE] Real-time analytics signal
      fetch(`/api/tracks/${nextItem.id}/play`, { method: 'POST' }).catch(err => {
        console.warn('Analytics signal lost:', err);
      });
    } else if (repeatMode === 'all' && originalQueue.length > 0) {
      const nextItem = originalQueue[0];
      set({
        queue: originalQueue.slice(1),
        currentTrack: nextItem,
        isPlaying: true
      });

      fetch(`/api/tracks/${nextItem.id}/play`, { method: 'POST' }).catch(err => {
        console.warn('Analytics signal lost:', err);
      });
    } else {
      set({ isPlaying: false });
    }
  },

  previousTrack: () => {
    const { history, currentTrack, setTrack, queue } = get();
    if (history.length > 0) {
      const prev = history[0];
      const updatedHistory = history.slice(1);

      // [EXPERTISE] We push the current track back to the front of the queue
      const updatedQueue = currentTrack ? [currentTrack, ...queue] : queue;

      set({ history: updatedHistory, queue: updatedQueue });
      setTrack(prev);
    }
  },

  clearQueue: () => set({ queue: [], originalQueue: [] }),
  toggleFullScreen: (state) => set((prev) => ({ isFullScreen: state ?? !prev.isFullScreen })),
  setFavorites: (trackIds) => set({ favorites: trackIds }),
  toggleFavorite: async (trackId) => {
    const { favorites } = get();
    const isFav = favorites.includes(trackId);

    // Optimistic UI logic
    if (isFav) {
      set({ favorites: favorites.filter(id => id !== trackId) });
    } else {
      set({ favorites: [...favorites, trackId] });
    }

    try {
      const method = isFav ? 'DELETE' : 'POST';
      const url = isFav ? `/api/favorites/${trackId}` : '/api/favorites';
      const body = isFav ? undefined : JSON.stringify({ trackId });

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body
      });

      if (!res.ok) throw new Error('Sync failed');
    } catch (err) {
      console.error("[EXPERTISE] Favorite sync failed, reverting...", err);
      // Revert on failure
      set({ favorites });
    }
  },
}));
