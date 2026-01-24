"use client";

import { useState } from 'react';
import styles from '../explore/Explore.module.css';
import proStyles from './Pro.module.css';
import { Check, Zap, Crown, Shield, Rocket, Music, Star, X } from 'lucide-react';
import { useToastStore } from '@/store/useToastStore';

export default function ProPage() {
    const { addToast } = useToastStore();
    const [showModal, setShowModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

    const handleUpgrade = (planName: string) => {
        if (planName === 'Basic') return;
        if (planName === 'Elite') {
            window.location.href = "mailto:elite@corewave.records?subject=Elite Plan Inquiry";
            return;
        }
        setSelectedPlan(planName);
        setShowModal(true);
    };

    const confirmUpgrade = () => {
        addToast(`Successfully upgraded to ${selectedPlan}! Welcome to the evolution.`, "success");
        setShowModal(false);
    };

    const plans = [
        {
            name: 'Basic',
            price: 'Free',
            desc: 'Start your journey into the sound.',
            features: [
                'Unlimited uploads',
                'Core distribution stores',
                'Basic analytics',
                'Community access'
            ],
            icon: Music,
            color: 'var(--muted-foreground)',
            btn: 'Current Plan'
        },
        {
            name: 'Pro',
            price: '$12/mo',
            desc: 'Accelerate your evolution as an artist.',
            features: [
                'Everything in Basic',
                'Express Distribution (48h)',
                'Full Analytics & Trends',
                'Exclusive Masterclasses',
                'Priority Support'
            ],
            icon: Zap,
            color: 'var(--corewave-cyan)',
            popular: true,
            btn: 'Upgrade to Pro'
        },
        {
            name: 'Elite',
            price: '$29/mo',
            desc: 'The ultimate toolkit for industry leaders.',
            features: [
                'Everything in Pro',
                'A&R Consultation',
                'Marketing & PR credits',
                'Physical Distribution options',
                'Verified Artist Badge'
            ],
            icon: Crown,
            color: 'var(--corewave-purple)',
            btn: 'Contact for Elite'
        }
    ];

    return (
        <div className={styles.explorePage}>
            <div className={`container ${styles.container}`}>
                <header className={styles.header} style={{ textAlign: 'center' }}>
                    <div className={proStyles.heroTag}>
                        <Star size={16} fill="var(--corewave-cyan)" color="var(--corewave-cyan)" />
                        <span>CoreWave Pro Ecosystem</span>
                    </div>
                    <h1 className="text-gradient" style={{ fontSize: '4rem' }}>Evolve Your Sound.</h1>
                    <p style={{ maxWidth: '600px', margin: '1rem auto' }}>
                        Choose the toolkit that matches your ambition. High-fidelity tools for every stage of your career.
                    </p>
                </header>

                <div className={proStyles.pricingGrid}>
                    {plans.map((plan, i) => (
                        <div key={i} className={`${proStyles.planCard} premium-card ${plan.popular ? proStyles.popular : ''}`}>
                            {plan.popular && <div className={proStyles.popularBadge}>Most Evolved</div>}
                            <div className={proStyles.planHeader}>
                                <plan.icon size={40} color={plan.color} />
                                <div>
                                    <h3>{plan.name}</h3>
                                    <p>{plan.desc}</p>
                                </div>
                            </div>
                            <div className={proStyles.price}>
                                {plan.price}
                            </div>
                            <ul className={proStyles.features}>
                                {plan.features.map((feat, j) => (
                                    <li key={j}><Check size={16} color={plan.color} /> {feat}</li>
                                ))}
                            </ul>
                            <button
                                className={plan.popular ? "btn-primary" : "btn-outline"}
                                style={{ width: '100%', marginTop: 'auto', justifyContent: 'center' }}
                                onClick={() => handleUpgrade(plan.name)}
                                disabled={plan.name === 'Basic'}
                            >
                                {plan.btn}
                            </button>
                        </div>
                    ))}
                </div>

                {showModal && (
                    <div className={proStyles.modalOverlay} onClick={() => setShowModal(false)}>
                        <div className={`${proStyles.modal} premium-card`} onClick={(e) => e.stopPropagation()}>
                            <button className={proStyles.closeBtn} onClick={() => setShowModal(false)}><X size={20} /></button>
                            <Zap size={48} color="var(--corewave-cyan)" style={{ marginBottom: '1.5rem' }} />
                            <h2>Upgrade to {selectedPlan}</h2>
                            <p>You are about to evolve your account. This will unlock all {selectedPlan} features immediately.</p>
                            <div className={proStyles.modalActions}>
                                <button className="btn-primary" onClick={confirmUpgrade}>Confirm Evolution</button>
                                <button className="btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}

                <section className={proStyles.comparison}>
                    <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>Power to the Artists</h2>
                    <div className={proStyles.featureRows}>
                        <div className={`${proStyles.featureRow} premium-card`}>
                            <Rocket size={32} />
                            <div>
                                <h4>Express Pipe™ Distribution</h4>
                                <p>Don't wait weeks. Our Pro and Elite plans use dedicated delivery lanes to get your music live faster than ever.</p>
                            </div>
                        </div>
                        <div className={`${proStyles.featureRow} premium-card`}>
                            <Shield size={32} />
                            <div>
                                <h4>Advanced Copyright Protection</h4>
                                <p>Every Pro track is automatically matched against global databases to prevent infringement and protect your royalties.</p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
