"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import styles from '../explore/Explore.module.css';
import trendingStyles from './Trending.module.css';
import { Play, Heart, TrendingUp, Flame, Music, MoreHorizontal, Loader2, ArrowUpRight, Share2, User, Pause } from 'lucide-react';
import { usePlayerStore, Track } from '@/store/usePlayerStore';
import { useToastStore } from '@/store/useToastStore';

export default function TrendingPage() {
    const { data: session } = useSession();
    const { addToast } = useToastStore();
    const { setTrack, currentTrack, isPlaying, togglePlay } = usePlayerStore();
    const router = useRouter();
    const [tracks, setTracks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const tracksRes = await fetch('/api/tracks');
                const tracksData = await tracksRes.json();

                const trendingTracks = (tracksData.tracks || []).slice(0, 10).map((t: Track, i: number) => ({
                    ...t,
                    trendIndex: Math.floor(Math.random() * 80) + 40,
                    rank: i + 1
                }));
                setTracks(trendingTracks);

                if (session) {
                    const favsRes = await fetch('/api/favorites');
                    const favsData = await favsRes.json();
                    setFavoriteIds(new Set((favsData.favorites || []).map((f: any) => f.track.id)));
                }
            } catch (err) {
                console.error("Failed to fetch trending data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [session]);

    // Live Trend Analytics - Real-time Fluctuation
    useEffect(() => {
        if (tracks.length === 0) return;

        const interval = setInterval(() => {
            setTracks(prev => prev.map(t => ({
                ...t,
                trendIndex: Math.max(10, t.trendIndex + (Math.random() > 0.5 ? 1 : -1))
            })));
        }, 3000);

        return () => clearInterval(interval);
    }, [tracks.length]);

    const toggleFavorite = async (e: React.MouseEvent, trackId: string) => {
        e.stopPropagation();
        if (!session) {
            addToast("Authentication required to like tracks. Please log in or sign up.", "info");
            return;
        }

        const isFavorited = favoriteIds.has(trackId);
        try {
            const method = isFavorited ? 'DELETE' : 'POST';
            const url = isFavorited ? `/api/favorites/${trackId}` : '/api/favorites';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: isFavorited ? null : JSON.stringify({ trackId })
            });

            if (res.ok) {
                const newIds = new Set(favoriteIds);
                if (isFavorited) {
                    newIds.delete(trackId);
                    addToast("Removed from favorites");
                } else {
                    newIds.add(trackId);
                    addToast("Added to favorites");
                }
                setFavoriteIds(newIds);
            }
        } catch (err) {
            addToast("Failed to update favorite", "error");
        }
    };

    const handleShare = (e: React.MouseEvent, track: Track) => {
        e.stopPropagation();
        navigator.clipboard.writeText(`${window.location.origin}/explore?track=${track.id}`);
        addToast("Link copied to clipboard!");
        setActiveMenu(null);
    };

    const handleTrackInteraction = (track: any) => {
        if (currentTrack?.id === track.id) {
            togglePlay();
        } else {
            setTrack(track);
        }
    };

    return (
        <div className={styles.explorePage} onClick={() => setActiveMenu(null)}>
            <div className={`container ${styles.container}`}>
                <header className={styles.header}>
                    <div className={trendingStyles.badge}>
                        <Flame size={14} /> <span>Live Trends</span>
                    </div>
                    <h1 className="text-gradient">Trending Now</h1>
                    <p>The most evolved sounds in the ecosystem right now.</p>
                </header>

                <section className={styles.section}>
                    {loading ? (
                        <div className={styles.loadingContainer}>
                            <Loader2 className="spinner" size={32} />
                            <p>Analyzing the waves...</p>
                        </div>
                    ) : (
                        <div className={trendingStyles.trendingList}>
                            {tracks.map((track: any, index) => {
                                const isCurrent = currentTrack?.id === track.id;
                                return (
                                    <div
                                        key={track.id}
                                        className={`${trendingStyles.trendingItem} premium-card ${isCurrent ? trendingStyles.activeItem : ''}`}
                                        onClick={() => handleTrackInteraction(track)}
                                    >
                                        <div className={trendingStyles.rank}>
                                            {index + 1}
                                        </div>
                                        <div className={trendingStyles.mainInfo}>
                                            <div className={trendingStyles.coverWrapper}>
                                                <img src={track.coverUrl} alt={track.title} />
                                                <div className={`${trendingStyles.playIcon} ${isCurrent && isPlaying ? trendingStyles.playing : ''}`}>
                                                    {isCurrent && isPlaying ? <Pause fill="white" size={20} /> : <Play fill="white" size={20} />}
                                                </div>
                                            </div>
                                            <div className={trendingStyles.textInfo}>
                                                <h3>{track.title}</h3>
                                                <p>{track.artist}</p>
                                            </div>
                                        </div>
                                        <div className={trendingStyles.stats}>
                                            <div className={trendingStyles.trend}>
                                                <TrendingUp size={16} color="var(--corewave-cyan)" />
                                                <span>+{track.trendIndex}%</span>
                                            </div>
                                            <div className={trendingStyles.actions}>
                                                <button
                                                    className={`${trendingStyles.actionBtn} ${favoriteIds.has(track.id) ? trendingStyles.active : ''}`}
                                                    onClick={(e) => toggleFavorite(e, track.id)}
                                                    aria-label="Like"
                                                >
                                                    <Heart size={20} fill={favoriteIds.has(track.id) ? "var(--corewave-pink)" : "transparent"} color={favoriteIds.has(track.id) ? "var(--corewave-pink)" : "currentColor"} />
                                                </button>
                                                <div className={trendingStyles.menuWrapper}>
                                                    <button
                                                        className={trendingStyles.actionBtn}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setActiveMenu(activeMenu === track.id ? null : track.id);
                                                        }}
                                                        aria-label="More"
                                                    >
                                                        <MoreHorizontal size={20} />
                                                    </button>
                                                    {activeMenu === track.id && (
                                                        <div className={trendingStyles.dropdownMenu} onClick={(e) => e.stopPropagation()}>
                                                            <button onClick={(e) => handleShare(e, track)}><Share2 size={14} /> Share</button>
                                                            <button onClick={() => router.push(`/artists/${track.artistId}`)}><User size={14} /> View Artist</button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
