"use client";

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styles from './Settings.module.css';
import {
    Camera, Loader2, Check, Shield, Bell, User,
    Mail, Sparkles, Globe, Lock, Eye, EyeOff,
    Smartphone, CreditCard, LogOut, ChevronRight, AlertTriangle, Trash2
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useToastStore } from '@/store/useToastStore';
import { useTranslation } from 'react-i18next';
import i18n from '@/lib/i18n';
import Cookie from 'js-cookie';


type Tab = 'account' | 'security' | 'notifications' | 'language' | 'subscription';

export default function SettingsPage() {
    const { t } = useTranslation();
    const { data: session, status, update } = useSession();
    const router = useRouter();
    const { addToast } = useToastStore();


    const [activeTab, setActiveTab] = useState<Tab>('account');
    const [uploading, setUploading] = useState(false);
    const [updatingInfo, setUpdatingInfo] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    // Form States
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        bio: ''
    });

    const [toggles, setToggles] = useState({
        publicProfile: true,
        activityStatus: true,
        emailNotifications: true,
        pushNotifications: false,
        marketingEmails: true,
        twoFactor: false
    });

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
        if (session) {
            setPreviewUrl(session.user.image || null);
            setFormData({
                name: session.user.name || '',
                email: session.user.email || '',
                bio: (session.user as any).bio || ''
            });
        }
    }, [session, status, router]);

    const handleUpdateInfo = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdatingInfo(true);
        try {
            const res = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                await update({ name: formData.name, bio: formData.bio }); // [FIX] Update session with new bio
                addToast(t('settings.toasts.syncSuccess'));
            } else {
                addToast(t('settings.toasts.syncError'), "error");
            }
        } catch (err) {
            addToast(t('settings.toasts.orchestrationError'), "error");
        } finally {
            setUpdatingInfo(false);
        }
    };

    const toggleFeature = (key: keyof typeof toggles) => {
        setToggles(prev => ({ ...prev, [key]: !prev[key] }));
        addToast(t('settings.toasts.featureUpdated', { name: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()) }));
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setPreviewUrl(reader.result as string);
            reader.readAsDataURL(file);
            uploadImage(file);
        }
    };

    const uploadImage = async (file: File) => {
        setUploading(true);
        const data = new FormData();
        data.append('image', file);

        try {
            const res = await fetch('/api/user/image', {
                method: 'POST',
                body: data,
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error);
            await update({ image: result.imageUrl });
            addToast(t('settings.toasts.visualIdentity'));
        } catch (err: any) {
            addToast(err.message, "error");
            setPreviewUrl(session?.user?.image || null);
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm(t('settings.prompts.deleteWarning'))) {
            return;
        }

        const confirmText = window.prompt(t('settings.prompts.deleteConfirm'));
        if (confirmText !== 'DELETE') {
            addToast(t('settings.prompts.deleteAborted'), "info");
            return;
        }

        try {
            const res = await fetch('/api/user/delete', { method: 'DELETE' });
            if (res.ok) {
                addToast(t('settings.toasts.purgeSuccess'));
                setTimeout(() => {
                    signOut({ callbackUrl: '/' });
                }, 2000);
            } else {
                addToast(t('settings.toasts.purgeError'), "error");
            }
        } catch (err) {
            addToast(t('settings.toasts.purgeErrorGeneric'), "error");
        }
    };

    if (status === 'loading') return null;
    if (!session) return null;

    const renderAccount = () => (
        <div className={styles.tabContent}>
            <section className={`${styles.section} premium-card`}>
                <div className={styles.sectionHeader}>
                    <h2>{t('settings.account.identity')}</h2>
                    <p>{t('settings.account.identityDesc')}</p>
                </div>

                <div className={styles.form}>
                    <div className={styles.field}>
                        <label>{t('settings.account.displayName')}</label>
                        <div className={styles.inputWrapper}>
                            <User size={18} className={styles.inputIcon} />
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="James Evolution"
                            />
                        </div>
                    </div>

                    <div className={styles.field}>
                        <label>{t('settings.account.email')}</label>
                        <div className={styles.inputWrapper}>
                            <Mail size={18} className={styles.inputIcon} />
                            <input
                                type="email"
                                value={formData.email}
                                readOnly
                                className={styles.readOnly}
                            />
                        </div>
                    </div>

                    <div className={styles.field}>
                        <label>{t('settings.account.bio')}</label>
                        <textarea
                            rows={4}
                            value={formData.bio}
                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            placeholder={t('settings.account.bioPlaceholder')}
                        />
                    </div>

                    <div className={styles.formActions}>
                        <button
                            type="button"
                            className="btn-primary"
                            disabled={updatingInfo}
                            onClick={handleUpdateInfo}
                        >
                            {updatingInfo ? <><Loader2 className="spinner" size={18} /> {t('settings.account.syncing')}</> : t('settings.account.save')}
                        </button>
                    </div>
                </div>
            </section>

            <section className={`${styles.section} premium-card`}>
                <div className={styles.sectionHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <h2>{t('settings.account.privacy')}</h2>
                        <span className={styles.betaTag}>LIVE</span>
                    </div>
                    <p>{t('settings.account.privacyDesc')}</p>
                </div>
                <div className={styles.toggleRow} onClick={() => toggleFeature('activityStatus')}>
                    <div>
                        <h4>{t('settings.account.activityStatus')}</h4>
                        <p>{t('settings.account.activityStatusDesc')}</p>
                    </div>
                    <div className={toggles.activityStatus ? styles.switchActive : styles.switch}></div>
                </div>
            </section>

            <section className={`${styles.section} premium-card ${styles.dangerZone}`}>
                <div className={styles.sectionHeader}>
                    <h2>{t('settings.account.dangerZone')}</h2>
                    <p>{t('settings.account.dangerZoneDesc')}</p>
                </div>
                <div className={styles.dangerAction}>
                    <div>
                        <h4>{t('settings.account.deleteAccount')}</h4>
                        <p>{t('settings.account.deleteAccountDesc')}</p>
                    </div>
                    <button className={styles.deleteBtn} onClick={handleDeleteAccount}>
                        <Trash2 size={18} /> {t('settings.account.deleteBtn')}
                    </button>
                </div>
            </section>
        </div >
    );

    const renderSecurity = () => (
        <div className={styles.tabContent}>
            <section className={`${styles.section} premium-card`}>
                <div className={styles.sectionHeader}>
                    <h2>{t('settings.security.auth')}</h2>
                    <p>{t('settings.security.authDesc')}</p>
                </div>

                <div className={styles.form}>
                    <div className={styles.field}>
                        <label>{t('settings.security.currentPassword')}</label>
                        <div className={styles.inputWrapper}>
                            <Lock size={18} className={styles.inputIcon} />
                            <input type={showPassword ? "text" : "password"} placeholder="••••••••" />
                            <button className={styles.inputAction} onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                    <div className={styles.field}>
                        <label>{t('settings.security.newPassword')}</label>
                        <div className={styles.inputWrapper}>
                            <Lock size={18} className={styles.inputIcon} />
                            <input type={showPassword ? "text" : "password"} placeholder={t('settings.security.newPasswordPlaceholder')} />
                        </div>
                    </div>
                    <button className="btn-outline" onClick={() => addToast(t('settings.toasts.securityInitiated'))}>{t('settings.security.updatePassword')}</button>
                </div>
            </section>

            <section className={`${styles.section} premium-card`}>
                <div className={styles.sectionHeader}>
                    <h2>{t('settings.security.accSecurity')}</h2>
                </div>
                <div className={styles.toggleRow} onClick={() => toggleFeature('twoFactor')}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <Smartphone color="var(--corewave-cyan)" />
                        <div>
                            <h4>{t('settings.security.twoFactor')}</h4>
                            <p>{t('settings.security.twoFactorDesc')}</p>
                        </div>
                    </div>
                    <div className={toggles.twoFactor ? styles.switchActive : styles.switch}></div>
                </div>
            </section>
        </div>
    );

    const renderNotifications = () => (
        <div className={styles.tabContent}>
            <section className={`${styles.section} premium-card`}>
                <div className={styles.sectionHeader}>
                    <h2>{t('settings.notifications.delivery')}</h2>
                    <p>{t('settings.notifications.deliveryDesc')}</p>
                </div>
                <div className={styles.toggleRow} onClick={() => toggleFeature('emailNotifications')}>
                    <div>
                        <h4>{t('settings.notifications.emailUpdates')}</h4>
                        <p>{t('settings.notifications.emailUpdatesDesc')}</p>
                    </div>
                    <div className={toggles.emailNotifications ? styles.switchActive : styles.switch}></div>
                </div>
                <div className={styles.toggleRow} onClick={() => toggleFeature('pushNotifications')}>
                    <div>
                        <h4>{t('settings.notifications.pushNotifications')}</h4>
                        <p>{t('settings.notifications.pushNotificationsDesc')}</p>
                    </div>
                    <div className={toggles.pushNotifications ? styles.switchActive : styles.switch}></div>
                </div>
            </section>
        </div>
    );

    return (
        <div className={styles.settingsPage}>
            <div className={`container ${styles.container}`}>
                <header className={styles.header}>
                    <div className={styles.heroTag}>
                        <Sparkles size={12} fill="var(--corewave-cyan)" color="var(--corewave-cyan)" />
                        <span>{t('settings.sidebar.syncStatus')} • 2026</span>
                    </div>
                    <h1 className="text-gradient">{t('settings.title')}</h1>
                    <p>{t('settings.subtitle')}</p>
                </header>

                <div className={styles.layout}>
                    <aside className={styles.sidebar}>
                        <div className={styles.profileSummary}>
                            <div className={styles.avatarPreview}>
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Profile" className={styles.avatarImage} />
                                ) : (
                                    <div className={styles.avatarPlaceholder}>
                                        {session.user.name?.[0] || 'U'}
                                    </div>
                                )}
                                <button className={styles.uploadButton} onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                                    {uploading ? <Loader2 className="spinner" size={16} /> : <Camera size={16} />}
                                </button>
                                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className={styles.hiddenInput} />
                            </div>
                            <h3>{session.user.name}</h3>
                            <span className={styles.userRole}>{session.user.role}</span>
                        </div>

                        <div className={`${styles.statsNode} premium-card`} style={{ padding: '1.25rem', marginTop: '1.5rem', opacity: 0.8 }}>
                            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--muted-foreground)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{t('settings.sidebar.syncStatus')}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--corewave-cyan)', fontSize: '0.85rem', fontWeight: 700 }}>
                                <div className={styles.pulse}></div> {t('settings.sidebar.orchestrated')}
                            </div>
                        </div>

                        <nav className={styles.sideNav}>
                            <button className={activeTab === 'account' ? styles.sideLinkActive : styles.sideLink} onClick={() => setActiveTab('account')}><User size={18} /> {t('settings.tabs.account')}</button>
                            <button className={activeTab === 'security' ? styles.sideLinkActive : styles.sideLink} onClick={() => setActiveTab('security')}><Shield size={18} /> {t('settings.tabs.security')}</button>
                            <button className={activeTab === 'notifications' ? styles.sideLinkActive : styles.sideLink} onClick={() => setActiveTab('notifications')}><Bell size={18} /> {t('settings.tabs.notifications')}</button>
                            <button className={activeTab === 'subscription' ? styles.sideLinkActive : styles.sideLink} onClick={() => setActiveTab('subscription')}><CreditCard size={18} /> {t('settings.tabs.subscription')}</button>
                            <button className={activeTab === 'language' ? styles.sideLinkActive : styles.sideLink} onClick={() => setActiveTab('language')}><Globe size={18} /> {t('settings.tabs.language')}</button>
                        </nav>

                        <div className={styles.sidebarFooter}>
                            <button className={styles.logoutBtn} onClick={() => router.push('/api/auth/signout')}>
                                <LogOut size={18} /> {t('settings.sidebar.signOut')}
                            </button>
                        </div>
                    </aside>

                    <main className={styles.mainContent}>
                        {activeTab === 'account' && renderAccount()}
                        {activeTab === 'security' && renderSecurity()}
                        {activeTab === 'notifications' && renderNotifications()}
                        {activeTab === 'subscription' && (
                            <div className={`${styles.section} premium-card`}>
                                <div className={styles.sectionHeader}>
                                    <h2>{t('settings.subscription.membership')}</h2>
                                    <p dangerouslySetInnerHTML={{ __html: t('settings.subscription.basicNode') }} />
                                </div>
                                <button className="btn-primary" onClick={() => router.push('/pro')}>{t('settings.subscription.upgrade')}</button>
                            </div>
                        )}
                        {activeTab === 'language' && (
                            <div className={`${styles.section} premium-card`}>
                                <div className={styles.sectionHeader}>
                                    <h2>{t('settings.language.select')}</h2>
                                </div>
                                <select
                                    className={styles.premiumSelect}
                                    value={i18n.language}
                                    onChange={(e) => {
                                        const newLang = e.target.value;
                                        i18n.changeLanguage(newLang);
                                        Cookie.set('NEXT_LOCALE', newLang, { expires: 365 });
                                        addToast(t('common.save') + ` - ${newLang.toUpperCase()}`);
                                        // Refresh to apply lang to html tag from server side if needed, 
                                        // but I18nProvider handles client side.
                                    }}
                                >
                                    <option value="en">{t('settings.language.en')}</option>
                                    <option value="fr">{t('settings.language.fr')}</option>
                                    <option value="de">{t('settings.language.de')}</option>
                                    <option value="es">{t('settings.language.es')}</option>
                                </select>
                            </div>
                        )}
                    </main>
                </div>
            </div >
        </div >
    );
}
