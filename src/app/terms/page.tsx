"use client";

import styles from '../explore/Explore.module.css';
import legalStyles from './Legal.module.css';
import { Printer, ArrowUp, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function TermsPage() {
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
                    <h1 className="text-gradient">Terms of Service</h1>
                    <p>Last Updated: January 23, 2026</p>
                </header>

                <div className={legalStyles.content}>
                    <section id="s1">
                        <h2>1. Acceptance of Terms</h2>
                        <p>By accessing or using the CoreWave Records platform ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to all of these terms, do not use the Service.</p>
                    </section>

                    <section id="s2">
                        <h2>2. Artist Rights & Ownership</h2>
                        <p>CoreWave Records does not claim ownership of your music. You retain all intellectual property rights to the content you upload. By uploading content, you grant CoreWave a non-exclusive, worldwide license to distribute, perform, and display your music on partnered platforms.</p>
                    </section>

                    <section id="s3">
                        <h2>3. User Conduct</h2>
                        <p>Users are prohibited from uploading content that infringes on third-party intellectual property, contains hate speech, or violates any applicable laws. CoreWave reserves the right to remove any content at its sole discretion.</p>
                    </section>

                    <section id="s4">
                        <h2>4. Royalties & Payments</h2>
                        <p>Royalties are calculated based on data from streaming platforms. CoreWave subtracts a standard processing fee (dependent on your plan) and distributes the remaining funds to your linked account according to our payment schedule.</p>
                    </section>

                    <section id="s5">
                        <h2>5. Limitation of Liability</h2>
                        <p>CoreWave Records is provided "as is" without any warranties. We are not liable for any indirect, incidental, or consequential damages arising from your use of the Service.</p>
                    </section>
                </div>

                <button onClick={scrollToTop} className={legalStyles.fab} aria-label="Scroll to top">
                    <ArrowUp size={24} />
                </button>
            </div>
        </div>
    );
}
