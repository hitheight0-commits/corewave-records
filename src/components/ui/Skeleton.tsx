import React from 'react';
import styles from './Skeleton.module.css';

interface SkeletonProps {
    width?: string;
    height?: string;
    borderRadius?: string;
    className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
    width = '100%',
    height = '20px',
    borderRadius = '4px',
    className = '',
}) => {
    return (
        <div
            className={`${styles.skeleton} ${className}`}
            style={{ width, height, borderRadius }}
        />
    );
};

// Track Card Skeleton
export const TrackCardSkeleton: React.FC = () => {
    return (
        <div className={styles.trackCardSkeleton}>
            <Skeleton height="220px" borderRadius="0" className={styles.cover} />
            <div className={styles.info}>
                <Skeleton width="80%" height="16px" />
                <Skeleton width="60%" height="14px" />
            </div>
        </div>
    );
};

// Artist Card Skeleton
export const ArtistCardSkeleton: React.FC = () => {
    return (
        <div className={styles.artistCardSkeleton}>
            <Skeleton height="220px" borderRadius="50%" className={styles.avatar} />
            <div className={styles.info}>
                <Skeleton width="70%" height="18px" />
                <Skeleton width="50%" height="14px" />
                <div className={styles.buttons}>
                    <Skeleton height="40px" borderRadius="0" />
                    <Skeleton height="40px" borderRadius="0" />
                </div>
            </div>
        </div>
    );
};

// Trending Item Skeleton
export const TrendingItemSkeleton: React.FC = () => {
    return (
        <div className={styles.trendingItemSkeleton}>
            <Skeleton width="40px" height="40px" borderRadius="0" className={styles.rank} />
            <Skeleton width="60px" height="60px" borderRadius="0" className={styles.cover} />
            <div className={styles.info}>
                <Skeleton width="200px" height="18px" />
                <Skeleton width="120px" height="14px" />
            </div>
            <Skeleton width="80px" height="30px" className={styles.trend} />
        </div>
    );
};

// Grid Skeleton (for multiple cards)
interface GridSkeletonProps {
    count?: number;
    type?: 'track' | 'artist' | 'trending';
}

export const GridSkeleton: React.FC<GridSkeletonProps> = ({ count = 6, type = 'track' }) => {
    const SkeletonComponent =
        type === 'artist' ? ArtistCardSkeleton :
            type === 'trending' ? TrendingItemSkeleton :
                TrackCardSkeleton;

    return (
        <div className={type === 'trending' ? styles.listGrid : styles.cardGrid}>
            {Array.from({ length: count }).map((_, index) => (
                <SkeletonComponent key={index} />
            ))}
        </div>
    );
};
