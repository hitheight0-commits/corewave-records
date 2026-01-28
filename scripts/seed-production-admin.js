#!/usr/bin/env node

/**
 * Admin Seed Script for Production
 * 
 * Creates an initial admin user in the production database.
 * Run this after your first production deployment.
 * 
 * Usage: node scripts/seed-production-admin.js
 */

const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding production admin user...\n');

    const email = process.env.ADMIN_EMAIL || 'admin@corewave.com';
    const password = process.env.ADMIN_PASSWORD || 'ChangeThisPassword123!'; // Default fallback
    const name = 'CoreWave Admin';

    // Check if admin already exists
    const existing = await prisma.user.findUnique({
        where: { email }
    });

    if (existing) {
        console.log('⚠️  Admin user already exists!');
        console.log(`Email: ${existing.email}`);
        console.log(`Role: ${existing.role}\n`);
        return;
    }

    // Create admin user
    const hashedPassword = await hash(password, 10);

    const admin = await prisma.user.create({
        data: {
            email,
            name,
            password: hashedPassword,
            role: 'ADMIN',
            isVerified: true,
            bio: 'Platform Administrator',
        }
    });

    console.log('✅ Admin user created successfully!');
    console.log(`Email: ${admin.email}`);
    console.log(`Role: ${admin.role}`);
    console.log(`\n⚠️  IMPORTANT: Change the default password immediately after first login!\n`);
}

main()
    .catch((error) => {
        console.error('❌ Error seeding admin:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
