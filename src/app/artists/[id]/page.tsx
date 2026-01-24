"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import styles from './ArtistProfile.module.css';
import { Play, Music, Users, Calendar, CheckCircle, Share2, Heart, Loader2, Pause } from 'lucide-react';
import { usePlayerStore, Track } from '@/store/usePlayerStore';
import { useToastStore } from '@/store/useToastStore';

export default function ArtistProfilePage() {
    const { id } = useParams();
    const { data: session } = useSession();
    const { addToast } = useToastStore();
    const [artist, setArtist] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const [isLoadingFollow, setIsLoadingFollow] = useState(false);
    const { currentTrack, isPlaying, setTrack, togglePlay, setQueue } = usePlayerStore();

    const [prevPlays, setPrevPlays] = useState<Record<string, number>>({});


    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            try {
                const res = await fetch(`/api/artists/${id}`, { cache: 'no-store' });
                const data = await res.json();

                if (data.artist) {
                    // Update prevPlays map
                    const playMap: Record<string, number> = {};
                    data.artist.tracks.forEach((t: any) => { playMap[t.id] = t.plays; });
                    setPrevPlays(playMap);

                    setArtist(data.artist);
                    setLoading(false);
                }
            } catch (err) {
                console.error("Real-time fetch error:", err);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 10000); // Optimized polling: 10s

        // Check follow status
        if (session) {
            fetch(`/api/artists/${id}/follow`)
                .then(res => res.json())
                .then(data => setIsFollowing(data.following))
                .catch(() => setIsFollowing(false));
        }

        return () => {
            clearInterval(interval);
        };
    }, [id, session, prevPlays]);

    const toggleFollow = async () => {
        if (!session || isLoadingFollow) return;
        setIsLoadingFollow(true);
        try {
            const method = isFollowing ? 'DELETE' : 'POST';
            const res = await fetch(`/api/artists/${id}/follow`, { method });
            if (res.ok) {
                setIsFollowing(!isFollowing);
                addToast(isFollowing ? `Unfollowed ${artist.name}` : `Followed ${artist.name}`);
                // Update local artist count
                setArtist((prev: any) => ({
                    ...prev,
                    _count: {
                        ...prev._count,
                        followedBy: prev._count.followedBy + (isFollowing ? -1 : 1)
                    }
                }));
            }
        } catch (err) {
            console.error("Follow toggle error:", err);
            addToast("Failed to update follow status", "error");
        } finally {
            setIsLoadingFollow(false);
        }
    };

    const handleShare = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        addToast("Profile link copied to clipboard!");
    };

    if (loading) {
        return (
            <div className={styles.artistPage}>
                <div className="container" style={{ display: 'flex', justifyContent: 'center', paddingTop: '10rem' }}>
                    <Loader2 size={40} className="spinner" />
                </div>
            </div>
        );
    }

    if (!artist) {
        return <div className={styles.artistPage}><div className="container">Artist not found.</div></div>;
    }

    return (
        <div className={styles.artistPage}>
            <div className={`container`}>
                <header className={styles.header}>
                    <div className={styles.banner}></div>
                    <div className={styles.profileInfo}>
                        <div className={styles.avatar}>
                            {artist.image ? (
                                <img src={artist.image} alt={artist.name} />
                            ) : (
                                <div style={{ fontSize: '4rem', fontWeight: '800' }}>{artist.name?.[0]}</div>
                            )}
                        </div>
                        <div className={styles.meta}>
                            {artist.isVerified && (
                                <div className={styles.verified}>
                                    <CheckCircle size={14} fill="var(--corewave-cyan)" stroke="var(--background)" /> Verified Artist
                                </div>
                            )}
                            <h1 className={styles.name}>{artist.name}</h1>
                            <div className={styles.stats}>
                                <span className={styles.statItem}><Music size={16} /> {artist._count.tracks} Tracks</span>
                                <span className={styles.statItem}><Users size={16} /> {artist._count.followedBy} Followers</span>
                                <span className={styles.statItem}><Calendar size={16} /> Joined {new Date(artist.createdAt).getFullYear()}</span>
                            </div>
                        </div>
                        <div className={styles.actions}>
                            {session?.user?.id !== id && (
                                <button
                                    className={isFollowing ? "btn-outline" : "btn-primary"}
                                    style={{ padding: '0.6rem 1.5rem', minWidth: '120px' }}
                                    onClick={toggleFollow}
                                    disabled={isLoadingFollow}
                                >
                                    {isLoadingFollow ? "..." : isFollowing ? "Following" : "Follow"}
                                </button>
                            )}
                            <button
                                className="btn-outline"
                                style={{ width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                                onClick={handleShare}
                            >
                                <Share2 size={18} />
                            </button>
                        </div>
                    </div>
                </header>

                <div className={styles.content}>
                    <main>
                        <section>
                            <div className={styles.sectionHeader}>
                                <h2>Popular Tracks</h2>
                                <button
                                    className="btn-outline"
                                    style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
                                    onClick={() => {
                                        if (artist.tracks.length > 0) {
                                            // [EXPERTISE] We initialize the first track and synchronize the REMAINING tracks to the queue.
                                            // This ensures that the state machine correctly identifies the 'Up Next' assets.
                                            setTrack(artist.tracks[0]);
                                            setQueue(artist.tracks.slice(1));
                                        }
                                    }}
                                >
                                    Play All
                                </button>
                            </div>

                            <div className={styles.trackList}>
                                {artist.tracks.map((track: Track, index: number) => (
                                    <div key={track.id} className={styles.trackRow}>
                                        <div style={{ width: '30px', color: 'var(--muted-foreground)', fontWeight: '600' }}>{index + 1}</div>
                                        <img src={track.coverUrl} alt={track.title} className={styles.trackThumb} />
                                        <div>
                                            <div className={styles.trackTitle}>{track.title}</div>
                                            <div className={styles.trackMeta}>{track.genre} • {track.mood}</div>
                                        </div>
                                        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '2rem' }}>
                                            <div className={styles.playCount}>
                                                {track.plays?.toLocaleString() || 0} plays
                                            </div>
                                            <button
                                                className={styles.playBtn}
                                                onClick={() => {
                                                    if (currentTrack?.id === track.id) {
                                                        togglePlay();
                                                    } else {
                                                        setTrack(track);
                                                        // [EXPERTISE] Sync the subsequence of tracks to the global queue.
                                                        const remaining = artist.tracks.slice(index + 1);
                                                        setQueue(remaining);

                                                    }
                                                }}
                                            >
                                                {currentTrack?.id === track.id && isPlaying ? (
                                                    <Pause size={18} fill="currentColor" />
                                                ) : (
                                                    <Play size={18} fill="currentColor" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </main>

                    <aside>
                        <div className={styles.sidebarSection}>
                            <h3>About Artist</h3>
                            <p className={styles.bio}>
                                {artist.bio || "This artist hasn't added a bio yet. They're too busy making incredible music that pushes the boundaries of sound."}
                            </p>
                        </div>

                        <div className={styles.sidebarSection}>
                            <h3>Similar to {artist.name}</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem' }}>Discovery engine is analyzing sound patterns...</p>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
