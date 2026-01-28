"use client";

import { useEffect, useRef } from "react";
import { useAudioEngineStore } from "@/hooks/useAudioEngine";

interface VisualizerProps {
    isPlaying: boolean;
    isCORSCompatible: boolean;
}

const Visualizer = ({ isPlaying, isCORSCompatible }: VisualizerProps) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const animationRef = useRef<number | null>(null);
    const { analyser } = useAudioEngineStore();

    useEffect(() => {
        if (!isPlaying || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // [EXPERTISE] High-DPI Orchestration
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;

        const bufferLength = analyser ? analyser.frequencyBinCount : 64;
        const dataArray = new Uint8Array(bufferLength);

        let lastTime = 0;

        const draw = (time: number) => {
            animationRef.current = requestAnimationFrame(draw);

            // Limit to ~60fps
            if (time - lastTime < 16) return;
            lastTime = time;

            if (analyser && isCORSCompatible) {
                analyser.getByteFrequencyData(dataArray);
            } else {
                // [EXPERTISE] Simulated Aesthetic Fallback
                // If CORS is blocked or analyser is missing, we create a pretty, 
                // rhythmic simulation so the UI remains "alive" and professional.
                for (let i = 0; i < bufferLength; i++) {
                    const slowWave = Math.sin(time / 1000 + i / 5) * 50 + 50;
                    const fastWave = Math.sin(time / 100 + i / 2) * 20;
                    dataArray[i] = slowWave + fastWave;
                }
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const barCount = bufferLength / 2;
            const barWidth = (canvas.width / barCount) / 2;
            const centerY = canvas.height / 2;

            for (let i = 0; i < barCount; i++) {
                // Smoothing the input data for a fluid, premium look
                const value = dataArray[i];
                const h = (value / 255) * (canvas.height * 0.7);

                const xLeft = (canvas.width / 2) - (i * barWidth);
                const xRight = (canvas.width / 2) + (i * barWidth);

                // Branded Triple-Stop Gradient
                const gradient = ctx.createLinearGradient(0, centerY - h / 2, 0, centerY + h / 2);
                gradient.addColorStop(0, "rgba(34, 211, 238, 0.2)"); // corewave-cyan fade
                gradient.addColorStop(0.5, "#0070f3"); // corewave-blue solid
                gradient.addColorStop(1, "rgba(34, 211, 238, 0.2)");

                ctx.fillStyle = gradient;

                // Add sub-pixel glow only on high-value bars
                if (value > 150) {
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = "rgba(0, 112, 243, 0.3)";
                } else {
                    ctx.shadowBlur = 0;
                }

                // Render symmetric bars with rounded ends (simulated with rect + shadow)
                ctx.fillRect(xLeft, centerY - h / 2, barWidth - 1, h);
                ctx.fillRect(xRight, centerY - h / 2, barWidth - 1, h);
            }
        };

        draw(0);

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [isPlaying, isCORSCompatible, analyser]);


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
