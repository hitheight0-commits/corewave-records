"use client";

import { useEffect, useState, use, useRef } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ChevronLeft, Play, Clock, Music, Loader2, MoreHorizontal, ListMusic, Camera, Edit2, Trash2, X } from "lucide-react";
import styles from "./Playlist.module.css";
import { usePlayerStore, Track } from "@/store/usePlayerStore";
import { useToastStore } from "@/store/useToastStore";

interface PlaylistPageProps {
    params: Promise<{ id: string }>;
}

export default function PlaylistDetailPage({ params }: PlaylistPageProps) {
    const { id } = use(params);
    const { data: session } = useSession();
    const { setTrack, currentTrack, isPlaying, togglePlay } = usePlayerStore();
    const { addToast } = useToastStore();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [playlist, setPlaylist] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Orchestration States
    const [isRenaming, setIsRenaming] = useState(false);
    const [newName, setNewName] = useState("");
    const [activeTrackMenu, setActiveTrackMenu] = useState<string | null>(null);

    useEffect(() => {
        const fetchPlaylist = async () => {
            try {
                const res = await fetch(`/api/playlists/${id}`);
                const data = await res.json();

                if (data.error) {
                    setError(data.error);
                } else {
                    setPlaylist(data.playlist);
                    setNewName(data.playlist.name);
                }
            } catch (err) {
                console.error("Failed to fetch playlist", err);
                setError("Internal protocol failure.");
            } finally {
                setLoading(false);
            }
        };

        fetchPlaylist();
    }, [id]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("image", file);

        try {
            const res = await fetch(`/api/playlists/${id}/image`, {
                method: "POST",
                body: formData,
            });
            const data = await res.json();

            if (data.imageUrl) {
                setPlaylist({ ...playlist, coverUrl: data.imageUrl });
                addToast("Visual identity updated successfully.");
            } else {
                addToast(data.error || "Image synchronization failed.", "error");
            }
        } catch (err) {
            addToast("Global orchestration error.", "error");
        } finally {
            setUploading(false);
        }
    };

    const handleRename = async () => {
        if (!newName.trim()) return;
        try {
            const res = await fetch(`/api/playlists/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newName })
            });
            const data = await res.json();
            if (data.playlist) {
                setPlaylist({ ...playlist, name: data.playlist.name });
                setIsRenaming(false);
                addToast("Node metadata updated.");
            }
        } catch (err) {
            addToast("Rename synchronization failure.", "error");
        }
    };

    const removeTrack = async (trackId: string) => {
        try {
            const res = await fetch(`/api/playlists/${id}/tracks/${trackId}`, {
                method: "DELETE"
            });
            if (res.ok) {
                setPlaylist({
                    ...playlist,
                    tracks: playlist.tracks.filter((t: any) => t.id !== trackId)
                });
                addToast("Track removed from node.");
                setActiveTrackMenu(null);
            }
        } catch (err) {
            addToast("Orchestration removal failure.", "error");
        }
    };

    if (loading) {
        return (
            <div className={styles.centerBox}>
                <Loader2 className="spinner" size={48} color="var(--corewave-cyan)" />
                <p>Synchronizing node data...</p>
            </div>
        );
    }

    if (error || !playlist) {
        return (
            <div className={styles.centerBox}>
                <h2 className="text-gradient">404: Node Missing</h2>
                <p>{error || "The requested orchestration node could not be localized."}</p>
                <Link href="/profile" className="btn-primary" style={{ marginTop: '2rem' }}>
                    Return to Profile
                </Link>
            </div>
        );
    }

    const tracks = playlist.tracks || [];
    const isOwner = session?.user?.id === playlist.userId;

    return (
        <main className={styles.playlistPage} onClick={() => setActiveTrackMenu(null)}>
            <div className={`container ${styles.container}`}>
                <Link href="/profile" className={styles.backBtn}>
                    <ChevronLeft size={20} />
                    Back to Profile
                </Link>

                <header className={styles.header}>
                    <div className={styles.coverWrapper}>
                        <div className={styles.coverContainer}>
                            {playlist.coverUrl ? (
                                <img src={playlist.coverUrl} alt={playlist.name} className={styles.cover} />
                            ) : (
                                <div className={styles.placeholderCover}>
                                    <ListMusic size={64} color="rgba(255,255,255,0.2)" />
                                </div>
                            )}
                            {isOwner && (
                                <div className={styles.editOverlay} onClick={() => fileInputRef.current?.click()}>
                                    {uploading ? <Loader2 className="spinner" size={24} /> : <Camera size={24} />}
                                    <span>Change Identity</span>
                                </div>
                            )}
                        </div>
                        <div className={styles.coverGlow}></div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                            style={{ display: 'none' }}
                            accept="image/*"
                        />
                    </div>

                    <div className={styles.headerMeta}>
                        <span className={styles.tag}>PLAYLIST NODE</span>
                        {isRenaming ? (
                            <div className={styles.renameWrapper}>
                                <input
                                    className={styles.renameInput}
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") handleRename();
                                        if (e.key === "Escape") setIsRenaming(false);
                                    }}
                                />
                                <button onClick={handleRename} className={styles.renameBtn}><Loader2 size={16} className={styles.syncIcon} /> Sync</button>
                                <button onClick={() => setIsRenaming(false)} className={styles.cancelBtn}><X size={16} /></button>
                            </div>
                        ) : (
                            <h1 className="text-gradient">{playlist.name}</h1>
                        )}
                        <div className={styles.stats}>
                            <img
                                src={playlist.user?.image || "/default-avatar.png"}
                                alt=""
                                className={styles.userIcon}
                            />
                            <span className={styles.userName}>{playlist.user?.name}</span>
                            <span className={styles.dot}>•</span>
                            <span>{tracks.length} tracks synchronized</span>
                        </div>
                    </div>
                </header>

                <div className={styles.actionRow}>
                    <button
                        className={styles.playAllBtn}
                        onClick={() => tracks.length > 0 && setTrack(tracks[0])}
                    >
                        <Play fill="currentColor" size={24} />
                        Play Node
                    </button>
                    {isOwner && (
                        <button className={styles.editBtn} onClick={(e) => { e.stopPropagation(); setIsRenaming(!isRenaming); }}>
                            <Edit2 size={18} />
                            Modify Node
                        </button>
                    )}
                </div>

                <section className={styles.trackSection}>
                    <div className={styles.tableHeader}>
                        <div className={styles.colNumber}>#</div>
                        <div className={styles.colTitle}>Title</div>
                        <div className={styles.colGenre}>Genre</div>
                        <div className={styles.colDuration}><Clock size={16} /></div>
                    </div>

                    <div className={styles.trackList}>
                        {tracks.length === 0 ? (
                            <div className={styles.emptyState}>
                                <Music size={48} opacity={0.2} />
                                <p>No tracks orchestrated in this node yet.</p>
                                <Link href="/explore" className="btn-outline" style={{ marginTop: '1rem' }}>
                                    Explore Music
                                </Link>
                            </div>
                        ) : (
                            tracks.map((track: Track, index: number) => {
                                const isActive = currentTrack?.id === track.id;
                                return (
                                    <div
                                        key={track.id}
                                        className={`${styles.trackRow} ${isActive ? styles.activeTrack : ''}`}
                                        onClick={() => {
                                            if (isActive) togglePlay(); else setTrack(track);
                                        }}
                                    >
                                        <div className={styles.colNumber}>
                                            {isActive && isPlaying ? (
                                                <div className={styles.playingBars}>
                                                    <span></span><span></span><span></span>
                                                </div>
                                            ) : index + 1}
                                        </div>
                                        <div className={styles.colTitle}>
                                            <img src={track.coverUrl} alt="" className={styles.rowThumb} />
                                            <div>
                                                <p className={styles.rowTitle}>{track.title}</p>
                                                <p className={styles.rowArtist}>
                                                    {typeof track.artist === 'object' ? (track.artist as any).name : track.artist}
                                                </p>
                                            </div>
                                        </div>
                                        <div className={styles.colGenre}>{track.genre}</div>
                                        <div className={styles.colDuration}>3:42</div>
                                        <div className={styles.trackActionWrapper}>
                                            <button
                                                className={styles.rowAction}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActiveTrackMenu(activeTrackMenu === track.id ? null : track.id);
                                                }}
                                            >
                                                <MoreHorizontal size={18} />
                                            </button>
                                            {activeTrackMenu === track.id && isOwner && (
                                                <div className={styles.trackMenu} onClick={(e) => e.stopPropagation()}>
                                                    <button className={styles.menuItemDelete} onClick={() => removeTrack(track.id)}>
                                                        <Trash2 size={14} /> Remove Track
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
}
