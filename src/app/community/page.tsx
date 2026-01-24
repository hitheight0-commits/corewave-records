"use client";

import { useState } from 'react';
import styles from '../explore/Explore.module.css';
import commStyles from './Community.module.css';
import proStyles from '../pro/Pro.module.css'; // Reuse modal styles
import { Users, Twitter, Instagram, MessageCircle, Star, Award, Zap, X } from 'lucide-react';
import { useToastStore } from '@/store/useToastStore';

export default function CommunityPage() {
    const { addToast } = useToastStore();
    const [showModal, setShowModal] = useState(false);
    const [nomination, setNomination] = useState({ name: '', reason: '' });

    const handleNominate = (e: React.FormEvent) => {
        e.preventDefault();
        addToast(`Nomination for ${nomination.name} received! We will review their profile.`, "success");
        setShowModal(false);
        setNomination({ name: '', reason: '' });
    };

    const socialLinks = [
        { name: 'Discord', desc: 'Join 50k+ producers and artists in our official server.', color: '#5865F2', icon: MessageCircle, url: 'https://discord.gg/corewave' },
        { name: 'X / Twitter', desc: 'Get the latest news and ecosystem updates.', color: '#000000', icon: Twitter, url: 'https://x.com/corewave' },
        { name: 'Instagram', desc: 'Visual evolution and artist spotlights.', color: '#E4405F', icon: Instagram, url: 'https://instagram.com/corewave' },
    ];

    return (
        <div className={styles.explorePage}>
            <div className={`container ${styles.container}`}>
                <header className={styles.header} style={{ textAlign: 'center' }}>
                    <h1 className="text-gradient" style={{ fontSize: '4rem' }}>The Sound Community</h1>
                    <p style={{ maxWidth: '700px', margin: '1rem auto' }}>
                        Where artists, producers, and fans collide to shape the future of music.
                    </p>
                </header>

                <div className={commStyles.socialGrid}>
                    {socialLinks.map((social, i) => (
                        <div key={i} className={`${commStyles.socialCard} premium-card`} style={{ '--hover-color': social.color } as any}>
                            <social.icon size={40} style={{ color: social.color }} />
                            <h3>{social.name}</h3>
                            <p>{social.desc}</p>
                            <a href={social.url} target="_blank" rel="noopener noreferrer" className="btn-outline" style={{ textAlign: 'center' }}>Join Channel</a>
                        </div>
                    ))}
                </div>

                <section className={commStyles.spotlight}>
                    <div className={commStyles.spotlightHeader}>
                        <h2>Community Spotlights</h2>
                        <button className="btn-outline" onClick={() => setShowModal(true)}>Nominate an Artist</button>
                    </div>
                    <div className={commStyles.spotlightGrid}>
                        {[1, 2, 3].map((item) => (
                            <div key={item} className={`${commStyles.spotlightCard} premium-card`}>
                                <div className={commStyles.avatarPlaceholder}>
                                    <Star fill="currentColor" size={24} />
                                </div>
                                <h4>Artist Of The Month</h4>
                                <p>Recognizing exceptional creativity and contribution to the CoreWave ecosystem.</p>
                                <div className={commStyles.reward}>
                                    <Award size={16} /> <span>PRO+ Badge</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className={`${commStyles.discordHero} premium-card`}>
                    <div className={commStyles.discordContent}>
                        <Zap size={48} color="var(--corewave-cyan)" />
                        <h2>Developer & Artist DAO</h2>
                        <p>Participate in governance and help decide the future features of CoreWave Records. Token-gated access for Elite members.</p>
                        <button className="btn-primary" onClick={() => addToast("Governance portal opening in Q3 2026", "info")}>Learn More About Governance</button>
                    </div>
                </section>

                {showModal && (
                    <div className={proStyles.modalOverlay} onClick={() => setShowModal(false)}>
                        <div className={`${proStyles.modal} premium-card`} onClick={(e) => e.stopPropagation()} style={{ textAlign: 'left' }}>
                            <button className={proStyles.closeBtn} onClick={() => setShowModal(false)}><X size={20} /></button>
                            <h2 className="text-gradient">Nominate Artist</h2>
                            <p>Know an artist who is pushing the boundaries of sound? Nominate them for the spotlight.</p>
                            <form onSubmit={handleNominate}>
                                <div className="field" style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Artist Name</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Oblivéra"
                                        value={nomination.name}
                                        onChange={(e) => setNomination({ ...nomination, name: e.target.value })}
                                        style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '8px', color: 'white' }}
                                    />
                                </div>
                                <div className="field" style={{ marginBottom: '2rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Why do they deserve a spotlight?</label>
                                    <textarea
                                        required
                                        placeholder="Share their impact..."
                                        rows={4}
                                        value={nomination.reason}
                                        onChange={(e) => setNomination({ ...nomination, reason: e.target.value })}
                                        style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '8px', color: 'white' }}
                                    />
                                </div>
                                <button type="submit" className="btn-primary" style={{ width: '100%' }}>Submit Nomination</button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
