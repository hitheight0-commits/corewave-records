"use client";

import styles from './Success.module.css';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function UploadSuccessPage() {
    const router = useRouter();

    return (
        <div className={styles.successPage}>
            <div className={`container ${styles.container}`}>
                <div className={styles.card}>
                    <div className={styles.iconWrapper}>
                        <CheckCircle size={80} color="var(--corewave-blue)" />
                    </div>
                    <h1>Submission Received!</h1>
                    <p className={styles.subtitle}>Your track is now <strong>Under Review</strong>.</p>

                    <div className={styles.infoBox}>
                        <h3>What happens next?</h3>
                        <ul>
                            <li>Our admin team will review your submission for quality and compliance.</li>
                            <li>You will be notified via email once the review is complete.</li>
                            <li>If approved, your track will immediately go live on the Explore page.</li>
                        </ul>
                    </div>

                    <div className={styles.actions}>
                        <button
                            className="btn-primary"
                            onClick={() => router.push('/profile')}
                        >
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                Go to Dashboard <ArrowRight size={18} />
                            </span>
                        </button>
                        <button
                            className="btn-outline"
                            onClick={() => router.push('/upload')}
                        >
                            Upload Another Track
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
