"use client";

import { useState } from 'react';
import Link from 'next/link';
import styles from '../explore/Explore.module.css';
import helpStyles from './Help.module.css';
import { Search, HelpCircle, MessageSquare, Book, FileText, ChevronRight, Mail, LifeBuoy } from 'lucide-react';

export default function HelpPage() {
    const [searchQuery, setSearchQuery] = useState('');

    const categories = [
        {
            title: 'Getting Started',
            icon: Book,
            items: [
                { label: 'Creating your account', slug: 'creating-account' },
                { label: 'Setting up your profile', slug: 'setting-profile' },
                { label: 'Artist verification', slug: 'artist-verification' }
            ]
        },
        {
            title: 'Music Distribution',
            icon: LifeBuoy,
            items: [
                { label: 'Upload requirements', slug: 'upload-requirements' },
                { label: 'Streaming platforms', slug: 'streaming-platforms' },
                { label: 'Pre-save campaigns', slug: 'pre-save-campaigns' }
            ]
        },
        {
            title: 'Royalties & Payments',
            icon: FileText,
            items: [
                { label: 'Payment schedules', slug: 'payment-schedules' },
                { label: 'Tax information', slug: 'tax-information' },
                { label: 'Splits and collaborations', slug: 'splits-collaborations' }
            ]
        },
        {
            title: 'Account Settings',
            icon: HelpCircle,
            items: [
                { label: 'Security & 2FA', slug: 'security-2fa' },
                { label: 'Deleting account', slug: 'deleting-account' },
                { label: 'Pro subscription', slug: 'pro-subscription' }
            ]
        },
    ];

    const filteredCategories = categories.map(cat => ({
        ...cat,
        items: cat.items.filter(item =>
            item.label.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })).filter(cat => cat.items.length > 0);

    return (
        <div className={styles.explorePage}>
            <div className={`container ${styles.container}`}>
                <header className={helpStyles.header}>
                    <h1 className="text-gradient">How can we help?</h1>
                    <div className={helpStyles.searchWrapper}>
                        <Search className={helpStyles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Search for articles, guides, or questions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            aria-label="Search help articles"
                        />
                    </div>
                </header>

                {filteredCategories.length > 0 ? (
                    <div className={helpStyles.catGrid}>
                        {filteredCategories.map((cat, i) => (
                            <div key={i} className={`${helpStyles.catCard} premium-card`}>
                                <div className={helpStyles.catHeader}>
                                    <cat.icon size={24} color="var(--corewave-blue)" />
                                    <h3>{cat.title}</h3>
                                </div>
                                <ul className={helpStyles.itemList}>
                                    {cat.items.map((item, j) => (
                                        <li key={j}>
                                            <Link href={`/help/${item.slug}`}>{item.label}</Link>
                                            <ChevronRight size={14} />
                                        </li>
                                    ))}
                                </ul>
                                <button className={helpStyles.viewAll}>View all articles</button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={styles.emptyState} style={{ padding: '8rem 0' }}>
                        <HelpCircle size={48} style={{ opacity: 0.3, marginBottom: '1.5rem' }} />
                        <h3>No results for "{searchQuery}"</h3>
                        <p>Try searching for core topics like "Account" or "Upload".</p>
                        <button className="btn-outline" onClick={() => setSearchQuery('')} style={{ marginTop: '2rem' }}>Clear Search</button>
                    </div>
                )}

                <section className={helpStyles.contactSection}>
                    <div className={`${helpStyles.contactCard} premium-card`}>
                        <div className={helpStyles.contactInfo}>
                            <MessageSquare size={32} color="var(--corewave-cyan)" />
                            <div>
                                <h3>Still have questions?</h3>
                                <p>Our support team is available 24/7 to help you evolve your career.</p>
                            </div>
                        </div>
                        <div className={helpStyles.contactActions}>
                            <a href="mailto:support@corewave.io" className="btn-primary"><Mail size={18} /> Contact Support</a>
                            <Link href="/community" className="btn-outline">Visit Community</Link>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
