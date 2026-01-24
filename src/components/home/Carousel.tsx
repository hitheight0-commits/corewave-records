'use client';

import React, { useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Play, Pause, ChevronLeft, ChevronRight, MoreVertical, Heart, ListMusic, Maximize2 } from 'lucide-react';
import styles from './Carousel.module.css';
import { Track } from '@/types';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useUIStore } from '@/store/useUIStore';
import { useRouter } from 'next/navigation';
import { useToastStore } from '@/store/useToastStore';
import Link from 'next/link';

interface CarouselProps {
    title: string;
    tracks: Track[];
}

const Carousel: React.FC<CarouselProps> = ({ title, tracks }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const { currentTrack, isPlaying, setTrack, togglePlay, toggleFullScreen, setQueue, favorites, toggleFavorite } = usePlayerStore();
    const { data: session } = useSession();
    const router = useRouter();
    const { addToast } = useToastStore();

    // Menu state
    const { openPlaylistModal } = useUIStore();
    const [activeMenuId, setActiveMenuId] = React.useState<string | null>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollRef.current) return;
        const { scrollLeft, clientWidth } = scrollRef.current;
        const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
        scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    };

    const handleMenuAction = (action: string, track: Track) => {
        setActiveMenuId(null);
        if (action === 'fullscreen') {
            setTrack(track); // Ensure it's playing and active
            toggleFullScreen(true);
        } else if (action === 'playlist') {
            if (!session) {
                addToast("Authentication required to manage playlists. Please log in or sign up.", "info");
                return;
            }
            openPlaylistModal(track);
        } else if (action === 'like') {
            if (!session) {
                addToast("Authentication required to like tracks. Please log in or sign up if you don't have an account.", "info");
                return;
            }
            toggleFavorite(track.id);
        }
    };



    return (
        <section className={styles.section} onClick={() => setActiveMenuId(null)}>
            <div className={styles.header}>
                <h2 className={styles.title}>{title}</h2>
                <div className={styles.nav}>
                    <button className={styles.viewAll}>View All</button>
                    <button className={styles.navBtn} onClick={() => scroll('left')}>
                        <ChevronLeft size={20} />
                    </button>
                    <button className={styles.navBtn} onClick={() => scroll('right')}>
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            <div className={styles.carousel} ref={scrollRef}>
                {tracks.map((track, index) => (
                    <motion.div
                        key={track.id}
                        className={styles.card}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 0.6,
                            delay: index * 0.1,
                            ease: [0.16, 1, 0.3, 1]
                        }}
                        viewport={{ once: true }}
                    >
                        <div className={styles.artWrapper}>
                            <img src={track.coverUrl} alt={track.title} className={styles.cover} />
                            <div className={styles.overlay}>
                                <button
                                    className={styles.playBtn}
                                    onClick={() => {
                                        if (currentTrack?.id === track.id) {
                                            togglePlay();
                                        } else {
                                            setQueue(tracks); // [EXPERTISE] establish context for Next/Prev
                                            setTrack(track);
                                        }
                                    }}
                                >
                                    {currentTrack?.id === track.id && isPlaying ? (
                                        <Pause fill="currentColor" />
                                    ) : (
                                        <Play fill="currentColor" style={{ marginLeft: 2 }} />
                                    )}
                                </button>

                                {/* Context Menu Trigger */}
                                <button
                                    className={styles.moreBtn}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveMenuId(activeMenuId === track.id ? null : track.id);
                                    }}
                                >
                                    <MoreVertical size={20} />
                                </button>

                                {activeMenuId === track.id && (
                                    <div className={styles.contextMenu} onClick={(e) => e.stopPropagation()}>
                                        <button onClick={() => handleMenuAction('like', track)}>
                                            <Heart size={14} fill={favorites.includes(track.id) ? "#ef4444" : "none"} color={favorites.includes(track.id) ? "#ef4444" : "currentColor"} />
                                            {favorites.includes(track.id) ? 'Liked' : 'Like'}
                                        </button>
                                        <button onClick={() => handleMenuAction('playlist', track)}>
                                            <ListMusic size={14} /> Add to Playlist
                                        </button>
                                        <button onClick={() => handleMenuAction('fullscreen', track)}>
                                            <Maximize2 size={14} /> Full Screen
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className={styles.info}>
                            <h3 className={styles.trackTitle}>{track.title}</h3>
                            <Link href={`/artists/${track.artistId}`} className={styles.artistLink}>
                                {typeof track.artist === 'object' ? (track.artist as any).name : track.artist}
                            </Link>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

export default Carousel;
