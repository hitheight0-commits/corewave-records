"use client";

import styles from './Hero.module.css';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';

const Hero = () => {
    const { data: session, status } = useSession();
    return (
        <section className={styles.hero}>
            <div className={styles.backgroundEffects}>
                <div className={styles.lightRays}></div>
            </div>

            <div className={`container ${styles.content}`}>
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className={styles.eyebrow}
                >
                    ✦ ESTABLISHED 2024
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 36 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className={styles.title}
                >
                    The Future of Sound
                    <span className={styles.titleHighlight}>is Here.</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className={styles.subtitle}
                >
                    Precision engineering meets creative chaos. Join the
                    world&apos;s most advanced ecosystem for independent creators
                    and sonic pioneers.
                </motion.p>

                <motion.div
                    className={styles.actions}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.35 }}
                >
                    {status === 'authenticated' ? (
                        <Link href="/explore" className={styles.btnPrimary}>
                            GO TO STUDIO
                        </Link>
                    ) : (
                        <Link href="/signup?role=artist" className={styles.btnPrimary}>
                            JOIN THE REVOLUTION
                        </Link>
                    )}
                    <Link href="/explore" className={styles.btnSecondary}>
                        Explore the Void
                    </Link>
                </motion.div>
            </div>

            {/* Scroll indicator */}
            <div className={styles.scrollHint}>
                <div className={styles.scrollLine}></div>
            </div>
        </section>
    );
};

export default Hero;
