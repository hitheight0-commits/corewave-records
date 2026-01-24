const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixVerification() {
    console.log("🚀 [MAINTENANCE] Starting Artist Verification Reconnaissance...");

    try {
        const artists = await prisma.user.findMany({
            where: { role: 'ARTIST' },
            include: {
                _count: {
                    select: {
                        tracks: {
                            where: { status: 'APPROVED' }
                        }
                    }
                }
            }
        });

        console.log(`🔍 [ANALYSIS] Analyzing ${artists.length} artist nodes...`);

        for (const artist of artists) {
            const hasImage = !!artist.image && artist.image.length > 0;
            const hasBio = !!artist.bio && artist.bio.length > 10;

            // Re-fetch approved track count specifically
            const approvedTrackCount = await prisma.track.count({
                where: {
                    artistId: artist.id,
                    status: 'APPROVED'
                }
            });

            const meetsCriteria = hasImage && hasBio && approvedTrackCount >= 10;

            if (artist.isVerified !== meetsCriteria) {
                console.log(`⚙️ [SYNC] Updating verification for ${artist.name || artist.email}: ${artist.isVerified} -> ${meetsCriteria}`);
                await prisma.user.update({
                    where: { id: artist.id },
                    data: { isVerified: meetsCriteria }
                });
            }
        }

        console.log("✅ [SUCCESS] Verification synchronization complete.");
    } catch (error) {
        console.error("❌ [ERROR] Orchestration failure during verification fix:", error);
    } finally {
        await prisma.$disconnect();
    }
}

fixVerification();
