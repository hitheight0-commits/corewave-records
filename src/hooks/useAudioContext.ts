"use client";

import { useEffect, useRef } from 'react';

// [EXPERTISE] Persistent Audio Pipeline
// In a high-end audio application, the AudioContext must remain persistent
// to avoid "clipping" or "stop-starts" when the UI layer re-renders or shifts.
// Multiple AnalyserNodes or MediaElementSources on one audio tag will crash.

let globalAudioContext: AudioContext | null = null;
let globalAnalyser: AnalyserNode | null = null;
let globalSource: MediaElementAudioSourceNode | null = null;

export function useAudioContext(audioRef: React.RefObject<HTMLAudioElement | null>) {
    const initialized = useRef(false);

    useEffect(() => {
        if (!audioRef.current || initialized.current) return;

        const init = () => {
            if (!audioRef.current || initialized.current) return;

            try {
                // Initialize AudioContext if it doesn't exist
                if (!globalAudioContext) {
                    globalAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                }

                // Initialize Analyser if it doesn't exist
                if (!globalAnalyser) {
                    globalAnalyser = globalAudioContext.createAnalyser();
                    globalAnalyser.fftSize = 256;
                }

                // Initialize Source and Connect ONLY ONCE
                if (!globalSource) {
                    globalSource = globalAudioContext.createMediaElementSource(audioRef.current);
                    globalSource.connect(globalAnalyser);
                    globalAnalyser.connect(globalAudioContext.destination);
                }

                initialized.current = true;
                console.log("[AUDIO_PIPELINE] Global orchestration synchronized.");
            } catch (error) {
                console.warn("[AUDIO_PIPELINE_ERROR] Connection failure:", error);
            }
        };

        // Resume AudioContext on user interaction to satisfy browser policies
        const resume = () => {
            if (globalAudioContext?.state === 'suspended') {
                globalAudioContext.resume();
            }
        };

        init();
        window.addEventListener('mousedown', resume);
        window.addEventListener('keydown', resume);

        return () => {
            window.removeEventListener('mousedown', resume);
            window.removeEventListener('keydown', resume);
        };
    }, [audioRef]);

    return {
        audioContext: globalAudioContext,
        analyser: globalAnalyser,
    };
}
