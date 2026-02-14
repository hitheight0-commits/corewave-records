"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './Auth.module.css';
import { useTranslation } from 'react-i18next';

export default function Signup() {
    const { t } = useTranslation();
    const [role, setRole] = useState<'ARTIST' | 'LISTENER'>('LISTENER');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    role,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Something went wrong');
            }

            router.push('/login');
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.authPage}>
            <div className={styles.authCard}>
                <h1 className={styles.title}>{t('auth.signup.title')}</h1>
                <p className={styles.subtitle}>{t('auth.signup.subtitle')}</p>

                <div className={styles.roleSelector}>
                    <button
                        className={role === 'LISTENER' ? styles.activeRole : ''}
                        onClick={() => setRole('LISTENER')}
                    >
                        {t('auth.signup.listener')}
                    </button>
                    <button
                        className={role === 'ARTIST' ? styles.activeRole : ''}
                        onClick={() => setRole('ARTIST')}
                    >
                        {t('auth.signup.artist')}
                    </button>
                </div>

                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.field}>
                        <label>{t('auth.signup.name')}</label>
                        <input
                            type="text"
                            placeholder={t('auth.signup.namePlaceholder')}
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div className={styles.field}>
                        <label>{t('auth.signup.email')}</label>
                        <input
                            type="email"
                            placeholder="email@example.com"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div className={styles.field}>
                        <label>{t('auth.signup.password')}</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? t('auth.signup.creating') : t('auth.signup.btn')}
                    </button>
                </form>

                <p className={styles.foot}>
                    {t('auth.signup.already')} <Link href="/login">{t('auth.signup.login')}</Link>
                </p>
            </div>
        </div>
    );
}
