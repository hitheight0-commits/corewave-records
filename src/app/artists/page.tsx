"use client";

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import styles from '../explore/Explore.module.css';
import { User, CheckCircle2, Loader2, Music, Users } from 'lucide-react';
import { useToastStore } from '@/store/useToastStore';
import { GridSkeleton } from '@/components/ui/Skeleton';

interface Artist {
    id: string;
    name: string | null;
    image: string | null;
    bio: string | null;
    isVerified: boolean;
    _count: {
        followedBy: number;
    }
}

export default function ArtistsPage() {
    const { t } = useTranslation();
    const { data: session } = useSession();
    const { addToast } = useToastStore();
    const [artists, setArtists] = useState<Artist[]>([]);
    const [loading, setLoading] = useState(true);
    const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
    const [loadingFollowId, setLoadingFollowId] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const artistsRes = await fetch('/api/artists');
                const artistsData = await artistsRes.json();
                setArtists(artistsData.artists || []);

                if (session) {
                    const followingRes = await fetch('/api/user/following');
                    const followingData = await followingRes.json();
                    const followedArtists = followingData.artists || [];
                    setFollowingIds(new Set(followedArtists.map((a: any) => a.id)));
                }
            } catch (err) {
                console.error("Failed to fetch artists data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [session]);

    const toggleFollow = async (artistId: string, artistName: string) => {
        if (!session) {
            addToast(t('artists.loginToFollow'), "error");
            return;
        }
        if (loadingFollowId) return;

        setLoadingFollowId(artistId);
        const isFollowing = followingIds.has(artistId);

        try {
            const method = isFollowing ? 'DELETE' : 'POST';
            const res = await fetch(`/api/artists/${artistId}/follow`, { method });

            if (res.ok) {
                const newFollowingIds = new Set(followingIds);
                if (isFollowing) {
                    newFollowingIds.delete(artistId);
                    addToast(t('artists.unfollowSuccess', { name: artistName }));
                } else {
                    newFollowingIds.add(artistId);
                    addToast(t('artists.followSuccess', { name: artistName }));
                }
                setFollowingIds(newFollowingIds);

                // Update local artist count
                setArtists(prev => prev.map(a =>
                    a.id === artistId
                        ? { ...a, _count: { ...a._count, followedBy: a._count.followedBy + (isFollowing ? -1 : 1) } }
                        : a
                ));
            } else {
                addToast(t('artists.followError'), "error");
            }
        } catch (err) {
            console.error("Follow error:", err);
            addToast(t('artists.genericError'), "error");
        } finally {
            setLoadingFollowId(null);
        }
    };

    return (
        <main className={styles.explorePage} style={{ paddingTop: '10rem' }}>
            <div className={`container ${styles.container}`}>
                <header className={styles.header}>
                    <h1 style={{ fontSize: '3rem', fontWeight: '800' }}>{t('artists.title')}</h1>
                    <p style={{ color: 'var(--muted-foreground)' }}>{t('artists.subtitle')}</p>
                </header>

                {loading ? (
                    <GridSkeleton count={10} type="artist" />
                ) : artists.length > 0 ? (
                    <div className={styles.grid}>
                        {artists.map((artist) => (
                            <div key={artist.id} className={`premium-card ${styles.artistCard}`}>
                                <Link href={`/artists/${artist.id}`} className={styles.coverWrapper} style={{ borderRadius: '50%', marginBottom: '2rem', display: 'block', background: 'var(--grad-primary)', aspectRatio: '1/1', overflow: 'hidden' }}>
                                    {artist.image ? (
                                        <img src={artist.image} alt={artist.name || 'Artist'} className={styles.cover} style={{ borderRadius: '50%' }} />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', fontWeight: '800', color: 'white' }}>
                                            {artist.name?.[0] || 'A'}
                                        </div>
                                    )}
                                </Link>
                                <div className={styles.trackMeta} style={{ textAlign: 'center', display: 'block' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                                        <Link href={`/artists/${artist.id}`} style={{ fontSize: '1.3rem', fontWeight: '700' }}>{artist.name || 'Anonymous Artist'}</Link>
                                        {artist.isVerified && (
                                            <CheckCircle2 size={16} color="var(--corewave-blue)" fill="var(--corewave-blue)" stroke="white" />
                                        )}
                                    </div>
                                    <p style={{ color: 'var(--muted-foreground)', marginBottom: '1.5rem' }}>{t('artists.followers', { count: artist._count.followedBy })}</p>
                                    <div className={styles.buttonGrid} style={{
                                        gridTemplateColumns: session?.user?.id !== artist.id ? '1fr 1fr' : '1fr'
                                    }}>
                                        {session?.user?.id !== artist.id && (
                                            <button
                                                className={followingIds.has(artist.id) ? "btn-outline" : "btn-primary"}
                                                style={{ width: '100%', padding: '0.8rem 0', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.05em' }}
                                                onClick={() => toggleFollow(artist.id, artist.name || 'Artist')}
                                                disabled={loadingFollowId === artist.id}
                                            >
                                                {loadingFollowId === artist.id ? (
                                                    <Loader2 size={14} className="spinner" />
                                                ) : (
                                                    followingIds.has(artist.id) ? t('artists.following') : t('artists.follow')
                                                )}
                                            </button>
                                        )}
                                        <Link
                                            href={`/artists/${artist.id}`}
                                            className="btn-outline"
                                            style={{ width: '100%', padding: '0.8rem 0', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.05em' }}
                                        >
                                            {t('artists.profile')}
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--muted-foreground)' }}>
                        <Music size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                        <p>{t('artists.noArtists')}</p>
                    </div>
                )}
            </div>
        </main>
    );
}
