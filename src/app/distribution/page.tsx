"use client";

import Link from 'next/link';
import styles from '../explore/Explore.module.css';
import distStyles from './Distribution.module.css';
import { Globe, ShieldCheck, Zap, BarChart3, Upload, Share2, Headphones } from 'lucide-react';

export default function DistributionPage() {
    return (
        <div className={styles.explorePage}>
            <div className={`container ${styles.container}`}>
                <header className={styles.header} style={{ textAlign: 'center' }}>
                    <h1 className="text-gradient">Global Distribution</h1>
                    <p style={{ maxWidth: '700px', margin: '1rem auto' }}>
                        Take your music from the studio to every major streaming platform.
                        We handle the technicalities, you focus on the sound.
                    </p>
                    <Link href="/upload" className="btn-primary" style={{ marginTop: '2rem', display: 'inline-flex' }}>
                        Get Started for Free
                    </Link>
                </header>

                <section className={distStyles.processSection}>
                    <div className={distStyles.grid}>
                        <div className={`${distStyles.stepCard} premium-card`}>
                            <div className={distStyles.stepNumber}>01</div>
                            <Upload className={distStyles.stepIcon} size={32} />
                            <h3>Upload Your Track</h3>
                            <p>Upload your high-quality WAV or FLAC files with custom metadata and HD cover art.</p>
                        </div>
                        <div className={`${distStyles.stepCard} premium-card`}>
                            <div className={distStyles.stepNumber}>02</div>
                            <ShieldCheck className={distStyles.stepIcon} size={32} />
                            <h3>Quality Control</h3>
                            <p>Our expert team reviews every track to ensure it meets global streaming standards.</p>
                        </div>
                        <div className={`${distStyles.stepCard} premium-card`}>
                            <div className={distStyles.stepNumber}>03</div>
                            <Share2 className={distStyles.stepIcon} size={32} />
                            <h3>Global Reach</h3>
                            <p>We deliver your music to Spotify, Apple Music, TikTok, and 150+ other digital stores.</p>
                        </div>
                    </div>
                </section>

                <section className={distStyles.featuresSection}>
                    <h2 className="text-gradient" style={{ textAlign: 'center', marginBottom: '4rem', fontSize: '2.5rem' }}>Why CoreWave Distribution?</h2>
                    <div className={distStyles.featureGrid}>
                        <div className={distStyles.featureItem}>
                            <Zap color="var(--corewave-cyan)" />
                            <div>
                                <h4>Instant Delivery</h4>
                                <p>Get your music live in as little as 48 hours with our Express Pipe technology.</p>
                            </div>
                        </div>
                        <div className={distStyles.featureItem}>
                            <Globe color="var(--corewave-blue)" />
                            <div>
                                <h4>Worldwide Royalties</h4>
                                <p>Collect 100% of your royalties from every corner of the globe without hidden fees.</p>
                            </div>
                        </div>
                        <div className={distStyles.featureItem}>
                            <BarChart3 color="var(--corewave-purple)" />
                            <div>
                                <h4>Deep Analytics</h4>
                                <p>Understand your audience with real-time data on plays, saves, and demographics.</p>
                            </div>
                        </div>
                        <div className={distStyles.featureItem}>
                            <Headphones color="var(--corewave-pink)" />
                            <div>
                                <h4>Smart Links</h4>
                                <p>Automatically generated landing pages for your fans to choose their preferred platform.</p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
