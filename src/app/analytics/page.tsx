"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import styles from '../explore/Explore.module.css';
import anaStyles from './Analytics.module.css';
import { BarChart3, TrendingUp, Users, Activity, Play, DollarSign, ChevronRight, Calendar, Loader2, RefreshCw } from 'lucide-react';

interface Stat {
    label: string;
    value: string;
    growth: string;
    type: string;
}

interface Demographic {
    country: string;
    percentage: number;
}

export default function AnalyticsPage() {
    const { data: session, status } = useSession();
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<string>('');
    const [data, setData] = useState<{
        liveNow: number;
        stats: Stat[];
        trends: number[];
        demographics: Demographic[];
    } | null>(null);

    useEffect(() => {
        if (status === 'authenticated') {
            fetchAnalytics();
            const interval = setInterval(fetchAnalytics, 15000); // More frequent polling for "super real time"
            return () => clearInterval(interval);
        } else if (status === 'unauthenticated') {
            setLoading(false);
        }
    }, [status]);

    const fetchAnalytics = async () => {
        try {
            const res = await fetch('/api/artist/analytics');
            const json = await res.json();
            if (res.ok) {
                setData(json);
                setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
            }
        } catch (err) {
            console.error("Failed to fetch analytics:", err);
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'STREAMS': return Play;
            case 'LISTENERS': return Users;
            case 'REVENUE': return DollarSign;
            default: return Activity;
        }
    };

    if (loading) {
        return (
            <div className={styles.explorePage}>
                <div className={styles.loadingContainer}>
                    <Loader2 className="spinner" size={48} />
                    <p>Accessing the CoreWave global data stream...</p>
                </div>
            </div>
        );
    }

    if (!session) {
        return (
            <div className={styles.explorePage}>
                <div className={styles.emptyState}>
                    <h2>Artist Access Required</h2>
                    <p>Please log in to synchronize your real-time performance data.</p>
                </div>
            </div>
        );
    }

    return (
        <main className={styles.explorePage}>
            <div className={`container ${styles.container}`}>
                <header className={styles.header} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div className={anaStyles.liveNow}>
                                <div className={anaStyles.pulse}></div>
                                <span>{data?.liveNow || 0} Live Listeners</span>
                            </div>
                            <div className={anaStyles.lastUpdate}>
                                <RefreshCw size={12} className={anaStyles.rotating} />
                                <span>Updated at {lastUpdated}</span>
                            </div>
                        </div>
                        <h1 className="text-gradient">Artist Analytics</h1>
                        <p style={{ color: 'var(--muted-foreground)' }}>Performance overview for <strong>{session.user.name}</strong></p>
                    </div>
                    <div className={anaStyles.datePicker}>
                        <Calendar size={18} />
                        <span>Last 30 Days</span>
                    </div>
                </header>

                <div className={anaStyles.statsGrid}>
                    {(data?.stats || []).map((stat, i) => {
                        const Icon = getIcon(stat.type);
                        return (
                            <div key={i} className={`${anaStyles.statCard} premium-card`} style={{ transitionDelay: `${i * 100}ms` }}>
                                <div className={anaStyles.statHeader}>
                                    <div className={anaStyles.statIcon}>
                                        <Icon size={20} />
                                    </div>
                                    <span className={anaStyles.growth}>{stat.growth}</span>
                                </div>
                                <div className={anaStyles.statBody}>
                                    <span className={anaStyles.label}>{stat.label}</span>
                                    <span className={anaStyles.value}>{stat.value}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className={anaStyles.mainCharts}>
                    <div className={`${anaStyles.chartWrapper} premium-card`}>
                        <div className={anaStyles.chartHeader}>
                            <h3>Streaming History</h3>
                            <button className={anaStyles.moreBtn}>Detailed Reports <ChevronRight size={14} /></button>
                        </div>
                        <div className={anaStyles.visualizer}>
                            {(data?.trends || []).map((val, i) => {
                                const max = Math.max(...(data?.trends || [100]), 1);
                                const height = (val / max) * 100;
                                return (
                                    <div key={i} className={anaStyles.bar} style={{ height: `${height}%`, transitionDelay: `${i * 30}ms` }}>
                                        <div className={anaStyles.barTooltip}>Day {i + 1}<br />{val.toLocaleString()} plays</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className={`${anaStyles.chartWrapper} premium-card`}>
                        <div className={anaStyles.chartHeader}>
                            <h3>Real-time Population</h3>
                            <button className={anaStyles.moreBtn}>Global Map <ChevronRight size={14} /></button>
                        </div>
                        <div className={anaStyles.geoStats}>
                            {(data?.demographics || []).map((geo, i) => (
                                <div key={i} className={anaStyles.geoRow}>
                                    <span>{geo.country}</span>
                                    <div className={anaStyles.progressTrack}>
                                        <div
                                            className={anaStyles.progressBar}
                                            style={{ width: `${geo.percentage}%` }}
                                        ></div>
                                    </div>
                                    <span>{geo.percentage}%</span>
                                </div>
                            ))}
                        </div>
                        <p style={{ marginTop: 'auto', fontSize: '0.8rem', color: 'var(--muted-foreground)', textAlign: 'center' }}>
                            Listening trends are calculated using live GPS telemetry across all CoreWave nodes.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
