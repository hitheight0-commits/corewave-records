"use client";

import styles from '../explore/Explore.module.css';
import legalStyles from './Legal.module.css';
import { Printer, ArrowUp, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPage() {
    const handlePrint = () => {
        window.print();
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className={styles.explorePage}>
            <div className={`container ${legalStyles.legalContainer}`}>
                <div className={legalStyles.topActions}>
                    <Link href="/" className={legalStyles.backLink}><ChevronLeft size={16} /> Back</Link>
                    <button onClick={handlePrint} className={legalStyles.actionBtn}><Printer size={18} /> Print PDF</button>
                </div>

                <header className={legalStyles.header}>
                    <h1 className="text-gradient">Privacy Policy</h1>
                    <p>Last Updated: January 23, 2026</p>
                </header>

                <div className={legalStyles.content}>
                    <section id="s1">
                        <h2>1. Data Collection</h2>
                        <p>We collect information you provide directly to us (name, email, artist profile info) and data automatically collected through your use of the Service (IP address, usage logs, streaming data).</p>
                    </section>

                    <section id="s2">
                        <h2>2. How We Use Your Data</h2>
                        <p>Your information is used to provide the Service, process payments, analyze performance trends, and communicate with you about your account and updates to the platform.</p>
                    </section>

                    <section id="s3">
                        <h2>3. Sharing of Information</h2>
                        <p>We share your music and metadata with streaming platforms (Spotify, Apple Music, etc.) to facilitate distribution. We do not sell your personal information to third-party advertisers.</p>
                    </section>

                    <section id="s4">
                        <h2>4. Data Security</h2>
                        <p>We implement industry-standard security measures to protect your data from unauthorized access, alteration, or destruction. However, no method of transmission over the internet is 100% secure.</p>
                    </section>

                    <section id="s5">
                        <h2>5. Your Choices</h2>
                        <p>You may update your profile information or delete your account at any time through your dashboard settings. You can also opt-out of promotional communications.</p>
                    </section>
                </div>

                <button onClick={scrollToTop} className={legalStyles.fab} aria-label="Scroll to top">
                    <ArrowUp size={24} />
                </button>
            </div>
        </div>
    );
}
