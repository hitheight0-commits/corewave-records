// Quick script to check a specific user's role
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = process.argv[2] || 'oblivera@example.com';

    const user = await prisma.user.findUnique({
        where: { email },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
        }
    });

    if (user) {
        console.log('User found:');
        console.log(JSON.stringify(user, null, 2));
    } else {
        console.log(`No user found with email: ${email}`);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
