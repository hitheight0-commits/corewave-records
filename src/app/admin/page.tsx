"use client";

import { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Play, Check, X, Loader2, Music } from 'lucide-react';
import styles from './Admin.module.css';
import { useToastStore } from '@/store/useToastStore';

interface PendingTrack {
    id: string;
    title: string;
    artist: string;
    artistEmail: string;
    coverUrl: string;
    audioUrl: string;
    genre: string;
    submittedAt: string;
}

export default function AdminDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { addToast } = useToastStore();

    // Tabs state
    const [activeTab, setActiveTab] = useState<'pending' | 'artists'>('pending');

    // Data States
    const [tracks, setTracks] = useState<PendingTrack[]>([]);
    const [artists, setArtists] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Player State
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [playingId, setPlayingId] = useState<string | null>(null);
    const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
            router.push('/');
        } else if (status === 'authenticated' && session?.user?.role === 'ADMIN') {
            loadData();
        }
    }, [status, session, activeTab]);

    const loadData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'pending') {
                const res = await fetch('/api/admin/tracks');
                const data = await res.json();
                setTracks(data.tracks || []);
            } else {
                const res = await fetch('/api/admin/artists');
                const data = await res.json();
                setArtists(data.artists || []);
            }
        } catch (err) {
            console.error("Fetch error", err);
            addToast("Data synchronization failed.", "error");
        } finally {
            setLoading(false);
        }
    };

    // ... (Keep handlePlay, handleApprove, handleReject from previous version)
    const handlePlay = (track: PendingTrack) => {
        if (playingId === track.id) {
            audioRef.current?.pause();
            setPlayingId(null);
        } else {
            if (audioRef.current) {
                audioRef.current.src = track.audioUrl;
                audioRef.current.play().catch(err => {
                    console.error("Audio playback error:", err);
                    addToast("Audio stream unavailable.", "error");
                });
                setPlayingId(track.id);
            }
        }
    };

    const handleApprove = async (id: string, title: string) => {
        addToast(`Initiating orchestration for "${title}"...`, "info");
        setProcessingIds(prev => new Set(prev).add(id));
        try {
            const res = await fetch(`/api/admin/tracks/${encodeURIComponent(id)}/approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ timestamp: Date.now() })
            });
            if (res.ok) {
                setTracks(prev => prev.filter(t => t.id !== id));
                addToast(`"${title}" approved.`);
            } else {
                addToast("Approval failed.", "error");
            }
        } catch (err) {
            addToast("Network error.", "error");
        } finally {
            setProcessingIds(prev => { const next = new Set(prev); next.delete(id); return next; });
        }
    };

    const handleReject = async (id: string, title: string) => {
        addToast(`Murging "${title}"...`, "info");
        setProcessingIds(prev => new Set(prev).add(id));
        try {
            const res = await fetch(`/api/admin/tracks/${encodeURIComponent(id)}/reject`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ timestamp: Date.now() })
            });
            if (res.ok) {
                setTracks(prev => prev.filter(t => t.id !== id));
                addToast(`"${title}" rejected.`);
            }
        } catch (err) {
            addToast("Purge failed.", "error");
        } finally {
            setProcessingIds(prev => { const next = new Set(prev); next.delete(id); return next; });
        }
    };

    // New Handler: Delete User
    const handleDeleteUser = async (user: any) => {
        if (!confirm(`CRITICAL WARNING:\n\nYou are about to DELETE the artist "${user.name}".\n\nThis will permanently wipe:\n- Their profile\n- All ${user._count.tracks} of their tracks\n- Their plays and follower data\n\nThis action CANNOT be undone. Proceed?`)) return;

        setProcessingIds(prev => new Set(prev).add(user.id));
        try {
            const res = await fetch(`/api/admin/users/${user.id}`, { method: 'DELETE' });
            if (res.ok) {
                setArtists(prev => prev.filter(a => a.id !== user.id));
                addToast(`Artist "${user.name}" has been purged from the ecosystem.`);
            } else {
                addToast("Deletion failed.", "error");
            }
        } catch (err) {
            addToast("System failure.", "error");
        } finally {
            setProcessingIds(prev => { const next = new Set(prev); next.delete(user.id); return next; });
        }
    };

    if (status === 'loading') return (
        <div className={styles.loading}>
            <Loader2 className={styles.spinner} size={48} />
        </div>
    );

    return (
        <div className={`container ${styles.dashboard}`}>
            <header className={styles.header}>
                <h1>Command Center</h1>
                <p>Platform Orchestration & Oversight</p>
            </header>

            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'pending' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('pending')}
                >
                    <Music size={18} /> Pending Approvals ({activeTab === 'pending' ? tracks.length : '...'})
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'artists' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('artists')}
                >
                    <Check size={18} /> Manage Artists
                </button>
            </div>

            <audio ref={audioRef} onEnded={() => setPlayingId(null)} />

            <div className={styles.contentArea}>
                {loading ? (
                    <div className={styles.loadingContainer}><Loader2 className={styles.spinner} size={32} /></div>
                ) : activeTab === 'pending' ? (
                    <div className={styles.trackList}>
                        {tracks.length === 0 ? (
                            <div className={styles.empty}>
                                <Check size={48} />
                                <h3>Zero Backlog</h3>
                                <p>All submissions have been processed.</p>
                            </div>
                        ) : (
                            tracks.map(track => (
                                <div key={track.id} className={styles.trackCard}>
                                    <div className={styles.cover}>
                                        <img src={track.coverUrl} alt={track.title} />
                                        <button className={styles.playBtn} onClick={() => handlePlay(track)}>
                                            {playingId === track.id ? "⏸" : "▶"}
                                        </button>
                                    </div>
                                    <div className={styles.info}>
                                        <h3>{track.title}</h3>
                                        <div className={styles.meta}>
                                            <span className={styles.artist}>{track.artist}</span>
                                            <span className={styles.email}>({track.artistEmail})</span>
                                        </div>
                                        <div className={styles.tags}>
                                            <span className={styles.tag}>{track.genre}</span>
                                        </div>
                                    </div>
                                    <div className={styles.actions}>
                                        <button
                                            className={`${styles.actionBtn} ${styles.approve}`}
                                            onClick={() => handleApprove(track.id, track.title)}
                                            disabled={processingIds.has(track.id)}
                                        >
                                            {processingIds.has(track.id) ? <Loader2 size={18} className="spinner" /> : <Check size={18} />}
                                            Accept
                                        </button>
                                        <button
                                            className={`${styles.actionBtn} ${styles.reject}`}
                                            onClick={() => handleReject(track.id, track.title)}
                                            disabled={processingIds.has(track.id)}
                                        >
                                            {processingIds.has(track.id) ? <Loader2 size={18} className="spinner" /> : <X size={18} />}
                                            Purge
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    <div className={styles.artistGrid}>
                        {artists.map(artist => (
                            <div key={artist.id} className="premium-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', border: '1px solid var(--border)' }}>
                                <div className={styles.avatarLarge} style={{ width: 60, height: 60 }}>
                                    {artist.image ? (
                                        <img src={artist.image} alt={artist.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {artist.name?.[0]}
                                        </div>
                                    )}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <h3 style={{ fontSize: '1.2rem', margin: 0 }}>{artist.name}</h3>
                                        {artist.isVerified && <Check size={14} color="var(--corewave-cyan)" />}
                                    </div>
                                    <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem', margin: '0.2rem 0' }}>{artist.email}</p>
                                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                                        <span><strong>{artist._count.tracks}</strong> Uploads</span>
                                        <span><strong>{artist._count.followedBy}</strong> Followers</span>
                                    </div>
                                </div>
                                <button
                                    className="btn-outline"
                                    style={{ borderColor: 'var(--destructive)', color: 'var(--destructive)' }}
                                    onClick={() => handleDeleteUser(artist)}
                                    disabled={processingIds.has(artist.id)}
                                >
                                    {processingIds.has(artist.id) ? <Loader2 size={18} className="spinner" /> : <X size={18} />}
                                    Delete
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
