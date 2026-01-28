'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, SkipBack, SkipForward, Volume2, Maximize2 } from 'lucide-react';
import styles from './FullscreenOverlay.module.css';
import { Track } from '@/types';
import Visualizer from './Visualizer';

interface FullscreenOverlayProps {
    track: Track;
    isOpen: boolean;
    onClose: () => void;
    isPlaying: boolean;
    onTogglePlay: () => void;
    onNext: () => void;
    onPrevious: () => void;
    isCORSCompatible?: boolean;
}

const FullscreenOverlay: React.FC<FullscreenOverlayProps> = ({
    track,
    isOpen,
    onClose,
    isPlaying,
    onTogglePlay,
    onNext,
    onPrevious,
    isCORSCompatible = true,
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className={styles.overlay}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                    {/* Animated Background Mesh */}
                    <div className={styles.meshBg} />

                    <div className={styles.container}>
                        <button className={styles.closeBtn} onClick={onClose}>
                            <X size={32} />
                        </button>

                        <div className={styles.content}>
                            <motion.div
                                className={styles.artWrapper}
                                initial={{ y: 40, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                            >
                                <img src={track.coverUrl} alt={track.title} className={styles.cover} />
                                <div className={styles.visualizerContainer}>
                                    <Visualizer isPlaying={isPlaying} isCORSCompatible={isCORSCompatible} />
                                </div>
                            </motion.div>

                            <motion.div
                                className={styles.info}
                                initial={{ y: 40, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                <div className={styles.titleWrapper}>
                                    <h1 className={styles.title}>{track.title}</h1>
                                    {track.isAI && <span className={styles.aiTag}>AI</span>}
                                </div>
                                <p className={styles.artist}>
                                    {typeof track.artist === 'object' ? (track.artist as any).name : track.artist}
                                </p>

                                <div className={styles.controls}>
                                    <button className={styles.controlBtn} onClick={onPrevious}>
                                        <SkipBack size={32} fill="currentColor" />
                                    </button>

                                    <button className={styles.playBtn} onClick={onTogglePlay}>
                                        {isPlaying ? <Pause size={48} fill="white" /> : <Play size={48} fill="white" style={{ marginLeft: 4 }} />}
                                    </button>

                                    <button className={styles.controlBtn} onClick={onNext}>
                                        <SkipForward size={32} fill="currentColor" />
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default FullscreenOverlay;
