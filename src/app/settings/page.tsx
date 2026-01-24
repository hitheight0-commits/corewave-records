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
import { useLanguageStore } from '@/store/useLanguageStore';


type Tab = 'account' | 'security' | 'notifications' | 'language' | 'subscription';

export default function SettingsPage() {
    const { data: session, status, update } = useSession();
    const router = useRouter();
    const { addToast } = useToastStore();
    const { language, setLanguage, t } = useLanguageStore();


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
                addToast("Identity synchronized with global servers.");
            } else {
                addToast("Synchronization failure.", "error");
            }
        } catch (err) {
            addToast("Orchestration error occurred.", "error");
        } finally {
            setUpdatingInfo(false);
        }
    };

    const toggleFeature = (key: keyof typeof toggles) => {
        setToggles(prev => ({ ...prev, [key]: !prev[key] }));
        addToast(`${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} updated live.`);
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
            addToast("Visual identity updated successfully.");
        } catch (err: any) {
            addToast(err.message, "error");
            setPreviewUrl(session?.user?.image || null);
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm("CRITICAL WARNING: This action is permanent and will delete all your music, playlists, and profile data. Proceed with extreme caution. Type 'DELETE' in the confirm-box to proceed?")) {
            return;
        }

        const confirmText = window.prompt("Type 'DELETE' to confirm account destruction:");
        if (confirmText !== 'DELETE') {
            addToast("Deletion aborted. Your data is safe.", "info");
            return;
        }

        try {
            const res = await fetch('/api/user/delete', { method: 'DELETE' });
            if (res.ok) {
                addToast("Identity purged from network. Redirecting...");
                setTimeout(() => {
                    signOut({ callbackUrl: '/' });
                }, 2000);
            } else {
                addToast("Failure to purge identity.", "error");
            }
        } catch (err) {
            addToast("An error occurred during deletion.", "error");
        }
    };

    if (status === 'loading') return null;
    if (!session) return null;

    const renderAccount = () => (
        <div className={styles.tabContent}>
            <section className={`${styles.section} premium-card`}>
                <div className={styles.sectionHeader}>
                    <h2>Identity Information</h2>
                    <p>Manage how you appear across the CoreWave ecosystem.</p>
                </div>

                <div className={styles.form}>
                    <div className={styles.field}>
                        <label>Display Name</label>
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
                        <label>Email Address</label>
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
                        <label>Professional Bio</label>
                        <textarea
                            rows={4}
                            value={formData.bio}
                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            placeholder="Artist bio..."
                        />
                    </div>

                    <div className={styles.formActions}>
                        <button
                            type="button"
                            className="btn-primary"
                            disabled={updatingInfo}
                            onClick={handleUpdateInfo}
                        >
                            {updatingInfo ? <><Loader2 className="spinner" size={18} /> Syncing...</> : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </section>

            <section className={`${styles.section} premium-card`}>
                <div className={styles.sectionHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <h2>Privacy & Discovery</h2>
                        <span className={styles.betaTag}>LIVE</span>
                    </div>
                    <p>Control your visibility state and discovery algorithms.</p>
                </div>
                <div className={styles.toggleRow} onClick={() => toggleFeature('activityStatus')}>
                    <div>
                        <h4>Activity Status</h4>
                        <p>Broadcast your real-time listening sessions.</p>
                    </div>
                    <div className={toggles.activityStatus ? styles.switchActive : styles.switch}></div>
                </div>
            </section>

            <section className={`${styles.section} ${styles.dangerZone} premium-card`}>
                <div className={styles.sectionHeader}>
                    <h2>Danger Zone</h2>
                    <p>Permanent actions that cannot be undone.</p>
                </div>
                <div className={styles.dangerAction}>
                    <div>
                        <h4>Delete Account</h4>
                        <p>Permanently remove your profile and all associated data from CoreWave.</p>
                    </div>
                    <button className={styles.deleteBtn} onClick={handleDeleteAccount}>
                        <Trash2 size={18} /> Delete My Identity
                    </button>
                </div>
            </section>
        </div >
    );

    const renderSecurity = () => (
        <div className={styles.tabContent}>
            <section className={`${styles.section} premium-card`}>
                <div className={styles.sectionHeader}>
                    <h2>Authentication</h2>
                    <p>Secure your node in the network with high-entropy credentials.</p>
                </div>

                <div className={styles.form}>
                    <div className={styles.field}>
                        <label>Current Password</label>
                        <div className={styles.inputWrapper}>
                            <Lock size={18} className={styles.inputIcon} />
                            <input type={showPassword ? "text" : "password"} placeholder="••••••••" />
                            <button className={styles.inputAction} onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                    <div className={styles.field}>
                        <label>New Password</label>
                        <div className={styles.inputWrapper}>
                            <Lock size={18} className={styles.inputIcon} />
                            <input type={showPassword ? "text" : "password"} placeholder="Minimum 12 characters" />
                        </div>
                    </div>
                    <button className="btn-outline" onClick={() => addToast("Security protocol initiated.")}>Update Password</button>
                </div>
            </section>

            <section className={`${styles.section} premium-card`}>
                <div className={styles.sectionHeader}>
                    <h2>Account Security</h2>
                </div>
                <div className={styles.toggleRow} onClick={() => toggleFeature('twoFactor')}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <Smartphone color="var(--corewave-cyan)" />
                        <div>
                            <h4>Two-Factor Authentication</h4>
                            <p>Add a secondary hardware or software layer.</p>
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
                    <h2>Delivery Preferences</h2>
                    <p>Configure how you receive platform updates and alerts.</p>
                </div>
                <div className={styles.toggleRow} onClick={() => toggleFeature('emailNotifications')}>
                    <div>
                        <h4>Email Updates</h4>
                        <p>Receive notifications about mentions and playlist adds.</p>
                    </div>
                    <div className={toggles.emailNotifications ? styles.switchActive : styles.switch}></div>
                </div>
                <div className={styles.toggleRow} onClick={() => toggleFeature('pushNotifications')}>
                    <div>
                        <h4>Push Notifications</h4>
                        <p>Real-time browser and mobile alerts.</p>
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
                        <span>Platform Nodes • 2026</span>
                    </div>
                    <h1 className="text-gradient">Control Center</h1>
                    <p>Orchestrate your identity, security, and global preferences.</p>
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
                            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--muted-foreground)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Global Sync Status</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--corewave-cyan)', fontSize: '0.85rem', fontWeight: 700 }}>
                                <div className={styles.pulse}></div> Orchestrated
                            </div>
                        </div>

                        <nav className={styles.sideNav}>
                            <button className={activeTab === 'account' ? styles.sideLinkActive : styles.sideLink} onClick={() => setActiveTab('account')}><User size={18} /> Account</button>
                            <button className={activeTab === 'security' ? styles.sideLinkActive : styles.sideLink} onClick={() => setActiveTab('security')}><Shield size={18} /> Security</button>
                            <button className={activeTab === 'notifications' ? styles.sideLinkActive : styles.sideLink} onClick={() => setActiveTab('notifications')}><Bell size={18} /> Notifications</button>
                            <button className={activeTab === 'subscription' ? styles.sideLinkActive : styles.sideLink} onClick={() => setActiveTab('subscription')}><CreditCard size={18} /> Subscription</button>
                            <button className={activeTab === 'language' ? styles.sideLinkActive : styles.sideLink} onClick={() => setActiveTab('language')}><Globe size={18} /> Language</button>
                        </nav>

                        <div className={styles.sidebarFooter}>
                            <button className={styles.logoutBtn} onClick={() => router.push('/api/auth/signout')}>
                                <LogOut size={18} /> Sign Out Session
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
                                    <h2>Pro Membership</h2>
                                    <p>You are currently on the <strong>Basic</strong> node.</p>
                                </div>
                                <button className="btn-primary" onClick={() => router.push('/pro')}>Upgrade to Pro</button>
                            </div>
                        )}
                        {activeTab === 'language' && (
                            <div className={`${styles.section} premium-card`}>
                                <div className={styles.sectionHeader}>
                                    <h2>{t('language')}</h2>
                                </div>
                                <select
                                    className={styles.premiumSelect}
                                    value={language}
                                    onChange={(e) => {
                                        setLanguage(e.target.value as any);
                                        addToast(`${t('save')} - ${e.target.value.toUpperCase()}`);
                                    }}
                                >
                                    <option value="en">English (Global)</option>
                                    <option value="fr">Français</option>
                                    <option value="de">Deutsch</option>
                                    <option value="es">Español</option>
                                </select>

                            </div>
                        )}
                    </main>
                </div>
            </div >
        </div >
    );
}
