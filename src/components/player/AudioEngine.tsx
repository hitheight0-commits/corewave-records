"use client";

import React, { useRef, useEffect } from "react";
import { usePlayerStore } from "@/store/usePlayerStore";
import { useAudioEngineStore, globalAudioRef, initAudioContext, resumeAudioContext } from "@/hooks/useAudioEngine";
import { useToastStore } from "@/store/useToastStore";

/**
 * [EXPERTISE] Persistent Audio Orchestrator
 * 
 * This component lives at the root of the application. 
 * It hosts the actual <audio> element and manages its lifecycle 
 * entirely independent of the UI layer's re-renders or state changes.
 */
const AudioEngine = () => {
    const { currentTrack, isPlaying, nextTrack, volume } = usePlayerStore();
    const { setPlaybackState } = useAudioEngineStore();
    const { addToast } = useToastStore();
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Sync global ref for hook access
    useEffect(() => {
        if (audioRef.current) {
            globalAudioRef.current = audioRef.current;
            // The initAudioContext function is defined in useAudioEngine.ts
            // It already calls setPlaybackState with the analyser.
            // The instruction implies a change to the definition of initAudioContext,
            // which is handled in the useAudioEngine.ts file.
            // Here, we just call it as usual.
            initAudioContext(audioRef.current, setPlaybackState);
        }
    }, [setPlaybackState]);

    // Playback Control
    useEffect(() => {
        if (!audioRef.current || !currentTrack) return;

        if (isPlaying) {
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch(e => {
                    if (e.name === 'AbortError') return;
                    console.error("[AUDIO_ENGINE] Playback failed:", e);
                });
            }
        } else {
            audioRef.current.pause();
        }
    }, [isPlaying, currentTrack]);

    // Volume Sync
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    // Metadata Handlers
    const handleTimeUpdate = () => {
        if (!audioRef.current) return;
        const currentTime = audioRef.current.currentTime;
        const duration = audioRef.current.duration;
        const progress = duration ? (currentTime / duration) * 100 : 0;

        setPlaybackState({ currentTime, duration, progress });
    };

    // User Interaction Resume
    useEffect(() => {
        const handleInteraction = () => resumeAudioContext();
        window.addEventListener('mousedown', handleInteraction);
        window.addEventListener('keydown', handleInteraction);
        return () => {
            window.removeEventListener('mousedown', handleInteraction);
            window.removeEventListener('keydown', handleInteraction);
        };
    }, []);

    if (!currentTrack) return null;

    // [EXPERTISE] Smart CORS Resolution
    const isCORSCompatible =
        currentTrack.audioUrl.startsWith('http') &&
        currentTrack.audioUrl.includes('public.blob.vercel-storage.com') ||
        currentTrack.audioUrl.startsWith('/');

    return (
        <audio
            ref={audioRef}
            src={currentTrack.audioUrl}
            onTimeUpdate={handleTimeUpdate}
            onEnded={nextTrack}
            onWaiting={() => setPlaybackState({ isBuffering: true })}
            onCanPlay={() => setPlaybackState({ isBuffering: false })}
            onError={(e) => {
                console.error("[AUDIO_ENGINE] Error detected:", e);
                // Only alert on fatal errors, not minor connectivity dips
                if (audioRef.current?.error?.code === 4) {
                    addToast("Unable to play stream audio source.", "error");
                }
            }}
            preload="auto"
            crossOrigin={isCORSCompatible ? "anonymous" : undefined}
            style={{ display: 'none' }}
        />
    );
};

export default AudioEngine;
