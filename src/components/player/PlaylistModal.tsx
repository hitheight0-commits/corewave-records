"use client";

import { useState, useEffect } from "react";
import { Plus, Music, X, PlusCircle, Check, Loader2, ListMusic, Loader } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./PlaylistModal.module.css";
import { Track } from "@/types";
import { useToastStore } from "@/store/useToastStore";
import { useUIStore } from "@/store/useUIStore";

const PlaylistModal = () => {
    const { isPlaylistModalOpen, playlistModalTrack, closePlaylistModal } = useUIStore();
    // Helper vars for compatibility
    const track = playlistModalTrack;
    const isOpen = isPlaylistModalOpen;
    const onClose = closePlaylistModal;

    const [playlists, setPlaylists] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [actionId, setActionId] = useState<string | null>(null);
    const [newPlaylistName, setNewPlaylistName] = useState("");
    const { addToast } = useToastStore();

    useEffect(() => {
        if (isOpen && track) {
            fetchPlaylists();
        }
    }, [isOpen, track]);

    const fetchPlaylists = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/playlists");
            const data = await res.json();
            setPlaylists(data.playlists || []);
        } catch (error) {
            console.error("[ORCHESTRATOR] Failed to fetch playlists", error);
        } finally {
            setLoading(false);
        }
    };

    const addToPlaylist = async (playlistId: string) => {
        if (!track?.id) {
            addToast("Critical Error: Track ID missing from state.", "error");
            return;
        }

        setActionId(playlistId);

        try {
            const res = await fetch(`/api/playlists/${playlistId}/tracks`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ trackId: track.id }),
            });
            const data = await res.json();

            if (res.status === 409) {
                addToast("Identity already established in this node.", "info");
                return;
            }

            if (data.success) {
                addToast(`Orchestration of "${track.title}" complete.`);
                // fetchPlaylists(); // Not strictly needed if we close immediately, but good practice
                setTimeout(onClose, 800);
            } else {
                addToast(data.error || "Synchronisation failure detected.", "error");
            }
        } catch (error) {
            addToast("Global orchestration error.", "error");
        } finally {
            setActionId(null);
        }
    };

    const createPlaylist = async () => {
        if (!newPlaylistName.trim()) return;
        setCreating(true);
        try {
            const res = await fetch("/api/playlists", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newPlaylistName }),
            });
            const data = await res.json();
            if (data.playlist) {
                addToast("New playlist node established.");
                setNewPlaylistName("");
                fetchPlaylists();
            }
        } catch (error) {
            addToast("Node creation failed.", "error");
        } finally {
            setCreating(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && track && (
                <div className={styles.wrapper}>
                    <motion.div
                        className={styles.overlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />
                    <motion.div
                        className={styles.modal}
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 30, scale: 0.95 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <header className={styles.header}>
                            <div className={styles.titleArea}>
                                <div className={styles.titleIconBox}>
                                    <ListMusic size={18} color="white" />
                                </div>
                                <h2 style={{ color: 'white' }}>Orchestrate to Playlist</h2>
                            </div>
                            <button onClick={onClose} className={styles.closeBtn}><X size={18} /></button>
                        </header>

                        <div className={styles.trackSummary}>
                            <div className={styles.trackImageWrapper}>
                                <img src={track.coverUrl} alt={track.title} />
                                <div className={styles.trackPulse}></div>
                            </div>
                            <div className={styles.trackInfo}>
                                <p className={styles.title} style={{ color: 'white' }}>{track.title}</p>
                                <p className={styles.artist} style={{ color: 'rgba(255,255,255,0.6)' }}>
                                    {typeof track.artist === 'object' ? (track.artist as any).name : track.artist}
                                </p>
                            </div>
                        </div>

                        <div className={styles.content}>
                            <div className={styles.createBox}>
                                <div className={styles.inputContainer}>
                                    <Plus size={18} className={styles.inputIcon} />
                                    <input
                                        type="text"
                                        placeholder="Establish new node..."
                                        value={newPlaylistName}
                                        onChange={(e) => setNewPlaylistName(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && createPlaylist()}
                                        style={{ color: 'white' }}
                                    />
                                </div>
                                <button
                                    className={styles.addBtn}
                                    onClick={createPlaylist}
                                    disabled={creating || !newPlaylistName.trim()}
                                >
                                    {creating ? <Loader2 className="spinner" size={18} /> : <Check size={18} />}
                                </button>
                            </div>

                            <div className={styles.list}>
                                {loading && playlists.length === 0 ? (
                                    <div className={styles.loading}>
                                        <Loader2 className="spinner" size={24} color="var(--corewave-cyan)" />
                                        <p style={{ color: 'rgba(255,255,255,0.5)' }}>Synchronizing infrastructure...</p>
                                    </div>
                                ) : playlists.length === 0 ? (
                                    <div className={styles.empty}>
                                        <div className={styles.emptyIconBox}>
                                            <Music size={32} color="rgba(255,255,255,0.2)" />
                                        </div>
                                        <p style={{ color: 'rgba(255,255,255,0.4)' }}>No active nodes detected.</p>
                                    </div>
                                ) : (
                                    playlists.map((playlist) => (
                                        <button
                                            key={playlist.id}
                                            className={styles.playlistItem}
                                            onClick={() => addToPlaylist(playlist.id)}
                                            disabled={actionId === playlist.id}
                                        >
                                            <div className={styles.playlistCover}>
                                                {playlist.coverUrl ? (
                                                    <img src={playlist.coverUrl} alt="" />
                                                ) : (
                                                    <ListMusic size={18} />
                                                )}
                                            </div>
                                            <div className={styles.playlistMeta}>
                                                <p className={styles.pName} style={{ color: 'white' }}>{playlist.name}</p>
                                                <p className={styles.pCount} style={{ color: 'rgba(255,255,255,0.4)' }}>
                                                    {playlist._count.tracks} items orchestrated
                                                </p>
                                            </div>
                                            <div className={styles.actionIcon}>
                                                {actionId === playlist.id ? (
                                                    <Loader2 className="spinner" size={16} />
                                                ) : (
                                                    <PlusCircle size={20} />
                                                )}
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default PlaylistModal;
