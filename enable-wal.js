const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Checking SQLite journal mode...');
    // Force WAL mode for better concurrency (prevents "database locked" errors)
    const result = await prisma.$queryRaw`PRAGMA journal_mode = WAL;`;
    console.log('Result:', result);
    console.log('WAL mode enabled. This should fix concurrent read/write locks.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
