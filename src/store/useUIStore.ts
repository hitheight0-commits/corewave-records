import { create } from 'zustand';
import { Track } from '@/types';

interface UIState {
    isPlaylistModalOpen: boolean;
    playlistModalTrack: Track | null;
    openPlaylistModal: (track: Track) => void;
    closePlaylistModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
    isPlaylistModalOpen: false,
    playlistModalTrack: null,
    openPlaylistModal: (track) => set({ isPlaylistModalOpen: true, playlistModalTrack: track }),
    closePlaylistModal: () => set({ isPlaylistModalOpen: false, playlistModalTrack: null }),
}));
