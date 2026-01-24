"use client";

import Link from 'next/link';
import styles from './Footer.module.css';
import { Twitter, Instagram, Github, Youtube, Music2, Mail } from 'lucide-react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className={styles.footer}>
            <div className="container">
                <div className={styles.grid}>
                    <div className={styles.brandSide}>
                        <Link href="/" className={styles.logo}>
                            COREWAVE<span>RECORDS</span>
                        </Link>
                        <p className={`${styles.brandDesc} catchy-subtext`}>
                            Empowering the next generation of sound. Upload, distribute, and evolve your music career on the world's most artist-centric platform.
                        </p>
                        <div className={styles.socials}>
                            <a href="#" className={styles.socialIcon} aria-label="Twitter"><Twitter size={20} /></a>
                            <a href="#" className={styles.socialIcon} aria-label="Instagram"><Instagram size={20} /></a>
                            <a href="#" className={styles.socialIcon} aria-label="Github"><Github size={20} /></a>
                            <a href="#" className={styles.socialIcon} aria-label="Youtube"><Youtube size={20} /></a>
                        </div>
                    </div>

                    <div className={styles.column}>
                        <h4>Platform</h4>
                        <div className={styles.links}>
                            <Link href="/explore" className={styles.link}>Explore Music</Link>
                            <Link href="/artists" className={styles.link}>Artists</Link>
                            <Link href="/trending" className={styles.link}>Trending Now</Link>
                            <Link href="/new-releases" className={styles.link}>New Releases</Link>
                        </div>
                    </div>

                    <div className={styles.column}>
                        <h4>For Artists</h4>
                        <div className={styles.links}>
                            <Link href="/upload" className={styles.link}>Upload Track</Link>
                            <Link href="/distribution" className={styles.link}>Distribution</Link>
                            <Link href="/analytics" className={styles.link}>Artist Analytics</Link>
                            <Link href="/pro" className={styles.link}>CoreWave Pro</Link>
                        </div>
                    </div>

                    <div className={styles.column}>
                        <h4>Resources</h4>
                        <div className={styles.links}>
                            <Link href="/help" className={styles.link}>Help Center</Link>
                            <Link href="/community" className={styles.link}>Community</Link>
                            <Link href="/terms" className={styles.link}>Terms of Service</Link>
                            <Link href="/privacy" className={styles.link}>Privacy Policy</Link>
                        </div>
                    </div>
                </div>

                <div className={styles.bottom}>
                    <p>&copy; {currentYear} COREWAVE RECORDS. All rights reserved.</p>
                    <div className={styles.bottomLinks}>
                        <a href="mailto:hello@corewave.io" className={styles.link} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Mail size={16} /> Contact Support
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
