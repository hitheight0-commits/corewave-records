"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import styles from '../explore/Explore.module.css';
import trendingStyles from '../trending/Trending.module.css'; // Reuse menu styles
import { Play, Heart, Calendar, Music, MoreHorizontal, Loader2, Sparkles, Share2, User } from 'lucide-react';
import { usePlayerStore, Track } from '@/store/usePlayerStore';
import { useToastStore } from '@/store/useToastStore';

export default function NewReleasesPage() {
    const { data: session } = useSession();
    const { addToast } = useToastStore();
    const { setTrack, currentTrack, isPlaying } = usePlayerStore();
    const router = useRouter();
    const [tracks, setTracks] = useState<Track[]>([]);
    const [loading, setLoading] = useState(true);
    const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const tracksRes = await fetch('/api/tracks');
                const tracksData = await tracksRes.json();
                setTracks((tracksData.tracks || []).slice().reverse());

                if (session) {
                    const favsRes = await fetch('/api/favorites');
                    const favsData = await favsRes.json();
                    setFavoriteIds(new Set((favsData.favorites || []).map((f: any) => f.track.id)));
                }
            } catch (err) {
                console.error("Failed to fetch new releases:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [session]);

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

    return (
        <div className={styles.explorePage} onClick={() => setActiveMenu(null)}>
            <div className={`container ${styles.container}`}>
                <header className={styles.header}>
                    <h1 className="text-gradient">New Releases</h1>
                    <p>Be the first to hear the future of sound.</p>
                </header>

                <section className={styles.section}>
                    {loading ? (
                        <div className={styles.loadingContainer}>
                            <Loader2 className="spinner" size={32} />
                            <p>Fetching the newest entries...</p>
                        </div>
                    ) : tracks.length > 0 ? (
                        <div className={styles.grid}>
                            {tracks.map((track) => (
                                <div key={track.id} className="premium-card" style={{ cursor: 'pointer' }} onClick={() => setTrack(track)}>
                                    <div className={styles.coverWrapper}>
                                        <img src={track.coverUrl} alt={track.title} className={styles.cover} />
                                        <div style={{
                                            position: 'absolute',
                                            top: '1rem',
                                            right: '1rem',
                                            background: 'var(--corewave-cyan)',
                                            color: 'black',
                                            fontSize: '0.7rem',
                                            fontWeight: '800',
                                            padding: '0.2rem 0.6rem',
                                            borderRadius: '4px',
                                            zIndex: 2,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.3rem'
                                        }}>
                                            <Sparkles size={10} /> NEW
                                        </div>
                                        <button className={`${styles.playOverlay} ${currentTrack?.id === track.id && isPlaying ? styles.playing : ''}`}>
                                            <Play fill="white" size={32} />
                                        </button>
                                    </div>
                                    <div className={styles.trackMeta} style={{ padding: '1.25rem' }}>
                                        <div className={styles.info}>
                                            <h3 className={styles.trackTitle}>{track.title}</h3>
                                            <p>{track.artist}</p>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                                            <p style={{ fontSize: '0.75rem', opacity: 0.5 }}>Released Recently</p>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    className={`${trendingStyles.actionBtn} ${favoriteIds.has(track.id) ? trendingStyles.active : ''}`}
                                                    onClick={(e) => toggleFavorite(e, track.id)}
                                                    style={{ padding: '4px' }}
                                                >
                                                    <Heart size={16} fill={favoriteIds.has(track.id) ? "var(--corewave-pink)" : "transparent"} color={favoriteIds.has(track.id) ? "var(--corewave-pink)" : "currentColor"} />
                                                </button>
                                                <div className={trendingStyles.menuWrapper}>
                                                    <button
                                                        className={trendingStyles.actionBtn}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setActiveMenu(activeMenu === track.id ? null : track.id);
                                                        }}
                                                        style={{ padding: '4px' }}
                                                    >
                                                        <MoreHorizontal size={16} />
                                                    </button>
                                                    {activeMenu === track.id && (
                                                        <div className={trendingStyles.dropdownMenu} style={{ background: '#111', bottom: '100%', top: 'auto', marginBottom: '0.5rem' }} onClick={(e) => e.stopPropagation()}>
                                                            <button onClick={(e) => handleShare(e, track)}><Share2 size={14} /> Share</button>
                                                            <button onClick={() => router.push(`/artists/${track.artistId}`)}><User size={14} /> View Artist</button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={styles.emptyState}>
                            <p>No new releases found. Check back soon!</p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
