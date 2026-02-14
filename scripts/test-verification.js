const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// This script simulates the logic of checkAndVerifyArtist for a specific user
async function testVerification(userId) {
    console.log(`\n🧪 [TEST] Verifying artist node: ${userId}`);

    try {
        const [user, trackCount, followerCount, tracks] = await Promise.all([
            prisma.user.findUnique({
                where: { id: userId },
                select: { name: true, image: true, bio: true, isVerified: true }
            }),
            prisma.track.count({
                where: { artistId: userId, status: 'APPROVED' }
            }),
            prisma.follows.count({
                where: { followingId: userId }
            }),
            prisma.track.findMany({
                where: { artistId: userId },
                select: { plays: true }
            })
        ]);

        if (!user) {
            console.error("❌ User not found");
            return;
        }

        const totalPlays = tracks.reduce((sum, t) => sum + t.plays, 0);

        const status = {
            hasImage: !!user.image && user.image.length > 0,
            hasBio: !!user.bio && user.bio.length > 10,
            approvedTracks: { current: trackCount, required: 10, pass: trackCount >= 10 },
            followers: { current: followerCount, required: 25, pass: followerCount >= 25 },
            plays: { current: totalPlays, required: 1000, pass: totalPlays >= 1000 }
        };

        const meetsAllCriteria = status.hasImage &&
            status.hasBio &&
            status.approvedTracks.pass &&
            status.followers.pass &&
            status.plays.pass;

        console.log(`👤 Artist: ${user.name}`);
        console.log(`🖼️  Image: ${status.hasImage ? '✅' : '❌'}`);
        console.log(`📝 Bio: ${status.hasBio ? '✅' : '❌'}`);
        console.log(`🎵 Tracks: ${status.approvedTracks.current}/${status.approvedTracks.required} ${status.approvedTracks.pass ? '✅' : '❌'}`);
        console.log(`👥 Followers: ${status.followers.current}/${status.followers.required} ${status.followers.pass ? '✅' : '❌'}`);
        console.log(`📈 Plays: ${status.plays.current}/${status.plays.required} ${status.plays.pass ? '✅' : '❌'}`);
        console.log(`\n💎 Final Status: ${meetsAllCriteria ? 'VERIFIED' : 'NOT VERIFIED'}`);
        console.log(`🛡️  Database Current: ${user.isVerified ? 'VERIFIED' : 'NOT VERIFIED'}`);

        if (meetsAllCriteria !== user.isVerified) {
            console.warn("\n⚠️  [MISMATCH] Database status out of sync with current metrics.");
        } else {
            console.log("\n✅ [SYNC] Database status is accurate.");
        }

    } catch (error) {
        console.error("❌ Test failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}

// Get userId from command line
const userId = process.argv[2];
if (!userId) {
    console.log("Usage: node scripts/test-verification.js <userId>");
    process.exit(1);
}

testVerification(userId);
