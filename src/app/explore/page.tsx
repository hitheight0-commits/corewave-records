"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import styles from './Explore.module.css';
import { Play, Pause, Heart, ListMusic, Maximize2, MoreVertical, Loader2 } from 'lucide-react';
import { usePlayerStore, Track } from '@/store/usePlayerStore';
import { useUIStore } from '@/store/useUIStore';
import { useToastStore } from '@/store/useToastStore';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

export default function ExplorePage() {
    return (
        <Suspense fallback={<div>Loading explorer...</div>}>
            <ExploreContent />
        </Suspense>
    );
}

function ExploreContent() {
    const { setTrack, setQueue, currentTrack, isPlaying, togglePlay, toggleFullScreen, toggleFavorite, favorites } = usePlayerStore();
    const { data: session } = useSession();
    const { openPlaylistModal } = useUIStore();
    const { addToast } = useToastStore();
    const searchParams = useSearchParams();
    const queryGenre = searchParams.get('genre');

    const [tracks, setTracks] = useState<Track[]>([]);
    const [filteredTracks, setFilteredTracks] = useState<Track[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeGenre, setActiveGenre] = useState<string | null>(queryGenre);
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

    useEffect(() => {
        if (queryGenre) setActiveGenre(queryGenre);
    }, [queryGenre]);

    const genres = [
        { name: 'Electronic', image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80&w=800' },
        { name: 'Hip Hop', image: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&q=80&w=800' },
        { name: 'Ambient', image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&q=80&w=800' },
        { name: 'Lo-Fi', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=800' },
        { name: 'Techno', image: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?auto=format&fit=crop&q=80&w=800' },
        { name: 'Indie', image: 'https://images.unsplash.com/photo-1526218626217-dc65a29bb444?auto=format&fit=crop&q=80&w=800' }
    ];

    useEffect(() => {
        const fetchTracks = async () => {
            try {
                const res = await fetch('/api/tracks');
                const data = await res.json();
                setTracks(data.tracks || []);
                setFilteredTracks(data.tracks || []);
            } catch (err) {
                console.error("Failed to fetch tracks:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchTracks();
    }, []);

    useEffect(() => {
        if (activeGenre) {
            setFilteredTracks(tracks.filter(t => t.genre?.toLowerCase() === activeGenre.toLowerCase()));
        } else {
            setFilteredTracks(tracks);
        }
    }, [activeGenre, tracks]);

    const handleMenuAction = (action: string, track: Track) => {
        setActiveMenuId(null);
        if (action === 'fullscreen') {
            setTrack(track);
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
        <main className={styles.explorePage}>
            <div className={`container ${styles.container}`}>
                <header className={styles.header}>
                    <h1 className="text-gradient">Explore Sound</h1>
                    <p>Discover the next wave of global artists and sonic textures.</p>
                </header>

                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2>{activeGenre ? `${activeGenre} Tracks` : 'Trending Now'}</h2>
                        {activeGenre && (
                            <button className={styles.seeAll} onClick={() => setActiveGenre(null)}>Clear Filter</button>
                        )}
                    </div>

                    {loading ? (
                        <div className={styles.loadingContainer}>
                            <Loader2 className="spinner" size={32} />
                            <p>Loading the latest tracks...</p>
                        </div>
                    ) : filteredTracks.length > 0 ? (
                        <div className={styles.grid}>
                            {filteredTracks.map((track) => (
                                <div key={track.id} className={styles.trackCard}>
                                    <div className={styles.coverWrapper}>
                                        <img src={track.coverUrl} alt={track.title} className={styles.cover} />
                                        <div className={styles.playOverlay}>
                                            <button
                                                className={styles.playBtn}
                                                onClick={() => {
                                                    if (currentTrack?.id === track.id) {
                                                        togglePlay();
                                                    } else {
                                                        setQueue(filteredTracks);
                                                        setTrack(track);
                                                    }
                                                }}
                                            >
                                                {currentTrack?.id === track.id && isPlaying ? (
                                                    <Pause fill="currentColor" size={32} />
                                                ) : (
                                                    <Play fill="currentColor" size={32} style={{ marginLeft: 2 }} />
                                                )}
                                            </button>

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
                                    <div className={styles.trackMeta}>
                                        <div className={styles.info}>
                                            <h3 className={styles.trackTitle}>{track.title}</h3>
                                            <p>{typeof track.artist === 'object' ? (track.artist as any).name : track.artist}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={styles.emptyState}>
                            <p>No tracks found for this category. Stay tuned for new releases!</p>
                            <button className="btn-outline" onClick={() => setActiveGenre(null)} style={{ marginTop: '1rem' }}>Back to all</button>
                        </div>
                    )}
                </section>

                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2>Browse Genres</h2>
                    </div>
                    <div className={styles.genreGrid}>
                        {genres.map((genre) => (
                            <button
                                key={genre.name}
                                className={`${styles.genreCard} ${activeGenre === genre.name ? styles.activeGenre : ''}`}
                                onClick={() => setActiveGenre(genre.name === activeGenre ? null : genre.name)}
                                style={{
                                    backgroundImage: `linear-gradient(to bottom, transparent, rgba(0,0,0,0.8)), url(${genre.image})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center'
                                }}
                            >
                                <span>{genre.name}</span>
                            </button>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}
