"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import styles from './Profile.module.css';
import { Play, Music, Users, Calendar, Heart, Loader2, ListMusic, ChevronRight, MoreHorizontal, Edit2, Trash2, X, Pause, Shield, Check, Camera } from 'lucide-react';
import { usePlayerStore, Track } from '@/store/usePlayerStore';
import { useToastStore } from '@/store/useToastStore';
import { useTranslation } from 'react-i18next';

type Tab = 'uploads' | 'playlists' | 'favorites' | 'following';

export default function ProfilePage() {
    const { t } = useTranslation();
    const { data: session, update } = useSession();
    const { addToast } = useToastStore();
    const [activeTab, setActiveTab] = useState<Tab>('uploads');
    const [tracks, setTracks] = useState<Track[]>([]);
    const [playlists, setPlaylists] = useState<any[]>([]);
    const [favorites, setFavorites] = useState<any[]>([]);
    const [following, setFollowing] = useState<any[]>([]);
    const [followerCount, setFollowerCount] = useState(0);
    const [verificationStatus, setVerificationStatus] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editForm, setEditForm] = useState({ name: '', bio: '' });
    const [isUpdating, setIsUpdating] = useState(false);

    // Track Management States
    const [activeTrackMenu, setActiveTrackMenu] = useState<string | null>(null);
    const [isEditTrackModalOpen, setIsEditTrackModalOpen] = useState(false);
    const [editingTrack, setEditingTrack] = useState<any>(null);
    const [editTrackForm, setEditTrackForm] = useState({ title: '', genre: '', mood: '' });

    const { currentTrack, isPlaying, setTrack, togglePlay, setQueue, favorites: globalFavorites, toggleFavorite } = usePlayerStore();
    const router = useRouter();

    useEffect(() => {
        if (session) {
            setEditForm({
                name: session.user.name || '',
                bio: (session.user as any).bio || ''
            });

            const fetchData = async () => {
                setLoading(true);
                try {
                    const [tracksRes, playlistsRes, favRes, followRes, profileRes] = await Promise.all([
                        fetch('/api/user/tracks'),
                        fetch('/api/playlists'),
                        fetch('/api/favorites'),
                        fetch('/api/user/following'),
                        fetch('/api/user/profile')
                    ]);

                    const tracksData = await tracksRes.json();
                    const playlistsData = await playlistsRes.json();
                    const favData = await favRes.json();
                    const followData = await followRes.json();
                    const profileData = await profileRes.json();

                    setTracks(tracksData.tracks || []);
                    setPlaylists(playlistsData.playlists || []);
                    setFavorites(favData.favorites || []);
                    setFollowing(followData.artists || []);
                    setFollowerCount(profileData.user?._count?.followedBy || 0);
                    setVerificationStatus(profileData.user?.verificationStatus || null);
                } catch (err) {
                    console.error("Fetch profile data error:", err);
                } finally {
                    setLoading(false);
                }
            };

            fetchData();
        }
    }, [session]);

    // [EXPERTISE] Real-time state synchronization logic
    // We listen to the global favorite IDs and re-synchronize the detailed track metadata
    // whenever the global state changes. This ensures absolute visibility in the dashboard.
    useEffect(() => {
        if (!session || loading) return;

        const syncFavorites = async () => {
            try {
                const favRes = await fetch('/api/favorites');
                const favData = await favRes.json();
                setFavorites(favData.favorites || []);
            } catch (err) {
                console.error("Dashboard synchronization failure:", err);
            }
        };

        syncFavorites();
    }, [globalFavorites.length, session, loading]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdating(true);
        try {
            const res = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm),
            });
            if (res.ok) {
                await update({ name: editForm.name, bio: editForm.bio }); // [FIX] Update session bio & name
                setIsEditModalOpen(false);
                addToast(t('profile.syncSuccess'));
            }
        } catch (err) {
            console.error("Update profile error:", err);
        } finally {
            setIsUpdating(false);
        }
    };

    const removeFavorite = async (trackId: string) => {
        try {
            await toggleFavorite(trackId);
            addToast(t('profile.favRemoved'));
        } catch (err) {
            console.error("Remove favorite orchestration error:", err);
        }
    };

    // Track Management Handlers
    const openEditTrack = (track: any) => {
        setEditingTrack(track);
        setEditTrackForm({
            title: track.title,
            genre: track.genre || '',
            mood: track.mood || ''
        });
        setIsEditTrackModalOpen(true);
        setActiveTrackMenu(null);
    };

    const handleUpdateTrack = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingTrack) return;
        setIsUpdating(true);
        try {
            const res = await fetch(`/api/tracks/${editingTrack.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editTrackForm)
            });
            if (res.ok) {
                const data = await res.json();
                setTracks(tracks.map(t => t.id === editingTrack.id ? { ...t, ...data.track } : t));
                setIsEditTrackModalOpen(false);
                addToast(t('profile.metaSyncSuccess'));
            }
        } catch (err) {
            addToast(t('profile.metaSyncError'), "error");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteTrack = async (trackId: string) => {
        if (!confirm(t('profile.deleteConfirm'))) return;
        try {
            const res = await fetch(`/api/tracks/${trackId}`, { method: 'DELETE' });
            if (res.ok) {
                setTracks(tracks.filter(t => t.id !== trackId));
                addToast(t('profile.deleteSuccess'));
                setActiveTrackMenu(null);
            }
        } catch (err) {
            addToast(t('artists.genericError'), "error");
        }
    };

    if (!session) return <div className="container" style={{ paddingTop: '10rem' }}>{t('profile.loginRequired')}</div>;

    const isArtist = session.user.role === 'ARTIST';

    return (
        <div className={styles.profilePage} onClick={() => setActiveTrackMenu(null)}>
            <div className={`container ${styles.container}`}>
                <header className={styles.profileHeader}>
                    <div className={styles.headerInfo}>
                        <div className={styles.avatarLarge}>
                            {session.user.image ? (
                                <img src={session.user.image} alt={session.user.name || 'User'} className={styles.avatarImage} />
                            ) : (
                                session.user.name?.[0]
                            )}
                        </div>
                        <div className={styles.meta}>
                            <span className={styles.roleTag}>{session.user.role}</span>
                            <h1>{session.user.name}</h1>
                            <p className={styles.profileBio} style={{ color: 'var(--muted-foreground)', maxWidth: '600px', margin: '0.5rem 0 1.5rem', lineHeight: '1.6' }}>
                                {(session.user as any).bio || t('profile.noBio')}
                            </p>
                            <div className={styles.stats}>
                                {isArtist && (
                                    <>
                                        <span><Music size={14} /> {t('artists.tracksCount', { count: tracks.length })}</span>
                                        <span><Users size={14} /> {t('artists.followers', { count: followerCount })}</span>
                                    </>
                                )}
                                <span><ListMusic size={14} /> {t('profile.playlists', { count: playlists.length })}</span>
                                <span><Heart size={14} /> {t('profile.favorites', { count: favorites.length })}</span>
                                <span><Users size={14} /> {t('profile.following', { count: following.length })}</span>
                            </div>
                        </div>
                        <div style={{ marginLeft: 'auto' }}>
                            <button className="btn-outline" onClick={() => setIsEditModalOpen(true)}>{t('profile.editProfile')}</button>
                        </div>
                    </div>

                    {/* [EXPERTISE] Verification Progress Widget - Backend Driven */}
                    {isArtist && !(session.user as any).isVerified && verificationStatus && (
                        <div className="premium-card" style={{
                            marginTop: '2rem',
                            padding: '1.5rem',
                            background: 'linear-gradient(90deg, rgba(34, 211, 238, 0.05) 0%, rgba(0, 0, 0, 0) 100%)',
                            borderLeft: '4px solid var(--corewave-cyan)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <Shield size={20} color="var(--corewave-cyan)" />
                                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{t('profile.verificationProtocol')}</h3>
                                </div>
                                <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>{t('profile.verificationBadge')}</span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', opacity: verificationStatus.hasImage ? 1 : 0.5 }}>
                                    {verificationStatus.hasImage ? <Check size={16} color="#10b981" /> : <div style={{ width: 16, height: 16, border: '2px solid var(--muted-foreground)', borderRadius: '50%' }} />}
                                    <span style={{ fontSize: '0.9rem' }}>{t('profile.criteriaVisual')}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', opacity: verificationStatus.hasBio ? 1 : 0.5 }}>
                                    {verificationStatus.hasBio ? <Check size={16} color="#10b981" /> : <div style={{ width: 16, height: 16, border: '2px solid var(--muted-foreground)', borderRadius: '50%' }} />}
                                    <span style={{ fontSize: '0.9rem' }}>{t('profile.criteriaBio')}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', opacity: verificationStatus.approvedTracks.pass ? 1 : 0.5 }}>
                                    {verificationStatus.approvedTracks.pass ? (
                                        <Check size={16} color="#10b981" />
                                    ) : (
                                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--muted-foreground)', width: 16, textAlign: 'center' }}>
                                            {verificationStatus.approvedTracks.current}/{verificationStatus.approvedTracks.required}
                                        </span>
                                    )}
                                    <span style={{ fontSize: '0.9rem' }}>{t('profile.criteriaTracks')}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', opacity: verificationStatus.followers.pass ? 1 : 0.5 }}>
                                    {verificationStatus.followers.pass ? (
                                        <Check size={16} color="#10b981" />
                                    ) : (
                                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--muted-foreground)', width: 16, textAlign: 'center' }}>
                                            {verificationStatus.followers.current}/{verificationStatus.followers.required}
                                        </span>
                                    )}
                                    <span style={{ fontSize: '0.9rem' }}>{t('profile.criteriaFollowers')}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', opacity: verificationStatus.plays.pass ? 1 : 0.5 }}>
                                    {verificationStatus.plays.pass ? (
                                        <Check size={16} color="#10b981" />
                                    ) : (
                                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--muted-foreground)', width: 16, textAlign: 'center' }}>
                                            {verificationStatus.plays.current >= 1000 ? '1k+' : verificationStatus.plays.current}/1k
                                        </span>
                                    )}
                                    <span style={{ fontSize: '0.9rem' }}>{t('profile.criteriaPlays')}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </header>

                {/* Edit Profile Modal */}
                {isEditModalOpen && (
                    <div className={styles.modalOverlay} onClick={() => setIsEditModalOpen(false)}>
                        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                            <h2>{t('profile.editModalTitle')}</h2>
                            <form onSubmit={handleUpdateProfile}>
                                <div className={styles.avatarUpload} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <div style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', background: 'var(--secondary)', border: '2px solid var(--border)' }}>
                                        {session.user.image ? (
                                            <img src={session.user.image} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>
                                                {session.user.name?.[0]}
                                            </div>
                                        )}
                                        <div
                                            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s', cursor: 'pointer' }}
                                            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                                            onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
                                            onClick={() => document.getElementById('profile-upload')?.click()}
                                        >
                                            <Camera size={24} color="white" />
                                        </div>
                                    </div>
                                    <input
                                        id="profile-upload"
                                        type="file"
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const data = new FormData();
                                                data.append('image', file);
                                                try {
                                                    const res = await fetch('/api/user/image', { method: 'POST', body: data });
                                                    if (res.ok) {
                                                        const result = await res.json();
                                                        await update({ image: result.imageUrl });
                                                        addToast(t('playlists.imageSuccess'));
                                                    }
                                                } catch (err) {
                                                    addToast(t('artists.genericError'), "error");
                                                }
                                            }
                                        }}
                                    />
                                    <span style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', marginTop: '0.5rem' }}>{t('profile.changePhoto')}</span>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>{t('profile.displayName')}</label>
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        placeholder={t('common.namePlaceholder')}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>{t('profile.shortBio')}</label>
                                    <textarea
                                        rows={4}
                                        value={editForm.bio}
                                        onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                                        placeholder={t('profile.shortBio')}
                                    />
                                </div>
                                <div className={styles.modalActions}>
                                    <button type="button" className="btn-outline" onClick={() => setIsEditModalOpen(false)}>{t('profile.cancel')}</button>
                                    <button type="submit" className="btn-primary" disabled={isUpdating}>
                                        {isUpdating ? t('profile.saving') : t('profile.saveChanges')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Edit Track Modal */}
                {isEditTrackModalOpen && (
                    <div className={styles.modalOverlay} onClick={() => setIsEditTrackModalOpen(false)}>
                        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                            <h2>{t('profile.modifyTrack')}</h2>
                            <form onSubmit={handleUpdateTrack}>
                                <div className={styles.formGroup}>
                                    <label>{t('profile.trackTitle')}</label>
                                    <input
                                        type="text"
                                        value={editTrackForm.title}
                                        onChange={(e) => setEditTrackForm({ ...editTrackForm, title: e.target.value })}
                                        placeholder={t('profile.trackTitle')}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>{t('profile.genre')}</label>
                                    <input
                                        type="text"
                                        value={editTrackForm.genre}
                                        onChange={(e) => setEditTrackForm({ ...editTrackForm, genre: e.target.value })}
                                        placeholder="Electronic, Hip Hop, etc."
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>{t('profile.mood')}</label>
                                    <input
                                        type="text"
                                        value={editTrackForm.mood}
                                        onChange={(e) => setEditTrackForm({ ...editTrackForm, mood: e.target.value })}
                                        placeholder="Energetic, Chill, Ambient..."
                                    />
                                </div>
                                <div className={styles.modalActions}>
                                    <button type="button" className="btn-outline" onClick={() => setIsEditTrackModalOpen(false)}>{t('profile.cancel')}</button>
                                    <button type="submit" className="btn-primary" disabled={isUpdating}>
                                        {isUpdating ? t('profile.syncing') : t('profile.updateMetadata')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                <div className={styles.contentGrid}>
                    <aside className={styles.sidebar}>
                        <nav className={styles.sideNav}>
                            {isArtist && (
                                <button
                                    className={activeTab === 'uploads' ? styles.sideLinkActive : styles.sideLink}
                                    onClick={() => setActiveTab('uploads')}
                                >
                                    {t('profile.tabs.uploads')}
                                </button>
                            )}
                            <button
                                className={activeTab === 'playlists' ? styles.sideLinkActive : styles.sideLink}
                                onClick={() => setActiveTab('playlists')}
                            >
                                {t('profile.tabs.playlists')}
                            </button>
                            <button
                                className={activeTab === 'favorites' ? styles.sideLinkActive : styles.sideLink}
                                onClick={() => setActiveTab('favorites')}
                            >
                                {t('profile.tabs.favorites')}
                            </button>
                            <button
                                className={activeTab === 'following' ? styles.sideLinkActive : styles.sideLink}
                                onClick={() => setActiveTab('following')}
                            >
                                {t('profile.tabs.following')}
                            </button>
                        </nav>
                    </aside>

                    <main className={styles.mainContent}>
                        {activeTab === 'uploads' && isArtist && (
                            <section className={styles.section}>
                                <div className={styles.sectionHeader}>
                                    <h2>{t('profile.sectionHeaders.uploads')}</h2>
                                    <button className="btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }} onClick={() => router.push('/upload')}>{t('profile.btnUploadNew')}</button>
                                </div>

                                {loading ? (
                                    <div className={styles.loadingContainer}>
                                        <Loader2 className={styles.spinner} size={32} />
                                    </div>
                                ) : tracks.length === 0 ? (
                                    <div className={styles.emptyState}>
                                        <Music size={48} className={styles.emptyIcon} />
                                        <h3>{t('profile.empty.noTracks')}</h3>
                                        <p>{t('profile.empty.noTracksSub')}</p>
                                        <button className="btn-primary" onClick={() => router.push('/upload')}>{t('profile.empty.uploadNow')}</button>
                                    </div>
                                ) : (
                                    <div className={styles.trackList}>
                                        {tracks.map((track) => (
                                            <div key={track.id} className={styles.trackRow}>
                                                <div className={styles.trackInfo}>
                                                    <img src={track.coverUrl} alt={track.title} className={styles.trackThumb} />
                                                    <div className={styles.trackMeta}>
                                                        <div className={styles.titleRow}>
                                                            <h3>{track.title}</h3>
                                                            <span className={`${styles.statusBadge} ${styles[track.status?.toLowerCase() || 'pending']}`}>
                                                                {track.status || 'PENDING'}
                                                            </span>
                                                        </div>
                                                        <p>{track.genre} • {track.mood}</p>
                                                    </div>
                                                </div>
                                                <div className={styles.trackActions}>
                                                    <button
                                                        className={styles.playBtn}
                                                        onClick={() => {
                                                            if (currentTrack?.id === track.id) {
                                                                togglePlay();
                                                            } else {
                                                                setTrack(track);
                                                                const index = tracks.findIndex(t => t.id === track.id);
                                                                const remaining = tracks.slice(index + 1);
                                                                setQueue(remaining);
                                                            }
                                                        }}
                                                    >
                                                        {currentTrack?.id === track.id && isPlaying ? (
                                                            <Pause fill="currentColor" size={16} />
                                                        ) : (
                                                            <Play fill="currentColor" size={16} />
                                                        )}
                                                    </button>

                                                    <div className={styles.menuWrapper}>
                                                        <button
                                                            className={styles.actionBtn}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setActiveTrackMenu(activeTrackMenu === track.id ? null : track.id);
                                                            }}
                                                        >
                                                            <MoreHorizontal size={20} />
                                                        </button>
                                                        {activeTrackMenu === track.id && (
                                                            <div className={styles.dropdownMenu} onClick={(e) => e.stopPropagation()}>
                                                                <button onClick={() => openEditTrack(track)}>
                                                                    <Edit2 size={14} /> {t('profile.trackMenu.modify')}
                                                                </button>
                                                                <button className={styles.menuItemDelete} onClick={() => handleDeleteTrack(track.id)}>
                                                                    <Trash2 size={14} /> {t('profile.trackMenu.remove')}
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        )}

                        {activeTab === 'playlists' && (
                            <section className={styles.section}>
                                <div className={styles.sectionHeader}>
                                    <h2>{t('profile.sectionHeaders.collections')}</h2>
                                    <span className={styles.subtitle}>{t('profile.nodesSynchronized', { count: playlists.length })}</span>
                                </div>

                                {loading ? (
                                    <div className={styles.loadingContainer}>
                                        <Loader2 className={styles.spinner} size={32} />
                                    </div>
                                ) : playlists.length === 0 ? (
                                    <div className={styles.emptyState}>
                                        <ListMusic size={48} className={styles.emptyIcon} />
                                        <h3>{t('profile.empty.noPlaylists')}</h3>
                                        <p>{t('profile.empty.noPlaylistsSub')}</p>
                                    </div>
                                ) : (
                                    <div className={styles.playlistGrid}>
                                        {playlists.map((playlist) => (
                                            <div
                                                key={playlist.id}
                                                className={styles.playlistCard}
                                                onClick={() => router.push(`/playlists/${playlist.id}`)}
                                            >
                                                <div className={styles.playlistAvatar}>
                                                    {playlist.coverUrl ? (
                                                        <img src={playlist.coverUrl} alt={playlist.name} />
                                                    ) : (
                                                        <ListMusic size={32} color="rgba(255,255,255,0.3)" />
                                                    )}
                                                </div>
                                                <div className={styles.playlistInfo}>
                                                    <h4>{playlist.name}</h4>
                                                    <p>{t('profile.tracksSynchronizedCount', { count: playlist._count.tracks })}</p>
                                                    <div className={styles.playlistTag}>{t('profile.nodeTag')}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        )}

                        {activeTab === 'favorites' && (
                            <section className={styles.section}>
                                <div className={styles.sectionHeader}>
                                    <h2>{t('profile.sectionHeaders.favorites')}</h2>
                                    <span className={styles.subtitle}>{t('profile.likedTracksCount', { count: favorites.length })}</span>
                                </div>

                                {loading ? (
                                    <div className={styles.loadingContainer}>
                                        <Loader2 className={styles.spinner} size={32} />
                                    </div>
                                ) : favorites.length === 0 ? (
                                    <div className={styles.emptyState}>
                                        <Heart size={48} className={styles.emptyIcon} />
                                        <h3>{t('profile.empty.noFavorites')}</h3>
                                        <p>{t('profile.empty.noFavoritesSub')}</p>
                                        <button className="btn-primary" onClick={() => router.push('/explore')}>{t('profile.empty.exploreMusic')}</button>
                                    </div>
                                ) : (
                                    <div className={styles.trackList}>
                                        {favorites.map((fav) => (
                                            <div key={fav.id} className={styles.trackRow}>
                                                <div className={styles.trackInfo}>
                                                    <img src={fav.track.coverUrl} alt={fav.track.title} className={styles.trackThumb} />
                                                    <div className={styles.trackMeta}>
                                                        <h3>{fav.track.title}</h3>
                                                        <p>
                                                            {typeof fav.track.artist === 'object' ? (fav.track.artist as any).name : fav.track.artist}
                                                            {" • "}
                                                            {fav.track.genre}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className={styles.trackActions}>
                                                    <button
                                                        className={styles.playBtn}
                                                        onClick={() => {
                                                            if (currentTrack?.id === fav.track.id) {
                                                                togglePlay();
                                                            } else {
                                                                setTrack(fav.track);
                                                                const currentIndex = favorites.findIndex(f => f.track.id === fav.track.id);
                                                                const remaining = favorites.slice(currentIndex + 1).map(f => f.track);
                                                                setQueue(remaining);
                                                            }
                                                        }}
                                                    >
                                                        {currentTrack?.id === fav.track.id && isPlaying ? (
                                                            <Pause fill="currentColor" size={16} />
                                                        ) : (
                                                            <Play fill="currentColor" size={16} />
                                                        )}
                                                    </button>
                                                    <button
                                                        className={styles.unlikeBtn}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            removeFavorite(fav.track.id);
                                                        }}
                                                        title={t('profile.trackMenu.remove')}
                                                    >
                                                        <Heart fill="currentColor" size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        )}

                        {activeTab === 'following' && (
                            <section className={styles.section}>
                                <div className={styles.sectionHeader}>
                                    <h2>{t('profile.sectionHeaders.followedArtists')}</h2>
                                    <span className={styles.subtitle}>{t('profile.followingCount', { count: following.length })}</span>
                                </div>

                                {loading ? (
                                    <div className={styles.loadingContainer}>
                                        <Loader2 className={styles.spinner} size={32} />
                                    </div>
                                ) : following.length === 0 ? (
                                    <div className={styles.emptyState}>
                                        <Users size={48} className={styles.emptyIcon} />
                                        <h3>{t('profile.empty.noFollowing')}</h3>
                                        <p>{t('profile.empty.noFollowingSub')}</p>
                                        <button className="btn-primary" onClick={() => router.push('/artists')}>{t('profile.empty.findArtists')}</button>
                                    </div>
                                ) : (
                                    <div className={styles.artistGrid}>
                                        {following.map((artist) => (
                                            <div key={artist.id} className={styles.artistCard}>
                                                <div className={styles.artistAvatar}>
                                                    {artist.image ? (
                                                        <img src={artist.image} alt={artist.name} />
                                                    ) : (
                                                        artist.name?.[0]
                                                    )}
                                                </div>
                                                <div className={styles.artistInfo}>
                                                    <h4>{artist.name}</h4>
                                                    <p>{t('artists.followers', { count: artist._count.followedBy })}</p>
                                                    <button
                                                        className="btn-outline"
                                                        style={{ padding: '0.3rem 0.8rem', fontSize: '0.75rem', marginTop: '0.5rem' }}
                                                        onClick={() => router.push(`/artists/${artist.id}`)}
                                                    >
                                                        {t('profile.viewProfile')}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
