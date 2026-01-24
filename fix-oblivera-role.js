// Script to update a user's role to ARTIST
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = 'contact.oblivera@gmail.com';

    const updated = await prisma.user.update({
        where: { email },
        data: { role: 'ARTIST' },
    });

    console.log('User role updated:');
    console.log(JSON.stringify(updated, null, 2));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
