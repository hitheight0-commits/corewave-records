'use client';

import { usePlayerStore } from '@/store/usePlayerStore';
import { useSession } from 'next-auth/react';
import { useToastStore } from '@/store/useToastStore';
import { X, Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, Heart, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import styles from './FullScreenPlayer.module.css';

export default function FullScreenPlayer() {
    const {
        currentTrack,
        isPlaying,
        togglePlay,
        nextTrack,
        previousTrack,
        isFullScreen,
        toggleFullScreen,
        isShuffled,
        toggleShuffle,
        repeatMode,
        toggleRepeat,
        favorites,
        toggleFavorite
    } = usePlayerStore();

    const { data: session } = useSession();
    const { addToast } = useToastStore();

    const isLiked = currentTrack ? favorites.includes(currentTrack.id) : false;

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') toggleFullScreen(false);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [toggleFullScreen]);

    // Simplified effect: we rely on global state now
    useEffect(() => {
        if (isFullScreen && currentTrack) {
            // Meta-sync logic if needed, but Zustand handles the core
        }
    }, [currentTrack, isFullScreen]);

    const toggleLike = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!currentTrack) return;
        if (!session) {
            addToast("Authentication required to like tracks. Please log in or sign up.", "info");
            return;
        }
        toggleFavorite(currentTrack.id);
    };

    if (!isFullScreen || !currentTrack) return null;

    return (
        <AnimatePresence>
            <motion.div
                className={styles.overlay}
                initial={{ opacity: 0, y: '100%' }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: '100%' }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
                {/* Background Blur */}
                <div
                    className={styles.backdrop}
                    style={{ backgroundImage: `url(${currentTrack.coverUrl})` }}
                />

                <button className={styles.closeBtn} onClick={() => toggleFullScreen(false)}>
                    <X size={24} />
                </button>

                <div className={styles.content}>
                    <motion.div
                        className={styles.coverWrapper}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <img src={currentTrack.coverUrl} alt={currentTrack.title} className={styles.cover} />
                    </motion.div>

                    <div className={styles.meta}>
                        <h1 className={styles.title}>{currentTrack.title}</h1>
                        <h2 className={styles.artist}>
                            {typeof currentTrack.artist === 'object' ? (currentTrack.artist as any).name : currentTrack.artist}
                        </h2>
                    </div>

                    <div className={styles.controls}>
                        <div className={styles.progressBar}>
                            {/* Placeholder for progress bar - relying on GlobalPlayer for actual audio logic for now */}
                            <div className={styles.progressFill}></div>
                        </div>

                        <div className={styles.buttons}>
                            <button onClick={toggleShuffle} className={isShuffled ? styles.activeBtn : ''}>
                                <Shuffle size={20} />
                            </button>

                            <button onClick={previousTrack}>
                                <SkipBack size={28} />
                            </button>

                            <button className={styles.playBtn} onClick={togglePlay}>
                                {isPlaying ? <Pause size={32} fill="black" /> : <Play size={32} fill="black" style={{ marginLeft: 4 }} />}
                            </button>

                            <button onClick={nextTrack}>
                                <SkipForward size={28} />
                            </button>

                            <button onClick={toggleRepeat} className={repeatMode !== 'none' ? styles.activeBtn : ''}>
                                <Repeat size={20} />
                                {repeatMode === 'one' && <span className={styles.badge}>1</span>}
                            </button>
                        </div>

                        <div className={styles.actions}>
                            <button className={styles.actionBtn} onClick={toggleLike}>
                                <Heart size={24} fill={isLiked ? "#ef4444" : "none"} color={isLiked ? "#ef4444" : "currentColor"} />
                            </button>
                            <button className={styles.actionBtn}>
                                <Plus size={24} />
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
