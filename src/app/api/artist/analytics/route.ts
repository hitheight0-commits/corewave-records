import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;

        // Fetch actual data from DB
        const tracks = await prisma.track.findMany({
            where: { artistId: userId },
            select: {
                plays: true,
                id: true,
                createdAt: true,
            }
        });

        const totalStreams = tracks.reduce((sum, t) => sum + t.plays, 0);

        // Live Listeners simulation (1-5% of total streams or at least 0-5 for small artists)
        const liveNow = Math.max(Math.floor(totalStreams * 0.002), Math.floor(Math.random() * 5));

        // Unique listeners simulation
        const uniqueListeners = Math.floor(totalStreams * 0.65);

        // Revenue simulation
        const revenue = (totalStreams * 0.007).toFixed(2);

        // Generate dynamic trend chart based on total streams
        // If totalStreams is 0, we still want a "live" feel, maybe show some noise
        const dailyData = Array.from({ length: 12 }, (_, i) => {
            if (totalStreams === 0) return Math.floor(Math.random() * 5);
            const base = totalStreams / 15;
            const variance = (Math.random() - 0.5) * (base * 0.5);
            return Math.max(0, Math.floor(base + variance));
        });

        // Demographics simulation (deterministic based on user ID)
        const seed = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const us = 35 + (seed % 20);
        const uk = 15 + (seed % 15);
        const de = 10 + (seed % 10);
        const other = 100 - us - uk - de;

        return NextResponse.json({
            liveNow,
            stats: [
                { label: 'Total Streams', value: totalStreams.toLocaleString(), growth: "+12%", type: 'STREAMS' },
                { label: 'Unique Listeners', value: uniqueListeners.toLocaleString(), growth: "+8%", type: 'LISTENERS' },
                { label: 'Estimated Revenue', value: `$${revenue}`, growth: "+15%", type: 'REVENUE' },
                { label: 'Retention Rate', value: '72%', growth: '+2%', type: 'RETENTION' },
            ],
            trends: dailyData,
            demographics: [
                { country: 'United States', percentage: us },
                { country: 'United Kingdom', percentage: uk },
                { country: 'Germany', percentage: de },
                { country: 'Others', percentage: other },
            ]
        });

    } catch (error) {
        console.error("Analytics API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
