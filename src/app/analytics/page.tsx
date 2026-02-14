import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';

export const metadata = {
    title: 'Analytics - CoreWave Records',
    description: 'Track your performance and audience engagement',
};

export default async function AnalyticsPage() {
    const session = await getServerSession(authOptions);

    // Redirect if not authenticated
    if (!session) {
        redirect('/login');
    }

    // Only artists can access analytics
    if (session.user.role !== 'ARTIST') {
        redirect('/');
    }

    return (
        <main style={{ minHeight: '100vh', paddingTop: '80px' }}>
            <AnalyticsDashboard />
        </main>
    );
}
