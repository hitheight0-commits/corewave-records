"use client";

import { useEffect, useRef } from "react";

interface VisualizerProps {
    audioRef: React.RefObject<HTMLAudioElement | null>;
    isPlaying: boolean;
}

const Visualizer = ({ audioRef, isPlaying }: VisualizerProps) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const analyzerRef = useRef<AnalyserNode | null>(null);
    const animationRef = useRef<number | null>(null);
    const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

    useEffect(() => {
        if (!audioRef.current || analyzerRef.current) return;

        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const analyzer = audioContext.createAnalyser();

        // Connect the source if it hasn't been connected yet
        try {
            const source = audioContext.createMediaElementSource(audioRef.current);
            source.connect(analyzer);
            analyzer.connect(audioContext.destination);
            sourceRef.current = source;
        } catch (e) {
            // Already connected usually
            console.warn("Visualizer connection warning:", e);
        }

        analyzer.fftSize = 256;
        analyzerRef.current = analyzer;

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [audioRef]);

    useEffect(() => {
        if (!isPlaying || !analyzerRef.current || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        const analyzer = analyzerRef.current;
        const bufferLength = analyzer.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        if (!ctx) return;

        const draw = () => {
            animationRef.current = requestAnimationFrame(draw);
            analyzer.getByteFrequencyData(dataArray);

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const barWidth = (canvas.width / bufferLength) * 2;
            let barHeight;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                barHeight = (dataArray[i] / 255) * canvas.height;

                // Branded gradient for the visualizer
                const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
                gradient.addColorStop(0, "#22d3ee"); // corewave-cyan
                gradient.addColorStop(1, "#0070f3"); // corewave-blue

                ctx.fillStyle = gradient;
                ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

                x += barWidth + 1;
            }
        };

        draw();

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [isPlaying]);

    return (
        <canvas
            ref={canvasRef}
            width={300}
            height={40}
            style={{
                width: '100%',
                height: '40px',
                opacity: 0.8,
                filter: 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.2))'
            }}
        />
    );
};

export default Visualizer;
