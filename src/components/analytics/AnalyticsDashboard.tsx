'use client';

import { useEffect, useState } from 'react';
import styles from './Analytics.module.css';

interface AnalyticsData {
    stats: Array<{
        label: string;
        value: string;
        growth: string;
        rawValue: number;
    }>;
    trends: Array<{ date: string; plays: number }>;
    demographics: Array<{ country: string; count: number; percentage: string }>;
    topTracks: Array<{ id: string; title: string; plays: number; coverUrl: string }>;
    recentActivity: Array<{
        type: string;
        trackTitle: string;
        geo: string;
        timestamp: string;
        coverUrl: string;
    }>;
    liveNow: number;
}

export default function AnalyticsDashboard() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [liveListeners, setLiveListeners] = useState(0);
    const [liveEvents, setLiveEvents] = useState<any[]>([]);

    useEffect(() => {
        fetchAnalytics();

        // Set up SSE connection for real-time updates
        const eventSource = new EventSource('/api/artist/analytics/live');

        eventSource.onmessage = (event: MessageEvent) => {
            try {
                const update = JSON.parse(event.data);
                if (update.type === 'update') {
                    setLiveListeners(update.liveNow || 0);
                    if (update.recentEvents && update.recentEvents.length > 0) {
                        setLiveEvents(prev => [...update.recentEvents, ...prev.slice(0, 17)]);
                    }
                }
            } catch (err) {
                console.error('[SSE_PARSE_ERROR]', err);
            }
        };

        eventSource.onerror = () => {
            console.error('[SSE_CONNECTION_ERROR]');
            eventSource.close();
        };

        return () => {
            eventSource.close();
        };
    }, []);

    const fetchAnalytics = async () => {
        try {
            const response = await fetch('/api/artist/analytics');
            if (!response.ok) throw new Error('Failed to fetch analytics');
            const result = await response.json();
            setData(result);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}d ago`;
    };

    if (loading) {
        return (
            <div className={styles['loading-spinner']}>
                <div className={styles.spinner}></div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className={styles['error-state']}>
                <h2>Failed to load analytics</h2>
                <p>{error || 'Unknown error occurred'}</p>
                <button onClick={fetchAnalytics} style={{ marginTop: '16px' }}>
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '48px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '8px' }}>
                            Artist Analytics
                        </h1>
                        <p style={{ color: 'rgba(255,255,255,0.6)' }}>
                            Track your performance and audience engagement
                        </p>
                        <button
                            onClick={() => window.location.href = '/api/artist/analytics/export'}
                            style={{
                                marginTop: '12px',
                                padding: '8px 16px',
                                background: 'rgba(99, 102, 241, 0.1)',
                                border: '1px solid rgba(99, 102, 241, 0.3)',
                                borderRadius: '8px',
                                color: '#6366f1',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)';
                                e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.5)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
                                e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)';
                            }}
                        >
                            📊 Export to CSV
                        </button>
                    </div>

                    {/* Live Listeners Badge */}
                    {liveListeners > 0 && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 24px',
                            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '12px',
                            backdropFilter: 'blur(10px)'
                        }}>
                            <div style={{
                                width: '12px',
                                height: '12px',
                                borderRadius: '50%',
                                background: '#ef4444',
                                boxShadow: '0 0 12px rgba(239, 68, 68, 0.8)',
                                animation: 'pulse 2s ease-in-out infinite'
                            }}></div>
                            <div>
                                <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)' }}>Live Now</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#ef4444' }}>
                                    {liveListeners} {liveListeners === 1 ? 'listener' : 'listeners'}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '24px',
                marginBottom: '48px'
            }}>
                {data.stats.map((stat, idx) => (
                    <div key={idx} className={styles['stat-card']}>
                        <div className={styles['stat-label']}>{stat.label}</div>
                        <div className={styles['stat-value']}>{stat.value}</div>
                        {stat.growth && (
                            <div className={`${styles['stat-growth']} ${stat.growth.includes('-') ? styles.negative : ''}`}>
                                {stat.growth}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Trends Chart */}
            <div style={{ marginBottom: '48px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '24px' }}>
                    30-Day Trend
                </h2>
                <div className={styles['chart-container']}>
                    <SimpleLineChart data={data.trends} />
                </div>
            </div>

            {/* Two Column Layout */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '32px',
                marginBottom: '48px'
            }}>
                {/* Top Tracks */}
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '24px' }}>
                        Top Tracks
                    </h2>
                    <div className={styles['top-tracks-grid']}>
                        {data.topTracks.map((track, idx) => (
                            <div key={track.id} className={styles['track-item']}>
                                <div className={styles['track-rank']}>#{idx + 1}</div>
                                <img
                                    src={track.coverUrl || '/placeholder-cover.png'}
                                    alt={track.title}
                                    className={styles['track-cover']}
                                />
                                <div className={styles['track-info']}>
                                    <div className={styles['track-title']}>{track.title}</div>
                                    <div className={styles['track-plays']}>
                                        {track.plays.toLocaleString()} plays
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Geographic Distribution */}
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '24px' }}>
                        Top Locations
                    </h2>
                    <div className={styles['demographics-grid']}>
                        {data.demographics.map((country, idx) => (
                            <div key={idx} className={styles['country-item']}>
                                <div className={styles['country-name']}>{country.country}</div>
                                <div className={styles['country-bar']}>
                                    <div
                                        className={styles['country-bar-fill']}
                                        style={{ width: `${country.percentage}%` }}
                                    ></div>
                                </div>
                                <div className={styles['country-percentage']}>{country.percentage}%</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Activity Feed */}
            <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '24px' }}>
                    Recent Activity
                    {liveEvents.length > 0 && (
                        <span style={{
                            marginLeft: '12px',
                            fontSize: '0.875rem',
                            color: '#10b981',
                            fontWeight: '400'
                        }}>
                            • Live updates enabled
                        </span>
                    )}
                </h2>
                <div className={styles['activity-feed']}>
                    {/* Merge live events with historical activity */}
                    {[...liveEvents, ...data.recentActivity].slice(0, 20).map((activity, idx) => (
                        <div key={idx} className={styles['activity-item']}>
                            <img
                                src={activity.coverUrl || '/placeholder-cover.png'}
                                alt={activity.trackTitle}
                                className={styles['activity-cover']}
                            />
                            <div className={styles['activity-details']}>
                                <div className={styles['activity-track']}>{activity.trackTitle}</div>
                                <div className={styles['activity-meta']}>
                                    <span>{activity.geo}</span>
                                    <span>{formatTimestamp(activity.timestamp)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Simple Line Chart Component (using SVG)
function SimpleLineChart({ data }: { data: Array<{ date: string; plays: number }> }) {
    if (data.length === 0) {
        return <div style={{ textAlign: 'center', paddingTop: '100px', color: 'rgba(255,255,255,0.5)' }}>
            No data available
        </div>;
    }

    // Calculate dimensions
    const width = 100; // percentage
    const height = 250;
    const padding = 20;

    const maxPlays = Math.max(...data.map(d => d.plays), 1);
    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * (width - 2 * padding) + padding;
        const y = height - padding - ((d.plays / maxPlays) * (height - 2 * padding));
        return ` ${x},${y}`;
    }).join(' ');

    const areaPoints = `${padding},${height - padding} ${points} ${width - padding},${height - padding}`;

    return (
        <svg
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
            style={{ width: '100%', height: '100%' }}
        >
            {/* Gradient Fill */}
            <defs>
                <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                </linearGradient>
            </defs>

            <polygon points={areaPoints} fill="url(#chartGradient)" />
            <polyline
                points={points}
                fill="none"
                stroke="#6366f1"
                strokeWidth="0.5"
            />
        </svg>
    );
}
