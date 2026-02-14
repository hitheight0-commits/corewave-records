"use client";

import { useEffect, useState, useRef } from "react";
import { Search, Music, Users, X, Command } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { usePlayerStore } from "@/store/usePlayerStore";
import { useTranslation } from 'react-i18next';
import styles from "./CommandPalette.module.css";

const CommandPalette = () => {
    const { t } = useTranslation();
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
                                placeholder={t('search.placeholder')}
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
                                    {t(`search.filters.${f}`)}
                                </button>
                            ))}
                        </div>

                        <div className={styles.content}>
                            {loading ? (
                                <div className={styles.loading}>{t('search.loading')}</div>
                            ) : query.length < 2 ? (
                                <div className={styles.empty}>
                                    <p>{t('search.empty.title')}</p>
                                    <div className={styles.suggestions}>
                                        <span>"{t('search.empty.suggestions.electronic')}"</span>
                                        <span>"{t('search.empty.suggestions.oblivera')}"</span>
                                        <span>"{t('search.empty.suggestions.chill')}"</span>
                                    </div>
                                </div>
                            ) : results.artists.length === 0 && results.tracks.length === 0 ? (
                                <div className={styles.noResults}>{t('search.noResults', { query })}</div>
                            ) : (
                                <div className={styles.resultsGrid}>
                                    {(activeFilter === 'all' || activeFilter === 'artists') && results.artists.length > 0 && (
                                        <section className={styles.section}>
                                            <h3>{t('search.filters.artists')}</h3>
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
                                                        <span className={styles.itemMeta}>{t('artists.followers', { count: artist._count.followedBy })}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </section>
                                    )}

                                    {(activeFilter === 'all' || activeFilter === 'tracks') && results.tracks.length > 0 && (
                                        <section className={styles.section}>
                                            <h3>{t('search.filters.tracks')}</h3>
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
                            <span>{t('search.shortcuts.navigate')}</span>
                            <span>{t('search.shortcuts.select')}</span>
                            <span>{t('search.shortcuts.close')}</span>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CommandPalette;
