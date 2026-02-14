"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown, Check } from 'lucide-react';
import styles from './LanguageSwitcher.module.css';
import Cookies from 'js-cookie';

const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
];

export default function LanguageSwitcher() {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const currentLanguage = languages.find(l => l.code === i18n.language) || languages[0];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
        Cookies.set('NEXT_LOCALE', lng, { expires: 365 });
        setIsOpen(false);
    };

    return (
        <div className={styles.container} ref={dropdownRef}>
            <button
                className={styles.trigger}
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
            >
                <Globe size={18} />
                <span className={styles.currentLang}>{currentLanguage.code.toUpperCase()}</span>
                <ChevronDown size={14} className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`} />
            </button>

            {isOpen && (
                <div className={styles.dropdown}>
                    {languages.map((lng) => (
                        <button
                            key={lng.code}
                            className={`${styles.option} ${i18n.language === lng.code ? styles.optionActive : ''}`}
                            onClick={() => changeLanguage(lng.code)}
                        >
                            <span className={styles.flag}>{lng.flag}</span>
                            <span className={styles.name}>{lng.name}</span>
                            {i18n.language === lng.code && <Check size={14} className={styles.check} />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
