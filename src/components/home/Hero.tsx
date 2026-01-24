"use client";

import styles from './Hero.module.css';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Magnetic from '../common/Magnetic';

import { useSession } from 'next-auth/react';

const Hero = () => {
    const { data: session, status } = useSession();
    return (
        <section className={styles.hero}>
            <div className="mesh-bg"></div>

            <div className={`container ${styles.content}`}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className={styles.badge}
                >
                    Next Generation Distribution
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className={styles.title}
                >
                    The Future of <br />
                    <span className="text-gradient">Sound is Here.</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className={`${styles.subtitle} catchy-subtext`}
                >
                    Join the elite circle of artists pushing the boundaries of sonic innovation. <br />
                    Distribute, grow, and dominate with COREWAVE.
                </motion.p>

                <motion.div
                    className={styles.actions}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.6 }}
                >
                    <Magnetic>
                        {status === 'authenticated' ? (
                            <Link href="/explore" className="btn-primary">
                                Start Listening
                            </Link>
                        ) : (
                            <Link href="/signup?role=artist" className="btn-primary">
                                Join the Evolution
                            </Link>
                        )}
                    </Magnetic>
                    {!session && (
                        <Magnetic>
                            <Link href="/explore" className="btn-outline">
                                Start Listening
                            </Link>
                        </Magnetic>
                    )}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.8 }}
                    className={styles.stats}
                >
                    {[
                        { val: "500K+", label: "Artists" },
                        { val: "10M+", label: "Tracks" },
                        { val: "100+", label: "Countries" }
                    ].map((stat, i) => (
                        <div key={i} className={styles.statItem}>
                            <span>{stat.val}</span>
                            <p>{stat.label}</p>
                        </div>
                    ))}
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ duration: 1, delay: 1.5 }}
                className={styles.scrollIndicator}
            >
                <div className={styles.mouse}>
                    <div className={styles.wheel}></div>
                </div>
            </motion.div>
        </section>
    );
};

export default Hero;
