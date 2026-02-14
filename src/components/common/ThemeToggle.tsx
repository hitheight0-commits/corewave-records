"use client";

import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '@/store/useThemeStore';
import styles from './ThemeToggle.module.css';

export default function ThemeToggle() {
    const { theme, toggleTheme } = useThemeStore();

    return (
        <button
            onClick={toggleTheme}
            className={styles.themeToggle}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
            <div className={styles.iconWrapper}>
                {theme === 'dark' ? (
                    <Sun size={18} className={styles.icon} />
                ) : (
                    <Moon size={18} className={styles.icon} />
                )}
            </div>
        </button>
    );
}
