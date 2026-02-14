"use client";

import Link from 'next/link';
import styles from './Footer.module.css';
import { Twitter, Instagram, Github, Youtube, Music2, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Footer = () => {
    const { t } = useTranslation();
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
                            {t('footer.brandDesc')}
                        </p>
                        <div className={styles.socials}>
                            <a href="#" className={styles.socialIcon} aria-label="Twitter"><Twitter size={20} /></a>
                            <a href="#" className={styles.socialIcon} aria-label="Instagram"><Instagram size={20} /></a>
                            <a href="#" className={styles.socialIcon} aria-label="Github"><Github size={20} /></a>
                            <a href="#" className={styles.socialIcon} aria-label="Youtube"><Youtube size={20} /></a>
                        </div>
                    </div>

                    <div className={styles.column}>
                        <h4>{t('footer.platform')}</h4>
                        <div className={styles.links}>
                            <Link href="/explore" className={styles.link}>{t('nav.explore')}</Link>
                            <Link href="/artists" className={styles.link}>{t('nav.artists')}</Link>
                            <Link href="/trending" className={styles.link}>{t('nav.trending')}</Link>
                            <Link href="/new-releases" className={styles.link}>{t('nav.newReleases')}</Link>
                        </div>
                    </div>

                    <div className={styles.column}>
                        <h4>{t('footer.forArtists')}</h4>
                        <div className={styles.links}>
                            <Link href="/upload" className={styles.link}>{t('nav.upload')}</Link>
                            <Link href="/distribution" className={styles.link}>{t('nav.distribution')}</Link>
                            <Link href="/analytics" className={styles.link}>{t('nav.analytics')}</Link>
                            <Link href="/pro" className={styles.link}>{t('nav.corewavePro')}</Link>
                        </div>
                    </div>

                    <div className={styles.column}>
                        <h4>{t('footer.resources')}</h4>
                        <div className={styles.links}>
                            <Link href="/help" className={styles.link}>{t('nav.helpCenter')}</Link>
                            <Link href="/community" className={styles.link}>{t('nav.community')}</Link>
                            <Link href="/terms" className={styles.link}>{t('nav.terms')}</Link>
                            <Link href="/privacy" className={styles.link}>{t('nav.privacy')}</Link>
                        </div>
                    </div>
                </div>

                <div className={styles.bottom}>
                    <p>&copy; {currentYear} COREWAVE RECORDS. {t('common.allRightsReserved')}</p>
                    <div className={styles.bottomLinks}>
                        <a href="mailto:hello@corewave.io" className={styles.link} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Mail size={16} /> {t('footer.contactSupport')}
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
