"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './Header.module.css';
import { Search, User, Menu, X, LogOut, Settings, HelpCircle, FileText } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { usePlayerStore } from '@/store/usePlayerStore';
import Magnetic from '../common/Magnetic';
import ThemeToggle from '../common/ThemeToggle';
import LanguageSwitcher from '../common/LanguageSwitcher';
import { useTranslation } from 'react-i18next';

export default function Header() {
    const { t } = useTranslation();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const { data: session } = useSession();
    const { setTrack } = usePlayerStore();
    const router = useRouter();

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const fetchResults = async () => {
            if (searchQuery.length < 2) {
                setSearchResults([]);
                return;
            }
            setIsSearching(true);
            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
                const data = await res.json();

                const combined = [
                    ...(data.artists || []).map((a: any) => ({ ...a, type: 'artist' })),
                    ...(data.tracks || []).map((t: any) => ({ ...t, type: 'track' })),
                    ...(data.articles || []).map((art: any) => ({ ...art, type: 'article' }))
                ];
                setSearchResults(combined);
            } catch (err) {
                console.error(err);
            } finally {
                setIsSearching(false);
            }
        };

        const timer = setTimeout(fetchResults, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleResultClick = (item: any) => {
        if (item.type === 'artist') {
            router.push(`/artists/${item.id}`);
        } else if (item.type === 'track') {
            setTrack(item);
        } else if (item.type === 'article') {
            router.push(`/help/${item.id}`);
        }
        setSearchQuery('');
        setSearchResults([]);
    };

    return (
        <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
            <div className={`container ${styles.container}`}>
                <div className={styles.left}>
                    <Link href="/" className={styles.logo}>
                        COREWAVE<span>RECORDS</span>
                    </Link>
                </div>

                <nav className={`${styles.nav} ${isMobileMenuOpen ? styles.mobileOpen : ''}`}>
                    <Magnetic><Link href="/" className={styles.navLink}>{t('nav.home')}</Link></Magnetic>
                    <Magnetic><Link href="/explore" className={styles.navLink}>{t('nav.explore')}</Link></Magnetic>
                    <Magnetic><Link href="/artists" className={styles.navLink}>{t('nav.artists')}</Link></Magnetic>
                    {session?.user?.role === 'ARTIST' && (
                        <>
                            <Magnetic><Link href="/analytics" className={styles.navLink}>{t('nav.analytics') || 'Analytics'}</Link></Magnetic>
                            <Magnetic><Link href="/upload" className={`${styles.navLink} ${styles.uploadBtn}`}>{t('nav.upload')}</Link></Magnetic>
                        </>
                    )}
                </nav>

                <div className={styles.right}>
                    <div className={styles.searchContainer}>
                        <div className={styles.searchBar}>
                            <Search size={18} />
                            <input
                                type="text"
                                placeholder={t('nav.search')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        {searchResults.length > 0 && (
                            <div className={styles.searchResults}>
                                {searchResults.map((item: any) => (
                                    <button
                                        key={`${item.type}-${item.id}`}
                                        className={styles.resultItem}
                                        onClick={() => handleResultClick(item)}
                                    >
                                        <div className={styles.resultImageWrapper}>
                                            {item.type === 'article' ? (
                                                <div className={styles.articleIcon}><FileText size={20} /></div>
                                            ) : (
                                                <img src={item.coverUrl || item.image || '/default-avatar.png'} alt={item.title || item.name} />
                                            )}
                                            {item.type === 'artist' && <div className={styles.artistBadge}>{t('search.badges.artist')}</div>}
                                            {item.type === 'article' && <div className={styles.helpBadge}>{t('search.badges.help')}</div>}
                                        </div>
                                        <div className={styles.resultMeta}>
                                            <span className={styles.resultTitle}>{item.title || item.name}</span>
                                            <span className={styles.resultArtist}>
                                                {item.type === 'artist' ? t('search.badges.verifiedArtist') :
                                                    item.type === 'article' ? t('search.badges.platformGuide') :
                                                        item.artist}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <ThemeToggle />
                    <LanguageSwitcher />

                    <div className={styles.authActions}>
                        {session ? (
                            <div className={styles.userMenu}>
                                <Link href="/profile" className={styles.userAvatar}>
                                    {session.user.image ? (
                                        <img src={session.user.image} alt={session.user.name || 'User'} />
                                    ) : (
                                        <span>{session.user.name?.[0] || 'U'}</span>
                                    )}
                                </Link>
                                {session.user.role === 'ARTIST' && (
                                    <Link href="/analytics" className={styles.settingsLink} title={t('user.analytics') || 'Analytics'}>
                                        <HelpCircle size={18} />
                                    </Link>
                                )}
                                <Link href="/settings" className={styles.settingsLink} title={t('user.settings')}>
                                    <Settings size={18} />
                                </Link>
                                <button
                                    onClick={() => signOut()}
                                    className={styles.logoutBtn}
                                    title={t('user.logout')}
                                >
                                    <LogOut size={18} />
                                </button>
                            </div>
                        ) : (
                            <>
                                <Link href="/login" className={styles.loginBtn}>{t('user.login')}</Link>
                                <Link href="/signup" className="btn-primary">{t('user.signup')}</Link>
                            </>
                        )}
                    </div>

                    <button
                        className={styles.mobileToggle}
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </div>
        </header>
    );
}
