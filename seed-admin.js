const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const email = 'adminMichael1958@gmail.com';
    const password = 'MichaelJackson1958591!!**';
    const name = 'Michael Admin';
    const role = 'ADMIN';

    const hashedPassword = await hash(password, 10);

    const user = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
            email,
            name,
            password: hashedPassword,
            role,
        },
    });

    console.log(`Admin user created/verified: ${user.email} (${user.role})`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
