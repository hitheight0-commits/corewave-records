const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // Delete all users except Oblivéra if we want to keep it, 
    // but better to just delete everything for a clean test of the flow.
    await prisma.track.deleteMany();
    await prisma.user.deleteMany();
    console.log("Database cleared.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
