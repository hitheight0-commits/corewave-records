"use client";

import React from 'react';
import { motion } from 'framer-motion';
import styles from './GenreGrid.module.css';
import Link from 'next/link';

const GENRES = [
    { name: 'Electronic', color: 'rgba(0, 112, 243, 0.8)', bg: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80&w=800' },
    { name: 'Hip Hop', color: 'rgba(155, 89, 182, 0.8)', bg: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&q=80&w=800' },
    { name: 'Ambient', color: 'rgba(34, 211, 238, 0.8)', bg: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&q=80&w=800' },
    { name: 'Lo-Fi', color: 'rgba(139, 92, 246, 0.8)', bg: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=800' },
    { name: 'Techno', color: 'rgba(0, 240, 255, 0.8)', bg: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?auto=format&fit=crop&q=80&w=800' },
    { name: 'Indie', color: 'rgba(245, 158, 11, 0.8)', bg: 'https://images.unsplash.com/photo-1526218626217-dc65a29bb444?auto=format&fit=crop&q=80&w=800' },
];

const GenreGrid = () => {
    return (
        <section className={styles.section}>
            <div className={styles.header}>
                <h2 className={styles.title}>Browse Genres</h2>
                <Link href="/explore" className={styles.viewAll}>Explore All</Link>
            </div>

            <div className={styles.grid}>
                {GENRES.map((genre, index) => (
                    <Link
                        key={genre.name}
                        href={`/explore?genre=${genre.name}`}
                        style={{ textDecoration: 'none' }}
                    >
                        <motion.div
                            className={styles.card}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            viewport={{ once: true }}
                        >
                            <div className={styles.bgWrapper}>
                                <img src={genre.bg} alt={genre.name} className={styles.bgImage} />
                                <div className={styles.overlay} style={{ background: `linear-gradient(to bottom, transparent, ${genre.color})` }}></div>
                            </div>
                            <h3 className={styles.genreName}>{genre.name}</h3>
                        </motion.div>
                    </Link>
                ))}
            </div>
        </section>
    );
};

export default GenreGrid;
