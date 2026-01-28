#!/usr/bin/env node

/**
 * Post-deployment Script for Vercel
 * 
 * This script runs automatically after successful Vercel deployment
 * to ensure database is properly migrated and seeded.
 */

const { execSync } = require('child_process');

console.log('🚀 Running post-deployment tasks...\n');

try {
    // Run Prisma migrations
    console.log('📦 Running database migrations...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    console.log('✅ Migrations completed\n');

    // Optional: Seed database if needed
    // Uncomment if you have a seed script
    // console.log('🌱 Seeding database...');
    // execSync('npx prisma db seed', { stdio: 'inherit' });
    // console.log('✅ Seeding completed\n');

    console.log('✨ Post-deployment tasks completed successfully!');
} catch (error) {
    console.error('❌ Post-deployment failed:', error.message);
    process.exit(1);
}
