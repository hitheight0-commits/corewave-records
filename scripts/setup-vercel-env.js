#!/usr/bin/env node

/**
 * Vercel Environment Variable Setup Script
 * 
 * This script helps configure environment variables for your Vercel deployment.
 * Run this after setting up your Vercel Postgres database.
 * 
 * Prerequisites:
 * 1. Install Vercel CLI: npm i -g vercel
 * 2. Login to Vercel: vercel login
 * 3. Link project: vercel link
 * 4. Set up Vercel Postgres in your dashboard first
 */

const { execSync } = require('child_process');

console.log('🚀 CoreWave Records - Vercel Environment Configuration\n');

// Check if vercel CLI is installed
try {
    execSync('vercel --version', { stdio: 'ignore' });
} catch (error) {
    console.error('❌ Vercel CLI not found. Install it with: npm i -g vercel');
    process.exit(1);
}

console.log('📋 Setting NEXTAUTH_URL...');
try {
    execSync('vercel env add NEXTAUTH_URL production', {
        input: 'https://corewave-records.vercel.app\n',
        stdio: 'inherit'
    });
    console.log('✅ NEXTAUTH_URL configured\n');
} catch (err) {
    console.log('⚠️  NEXTAUTH_URL may already exist\n');
}

console.log('📋 Setting NEXTAUTH_SECRET...');
console.log('💡 Generate a secure secret with: openssl rand -base64 32\n');
try {
    execSync('vercel env add NEXTAUTH_SECRET production', {
        stdio: 'inherit'
    });
    console.log('✅ NEXTAUTH_SECRET configured\n');
} catch (err) {
    console.log('⚠️  NEXTAUTH_SECRET may already exist\n');
}

console.log('\n✨ Configuration complete!');
console.log('\n📌 Next Steps:');
console.log('1. Set up Vercel Postgres: https://vercel.com/docs/storage/vercel-postgres');
console.log('2. The DATABASE_URL will be automatically configured by Vercel');
console.log('3. Run migrations: npx prisma migrate deploy');
console.log('4. Trigger a new deployment: vercel --prod\n');
