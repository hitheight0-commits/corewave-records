"use client";

import { useEffect, useState, useRef } from "react";
import { Search, Music, Users, X, Command } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { usePlayerStore } from "@/store/usePlayerStore";
import styles from "./CommandPalette.module.css";

const CommandPalette = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<{ artists: any[], tracks: any[] }>({ artists: [], tracks: [] });
    const [loading, setLoading] = useState(false);
    const [activeFilter, setActiveFilter] = useState<'all' | 'tracks' | 'artists'>('all');
    const [activeIndex, setActiveIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const { setTrack } = usePlayerStore();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
            if (e.key === "Escape") setIsOpen(false);
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    useEffect(() => {
        if (!query || query.length < 2) {
            setResults({ artists: [], tracks: [] });
            return;
        }

        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
                const data = await res.json();
                setResults(data);
            } catch (err) {
                console.error("Search failed:", err);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    const handleSelect = (item: any, type: 'artist' | 'track') => {
        if (type === 'artist') {
            router.push(`/artists/${item.id}`);
        } else {
            setTrack(item);
        }
        setIsOpen(false);
        setQuery("");
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={styles.overlay}
                        onClick={() => setIsOpen(false)}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        className={styles.palette}
                    >
                        <div className={styles.searchHeader}>
                            <Search className={styles.searchIcon} size={20} />
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Search tracks, artists, genres..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className={styles.input}
                            />
                            <div className={styles.kbd}><Command size={12} /> K</div>
                        </div>

                        <div className={styles.filters}>
                            {(['all', 'tracks', 'artists'] as const).map(f => (
                                <button
                                    key={f}
                                    className={`${styles.filterBtn} ${activeFilter === f ? styles.activeFilter : ''}`}
                                    onClick={() => setActiveFilter(f)}
                                >
                                    {f.charAt(0).toUpperCase() + f.slice(1)}
                                </button>
                            ))}
                        </div>

                        <div className={styles.content}>
                            {loading ? (
                                <div className={styles.loading}>Searching the ecosystem...</div>
                            ) : query.length < 2 ? (
                                <div className={styles.empty}>
                                    <p>Try searching for your favorite artist or a fresh genre.</p>
                                    <div className={styles.suggestions}>
                                        <span>"Electronic"</span>
                                        <span>"Oblivéra"</span>
                                        <span>"Chill"</span>
                                    </div>
                                </div>
                            ) : results.artists.length === 0 && results.tracks.length === 0 ? (
                                <div className={styles.noResults}>No matches found for "{query}"</div>
                            ) : (
                                <div className={styles.resultsGrid}>
                                    {(activeFilter === 'all' || activeFilter === 'artists') && results.artists.length > 0 && (
                                        <section className={styles.section}>
                                            <h3>Artists</h3>
                                            {results.artists.map(artist => (
                                                <div
                                                    key={artist.id}
                                                    className={styles.item}
                                                    onClick={() => handleSelect(artist, 'artist')}
                                                >
                                                    <div className={styles.avatar}>
                                                        {artist.image ? <img src={artist.image} alt={artist.name} /> : artist.name?.[0]}
                                                    </div>
                                                    <div className={styles.itemInfo}>
                                                        <span className={styles.itemName}>{artist.name}</span>
                                                        <span className={styles.itemMeta}>{artist._count.followedBy} Followers</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </section>
                                    )}

                                    {(activeFilter === 'all' || activeFilter === 'tracks') && results.tracks.length > 0 && (
                                        <section className={styles.section}>
                                            <h3>Tracks</h3>
                                            {results.tracks.map(track => (
                                                <div
                                                    key={track.id}
                                                    className={styles.item}
                                                    onClick={() => handleSelect(track, 'track')}
                                                >
                                                    <img src={track.coverUrl} className={styles.thumb} alt={track.title} />
                                                    <div className={styles.itemInfo}>
                                                        <span className={styles.itemName}>{track.title}</span>
                                                        <span className={styles.itemMeta}>{track.genre}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </section>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className={styles.footer}>
                            <span>Navigate with arrows</span>
                            <span>Select with Enter</span>
                            <span>Close with Esc</span>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CommandPalette;
