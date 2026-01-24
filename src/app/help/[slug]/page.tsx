"use client";

import { use } from 'react';
import Link from 'next/link';
import styles from '../../explore/Explore.module.css';
import helpStyles from '../Help.module.css';
import { helpArticles } from '../articles';
import { ChevronLeft, BookOpen, Clock, Share2 } from 'lucide-react';
import { notFound } from 'next/navigation';

export default function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const article = (helpArticles as any)[slug];

    if (!article) {
        notFound();
    }

    return (
        <div className={styles.explorePage}>
            <div className="container" style={{ maxWidth: '800px' }}>
                <Link href="/help" className={helpStyles.backBtn}>
                    <ChevronLeft size={16} /> Back to Help Center
                </Link>

                <article className={helpStyles.articleContent}>
                    <header className={helpStyles.articleHeader}>
                        <div className={helpStyles.articleMeta}>
                            <span className={helpStyles.tag}><BookOpen size={14} /> Guide</span>
                            <span className={helpStyles.readTime}><Clock size={14} /> 2 min read</span>
                        </div>
                        <h1 className="text-gradient">{article.title}</h1>
                    </header>

                    <div className={helpStyles.articleBody}>
                        <p>{article.content}</p>
                        <p style={{ marginTop: '2rem' }}>
                            Still need help? Our community and support teams are always here for you.
                            Check out the <Link href="/community" style={{ color: 'var(--corewave-blue)' }}>Community Hub</Link> or
                            <a href="mailto:support@corewave.io" style={{ color: 'var(--corewave-blue)' }}> contact support</a> directly.
                        </p>
                    </div>

                    <footer className={helpStyles.articleFooter}>
                        <button className={helpStyles.shareBtn}><Share2 size={16} /> Share Article</button>
                        <div className={helpStyles.feedback}>
                            <span>Was this helpful?</span>
                            <button className="btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>Yes</button>
                            <button className="btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>No</button>
                        </div>
                    </footer>
                </article>
            </div>
        </div>
    );
}
