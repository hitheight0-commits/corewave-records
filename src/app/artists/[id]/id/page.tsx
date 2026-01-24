"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import styles from './ArtistProfile.module.css';
import { Play, Music, Users, Calendar, CheckCircle, Share2, Heart, Loader2 } from 'lucide-react';
import { usePlayerStore, Track } from '@/store/usePlayerStore';

export default function ArtistProfilePage() {
    const { id } = useParams();
    const [artist, setArtist] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { setTrack } = usePlayerStore();

    useEffect(() => {
        if (id) {
            fetch(`/api/artists/${id}`)
                .then(res => res.json())
                .then(data => {
                    setArtist(data.artist);
                    setLoading(false);
                })
                .catch(err => {
                    console.error(err);
                    setLoading(false);
                });
        }
    }, [id]);

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
                            <div className={styles.verified}>
                                <CheckCircle size={14} fill="currentColor" stroke="var(--background)" /> Verified Artist
                            </div>
                            <h1 className={styles.name}>{artist.name}</h1>
                            <div className={styles.stats}>
                                <span className={styles.statItem}><Music size={16} /> {artist._count.tracks} Tracks</span>
                                <span className={styles.statItem}><Users size={16} /> {artist._count.followedBy} Followers</span>
                                <span className={styles.statItem}><Calendar size={16} /> Joined {new Date(artist.createdAt).getFullYear()}</span>
                            </div>
                        </div>
                        <div className={styles.actions}>
                            <button className="btn-primary" style={{ padding: '0.6rem 1.5rem' }}>Follow</button>
                            <button className="btn-outline" style={{ width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
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
                                <button className="btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>Play All</button>
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
                                            <div style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem' }}>{track.plays.toLocaleString()} plays</div>
                                            <button className={styles.playBtn} onClick={() => setTrack(track)}>
                                                <Play size={18} fill="currentColor" />
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
                                {/* Placeholder for similar artists */}
                                <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem' }}>Discovery engine is analyzing sound patterns...</p>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
