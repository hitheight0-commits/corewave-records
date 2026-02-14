"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import styles from './ArtistProfile.module.css';
import { Play, Music, Users, Calendar, CheckCircle, Share2, Heart, Loader2, Pause } from 'lucide-react';
import { usePlayerStore, Track } from '@/store/usePlayerStore';
import { useToastStore } from '@/store/useToastStore';
import { useTranslation } from 'react-i18next';

export default function ArtistProfilePage() {
    const { t } = useTranslation();
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
        const interval = setInterval(fetchData, 10000);

        if (session) {
            fetch(`/api/artists/${id}/follow`)
                .then(res => res.json())
                .then(data => setIsFollowing(data.following))
                .catch(() => setIsFollowing(false));
        }

        return () => clearInterval(interval);
    }, [id, session, prevPlays]);

    const toggleFollow = async () => {
        if (!session || isLoadingFollow) return;
        setIsLoadingFollow(true);
        try {
            const method = isFollowing ? 'DELETE' : 'POST';
            const res = await fetch(`/api/artists/${id}/follow`, { method });
            if (res.ok) {
                setIsFollowing(!isFollowing);
                addToast(isFollowing
                    ? t('artists.unfollowSuccess', { name: artist.name })
                    : t('artists.followSuccess', { name: artist.name }));
                setArtist((prev: any) => ({
                    ...prev,
                    _count: {
                        ...prev._count,
                        followedBy: prev._count.followedBy + (isFollowing ? -1 : 1)
                    }
                }));
            }
        } catch (err) {
            addToast(t('artists.followError'), "error");
        } finally {
            setIsLoadingFollow(false);
        }
    };

    const handleShare = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        addToast(t('common.copied') || "Profile link copied to clipboard!");
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
        return <div className={styles.artistPage}><div className="container">{t('artists.noArtists')}</div></div>;
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
                                    <CheckCircle size={14} fill="var(--corewave-cyan)" stroke="var(--background)" /> {t('artists.verified')}
                                </div>
                            )}
                            <h1 className={styles.name}>{artist.name}</h1>
                            <div className={styles.stats}>
                                <span className={styles.statItem}><Music size={16} /> {t('artists.tracksCount', { count: artist._count.tracks })}</span>
                                <span className={styles.statItem}><Users size={16} /> {t('artists.followers', { count: artist._count.followedBy })}</span>
                                <span className={styles.statItem}><Calendar size={16} /> {t('artists.joined', { year: new Date(artist.createdAt).getFullYear() })}</span>
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
                                    {isLoadingFollow ? "..." : isFollowing ? t('artists.following') : t('artists.follow')}
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
                                <h2>{t('artists.popularTracks')}</h2>
                                <button
                                    className="btn-outline"
                                    style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
                                    onClick={() => {
                                        if (artist.tracks.length > 0) {
                                            setTrack(artist.tracks[0]);
                                            setQueue(artist.tracks.slice(1));
                                        }
                                    }}
                                >
                                    {t('artists.playAll')}
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
                                                {t('artists.playsCount', { count: track.plays || 0 })}
                                            </div>
                                            <button
                                                className={styles.playBtn}
                                                onClick={() => {
                                                    if (currentTrack?.id === track.id) {
                                                        togglePlay();
                                                    } else {
                                                        setTrack(track);
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
                            <h3>{t('artists.about')}</h3>
                            <p className={styles.bio}>
                                {artist.bio || t('artists.noBio')}
                            </p>
                        </div>

                        <div className={styles.sidebarSection}>
                            <h3>{t('artists.similarTo', { name: artist.name })}</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem' }}>{t('artists.discoveryEngine')}</p>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
