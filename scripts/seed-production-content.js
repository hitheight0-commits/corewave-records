#!/usr/bin/env node

/**
 * Production Content Seeding Script
 * 
 * This script populates the production database with the "Mock" tracks
 * that the UI depends on. This prevents foreign key constraint violations
 * when users try to Like or add these tracks to Playlists.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding production content (Tracks & Artists)...\n');

    // 1. Create a System Artist
    const artistEmail = 'official.artist@corewave.com';
    const artist = await prisma.user.upsert({
        where: { email: artistEmail },
        update: {},
        create: {
            email: artistEmail,
            name: 'CoreWave Official',
            password: 'system-generated-artist-123!',
            role: 'ARTIST',
            isVerified: true,
            bio: 'Official CoreWave Content Artist',
        }
    });

    console.log(`✅ Artist created/verified: ${artist.name}`);

    // 2. Seed the specific Mock Tracks used in Home/Explore Fallbacks
    const mockTracks = [
        {
            id: 'mock-1',
            artistId: artist.id,
            title: 'Midnight City',
            audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
            coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&h=400&fit=crop',
            genre: 'Electronic',
            status: 'APPROVED',
            duration: 240
        },
        {
            id: 'mock-2',
            artistId: artist.id,
            title: 'Starboy',
            audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
            coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop',
            genre: 'R&B',
            status: 'APPROVED',
            duration: 230
        },
        {
            id: 'mock-3',
            artistId: artist.id,
            title: 'Nightcall',
            audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
            coverUrl: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=400&h=400&fit=crop',
            genre: 'Synthwave',
            status: 'APPROVED',
            duration: 258
        }
    ];

    for (const trackData of mockTracks) {
        const track = await prisma.track.upsert({
            where: { id: trackData.id },
            update: trackData,
            create: trackData
        });
        console.log(`✅ Track seeded: ${track.title} (${track.id})`);
    }

    console.log('\n✨ Seeding completed successfully! The production site is now data-synchronized.');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
