"use client";

import React, { useRef, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useToastStore } from "@/store/useToastStore";
import { usePlayerStore } from "@/store/usePlayerStore";
import styles from "./GlobalPlayer.module.css";
import { useUIStore } from "@/store/useUIStore";
import Visualizer from "./Visualizer";
import FullscreenOverlay from "./FullscreenOverlay";
import { useAudioEngineStore, globalAudioRef, resumeAudioContext } from "@/hooks/useAudioEngine";

import { Track } from "@/types";
import {
    Shuffle,
    Repeat,
    Repeat1,
    PlusCircle,
    SkipBack,
    SkipForward,
    Play,
    Pause,
    Heart,
    Maximize2,
    Volume2,
    ListMusic,
    Loader2
} from "lucide-react";

const GlobalPlayer = () => {
    const {
        currentTrack,
        isPlaying,
        togglePlay,
        volume,
        setVolume,
        nextTrack,
        previousTrack,
        isShuffled,
        toggleShuffle,
        repeatMode,
        toggleRepeat,
        queue,
        favorites,
        toggleFavorite,
        setFavorites,
        isFullScreen,
        toggleFullScreen,
    } = usePlayerStore();



    // ...
    const { data: session } = useSession();
    const { addToast } = useToastStore();

    // [EXPERTISE] Consume Centralized Audio State
    const {
        currentTime,
        duration,
        progress,
        isBuffering
    } = useAudioEngineStore();

    const isFavorite = currentTrack ? favorites.includes(currentTrack.id) : false;
    const [isMinimized, setIsMinimized] = useState(false);




    const { openPlaylistModal } = useUIStore();

    useEffect(() => {
        // This effect is now handled by the AudioEngine directly setting the volume on globalAudioRef.
        // If local UI state needs to update the engine, it should call a function from useAudioEngineStore.
        // For now, the volume slider directly calls setVolume from usePlayerStore, which then updates the engine.
    }, [volume]);

    useEffect(() => {
        if (!session) {
            setFavorites([]);
            return;
        }
        fetch('/api/favorites')
            .then(res => res.json())
            .then(data => {
                const favs = (data.favorites || []).map((f: any) => f.track.id);
                setFavorites(favs);
            })
            .catch(() => setFavorites([]));
    }, [session, setFavorites]);

    const handleToggleFavorite = () => {
        if (!currentTrack) return;
        if (!session) {
            addToast("Authentication required to like tracks. Please log in or sign up.", "info");
            return;
        }
        toggleFavorite(currentTrack.id);
    };

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!globalAudioRef.current) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / rect.width));
        const duration = globalAudioRef.current.duration;

        if (isFinite(duration) && duration > 0) {
            const newTime = percentage * duration;
            if (isFinite(newTime)) {
                globalAudioRef.current.currentTime = newTime;
            }
        }
    };


    const formatTime = (time: number) => {
        if (isNaN(time)) return '0:00';
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!currentTrack) return null;

    // [EXPERTISE] Smart CORS Orchestration
    // Some external streams (like the mock SoundHelix ones) do not support CORS.
    // If we force crossOrigin="anonymous", the browser blocks playback entirely.
    // We only enable it for our trusted Vercel Blob store or local development assets.
    const isCORSCompatible =
        currentTrack.audioUrl.startsWith('http') &&
        currentTrack.audioUrl.includes('public.blob.vercel-storage.com') ||
        currentTrack.audioUrl.startsWith('/');

    return (
        <div className={isMinimized ? styles.minimized : ''}>
            <div className={styles.playerWrapper}>
                {/* [EXPERTISE] Audio Engine is now external and persistent. 
                    No local <audio> tag here ensures UI re-renders don't touch playback. */}



                <div className={styles.progressBarContainer} onClick={handleProgressClick}>
                    <div className={styles.progressBar}>
                        <div className={styles.progress} style={{ width: `${progress}%` }}></div>
                    </div>
                </div>

                <div className={styles.playerContainer}>
                    {/* Left: Track Info */}
                    <div className={styles.trackInfo}>
                        <img
                            src={currentTrack.coverUrl}
                            alt={currentTrack.title}
                            className={styles.cover}
                            onClick={() => toggleFullScreen(true)}
                            style={{ cursor: 'pointer' }}
                        />
                        <div className={styles.details}>
                            <span className={styles.title}>{currentTrack.title}</span>
                            <span className={styles.artistNamePlayer}>{typeof currentTrack.artist === 'object' ? (currentTrack.artist as any).name : currentTrack.artist}</span>
                        </div>
                        <button
                            className={`${styles.controlBtn} ${isFavorite ? styles.activeBtn : ''}`}
                            onClick={handleToggleFavorite}
                            style={{ marginLeft: '0.5rem' }}
                        >
                            <Heart size={18} fill={isFavorite ? "#ef4444" : "none"} color={isFavorite ? "#ef4444" : "currentColor"} />
                        </button>
                    </div>

                    {/* Center: Controls & Timestamps */}
                    <div className={styles.controlsWrapper}>
                        <div className={styles.controls}>
                            <button
                                className={`${styles.controlBtn} ${isShuffled ? styles.activeBtn : ''}`}
                                onClick={toggleShuffle}
                            >
                                <Shuffle size={16} />
                            </button>

                            <button className={styles.controlBtn} onClick={previousTrack}>
                                <SkipBack size={20} fill="currentColor" />
                            </button>


                            <button onClick={togglePlay} className={styles.playBtn}>
                                {isBuffering ? (
                                    <Loader2 className="animate-spin" size={20} color="var(--background)" />
                                ) : isPlaying ? (
                                    <Pause fill="currentColor" size={20} />
                                ) : (
                                    <Play fill="currentColor" size={20} style={{ marginLeft: '2px' }} />
                                )}
                            </button>

                            <button className={styles.controlBtn} onClick={nextTrack}>
                                <SkipForward size={20} fill="currentColor" />
                            </button>

                            <button
                                className={`${styles.controlBtn} ${repeatMode !== 'none' ? styles.activeBtn : ''}`}
                                onClick={toggleRepeat}
                            >
                                {repeatMode === 'one' ? <Repeat1 size={16} /> : <Repeat size={16} />}
                            </button>
                        </div>
                    </div>

                    {/* Right: Volume & Extras */}
                    <div className={styles.extra}>
                        <div className={styles.timeDisplay}>
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </div>

                        <button className={styles.playlistBtn} onClick={() => {
                            if (!session) {
                                addToast("Authentication required to manage playlists. Please log in or sign up.", "info");
                                return;
                            }
                            if (currentTrack) openPlaylistModal(currentTrack);
                        }}>
                            <ListMusic size={16} />
                            <span>Add to Playlist</span>
                        </button>

                        <div className={styles.volumeControl}>
                            <Volume2 size={16} color="rgba(255,255,255,0.6)" />
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={volume}
                                onChange={(e) => setVolume(parseFloat(e.target.value))}
                                className={styles.volumeSlider}
                                style={{
                                    background: `linear-gradient(to right, #fff ${volume * 100}%, rgba(255, 255, 255, 0.1) ${volume * 100}%)`
                                }}
                            />
                        </div>

                        <button className={styles.controlBtn} onClick={() => toggleFullScreen(true)} title="Expand Player">
                            <Maximize2 size={18} />
                        </button>
                    </div>
                </div>
            </div>

            <FullscreenOverlay
                track={currentTrack as Track}
                isOpen={isFullScreen}
                onClose={() => toggleFullScreen(false)}
                isPlaying={isPlaying}
                onTogglePlay={() => {
                    resumeAudioContext();
                    togglePlay();
                }}
                onNext={nextTrack}
                onPrevious={previousTrack}
                isCORSCompatible={isCORSCompatible}
            />


        </div>
    );
};

export default GlobalPlayer;
