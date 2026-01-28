"use client";

import { create } from 'zustand';
import { Track } from '@/types';
import { useEffect, useRef } from 'react';

/**
 * [EXPERTISE] Audio Orchestration Store
 * 
 * This store handles the low-level synchronization between the 
 * browser's audio state and the platform's UI layer.
 */
interface AudioEngineState {
    progress: number;
    currentTime: number;
    duration: number;
    isBuffering: boolean;
    error: string | null;
    isInitialized: boolean;
    analyser: AnalyserNode | null;

    setPlaybackState: (state: Partial<AudioEngineState>) => void;
}

export const useAudioEngineStore = create<AudioEngineState>((set) => ({
    progress: 0,
    currentTime: 0,
    duration: 0,
    isBuffering: false,
    error: null,
    isInitialized: false,
    analyser: null,

    setPlaybackState: (state) => set((prev) => ({ ...prev, ...state })),
}));

/**
 * [EXPERTISE] Persistent Audio Element
 * 
 * This singleton ref ensures that the <audio> tag is never re-mounted,
 * preserving the media pipeline and AudioContext connection across 
 * any UI transition (e.g., entering fullscreen).
 */
export const globalAudioRef = { current: null as HTMLAudioElement | null };
export const globalAudioContext = {
    context: null as AudioContext | null,
    analyser: null as AnalyserNode | null,
    source: null as MediaElementAudioSourceNode | null
};

export const initAudioContext = (element: HTMLAudioElement, setStore: (state: any) => void) => {
    if (globalAudioContext.context) return;

    try {
        const context = new (window.AudioContext || (window as any).webkitAudioContext)();
        const analyser = context.createAnalyser();
        analyser.fftSize = 256;

        const source = context.createMediaElementSource(element);
        source.connect(analyser);
        analyser.connect(context.destination);

        globalAudioContext.context = context;
        globalAudioContext.analyser = analyser;
        globalAudioContext.source = source;

        // [EXPERTISE] Signal to the store that the hardware is now synchronized
        setStore({ isInitialized: true, analyser });

        console.log("[AUDIO_ENGINE] Hardware orchestration synchronized.");
    } catch (e) {
        console.warn("[AUDIO_ENGINE_ERROR] Context initialization failed:", e);
    }
};

export const resumeAudioContext = () => {
    if (globalAudioContext.context?.state === 'suspended') {
        globalAudioContext.context.resume();
    }
};
