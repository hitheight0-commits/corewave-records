"use client";

import React, { useRef, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useToastStore } from "@/store/useToastStore";
import { usePlayerStore } from "@/store/usePlayerStore";
import styles from "./GlobalPlayer.module.css";
import { useUIStore } from "@/store/useUIStore";
import Visualizer from "./Visualizer";
import FullscreenOverlay from "./FullscreenOverlay";

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
        setFavorites
    } = usePlayerStore();



    // ...
    const { data: session } = useSession();
    const { addToast } = useToastStore();
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const isFavorite = currentTrack ? favorites.includes(currentTrack.id) : false;
    const [isMinimized, setIsMinimized] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);




    const { openPlaylistModal } = useUIStore();

    useEffect(() => {
        if (!audioRef.current || !currentTrack) return;

        if (isPlaying) {
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch(e => {
                    if (e.name === 'AbortError') return;
                    console.error("Playback failed", e);
                });
            }
        } else {
            audioRef.current.pause();
        }
    }, [isPlaying, currentTrack]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
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

    const handleTimeUpdate = () => {
        if (!audioRef.current) return;
        setCurrentTime(audioRef.current.currentTime);
        const duration = audioRef.current.duration;
        if (duration) {
            setProgress((audioRef.current.currentTime / duration) * 100);
        }
    };

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!audioRef.current) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / rect.width));
        const duration = audioRef.current.duration;

        if (isFinite(duration) && duration > 0) {
            const newTime = percentage * duration;
            if (isFinite(newTime)) {
                audioRef.current.currentTime = newTime;
                setProgress(percentage * 100);
            }
        }
    };

    const [isBuffering, setIsBuffering] = useState(false);

    const handleWaiting = () => setIsBuffering(true);
    const handleCanPlay = () => setIsBuffering(false);

    const formatTime = (time: number) => {
        if (isNaN(time)) return '0:00';
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!currentTrack) return null;

    return (
        <div className={isMinimized ? styles.minimized : ''}>
            <div className={styles.playerWrapper}>
                <audio
                    ref={audioRef}
                    src={currentTrack.audioUrl}
                    onTimeUpdate={(e) => {
                        // [PERFORMANCE] Throttle updates to ~4fps for UI smoothness, limiting React re-renders
                        if (!audioRef.current) return;
                        const now = Date.now();
                        if (now - (audioRef.current as any).lastUpdate < 250) return;
                        (audioRef.current as any).lastUpdate = now;
                        handleTimeUpdate();
                    }}
                    onEnded={nextTrack}
                    onError={(e) => {
                        console.error("Audio error:", e);
                        addToast("Unable to play stream audio source.", "error");
                        // Optional: Auto-skip to next track on error
                    }}
                    onWaiting={handleWaiting}
                    onCanPlay={handleCanPlay}
                    preload="auto"
                />



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
                            onClick={() => setIsFullscreen(true)}
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
                            {formatTime(currentTime)} / {formatTime(audioRef.current?.duration || 0)}
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

                        <button className={styles.controlBtn} onClick={() => setIsFullscreen(true)} title="Expand Player">
                            <Maximize2 size={18} />
                        </button>
                    </div>
                </div>
            </div>

            <FullscreenOverlay
                track={currentTrack as Track}
                isOpen={isFullscreen}
                onClose={() => setIsFullscreen(false)}
                isPlaying={isPlaying}
                onTogglePlay={togglePlay}
                onNext={nextTrack}
                onPrevious={previousTrack}
                audioRef={audioRef}
            />


        </div>
    );
};

export default GlobalPlayer;
