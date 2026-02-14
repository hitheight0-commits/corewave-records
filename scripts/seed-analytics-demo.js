const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedAnalyticsDemo() {
    console.log('🎯 Seeding Analytics Demo Data...\n');

    try {
        // 1. Create or get test artist
        const hashedPassword = await bcrypt.hash('artist123', 10);

        let artist = await prisma.user.findUnique({
            where: { email: 'artist@test.com' }
        });

        if (!artist) {
            artist = await prisma.user.create({
                data: {
                    email: 'artist@test.com',
                    password: hashedPassword,
                    name: 'Demo Artist',
                    role: 'ARTIST',
                    bio: 'Professional artist testing analytics dashboard',
                    image: 'https://i.pravatar.cc/300?img=12'
                }
            });
            console.log('✅ Created demo artist:', artist.name);
        } else {
            console.log('✅ Found existing artist:', artist.name);
        }

        // 2. Create test tracks
        const trackTitles = [
            'Midnight Dreams',
            'Electric Sunrise',
            'Lost in Tokyo',
            'Cosmic Journey',
            'Urban Nights'
        ];

        const tracks = [];
        for (const title of trackTitles) {
            const existing = await prisma.track.findFirst({
                where: { title, artistId: artist.id }
            });

            if (!existing) {
                const track = await prisma.track.create({
                    data: {
                        title,
                        artistId: artist.id,
                        audioUrl: `https://example.com/audio/${title.replace(/\s+/g, '-').toLowerCase()}.mp3`,
                        coverUrl: `https://picsum.photos/seed/${title}/400/400`,
                        genre: ['Electronic', 'Ambient', 'Lo-Fi', 'House'][Math.floor(Math.random() * 4)],
                        mood: ['Chill', 'Energetic', 'Melancholic', 'Uplifting'][Math.floor(Math.random() * 4)],
                        duration: 180 + Math.floor(Math.random() * 120),
                        plays: Math.floor(Math.random() * 500) + 100,
                        status: 'APPROVED'
                    }
                });
                tracks.push(track);
                console.log('✅ Created track:', track.title);
            } else {
                tracks.push(existing);
            }
        }

        // 3. Create PlayEvents (last 30 days)
        const now = new Date();
        const countries = ['US', 'FR', 'GB', 'DE', 'CA', 'JP', 'AU', 'BR', 'ES', 'IT'];

        console.log('\n📊 Creating play events...');
        let eventCount = 0;

        for (let day = 0; day < 30; day++) {
            const eventsPerDay = Math.floor(Math.random() * 50) + 20; // 20-70 events per day

            for (let i = 0; i < eventsPerDay; i++) {
                const randomTrack = tracks[Math.floor(Math.random() * tracks.length)];
                const randomCountry = countries[Math.floor(Math.random() * countries.length)];
                const eventDate = new Date(now.getTime() - (day * 24 * 60 * 60 * 1000) - (Math.random() * 24 * 60 * 60 * 1000));

                await prisma.playEvent.create({
                    data: {
                        trackId: randomTrack.id,
                        userId: Math.random() > 0.3 ? null : artist.id, // 70% anonymous
                        geo: randomCountry,
                        position: Math.floor(Math.random() * 100),
                        createdAt: eventDate
                    }
                });
                eventCount++;
            }
        }

        console.log(`✅ Created ${eventCount} play events across 30 days\n`);

        // 4. Create some followers
        const followerEmails = [
            'fan1@test.com',
            'fan2@test.com',
            'fan3@test.com'
        ];

        for (const email of followerEmails) {
            let follower = await prisma.user.findUnique({ where: { email } });

            if (!follower) {
                follower = await prisma.user.create({
                    data: {
                        email,
                        password: hashedPassword,
                        name: email.split('@')[0],
                        role: 'LISTENER'
                    }
                });
            }

            // Create follow relationship
            const existing = await prisma.follows.findUnique({
                where: {
                    followerId_followingId: {
                        followerId: follower.id,
                        followingId: artist.id
                    }
                }
            });

            if (!existing) {
                await prisma.follows.create({
                    data: {
                        followerId: follower.id,
                        followingId: artist.id
                    }
                });
                console.log(`✅ ${follower.name} is now following ${artist.name}`);
            }
        }

        console.log('\n✨ Demo data seeded successfully!');
        console.log('\n📌 Login credentials:');
        console.log('   Email: artist@test.com');
        console.log('   Password: artist123');
        console.log('\n🔗 Navigate to: http://localhost:3000/analytics');

    } catch (error) {
        console.error('❌ Seeding failed:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

seedAnalyticsDemo();
