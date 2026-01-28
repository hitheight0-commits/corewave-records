# 🚀 CoreWave Records - Production Deployment Guide

## Critical Issue Identified

Your authentication is failing on Vercel because:

1. **Environment variables aren't configured** - Vercel doesn't read `.env` files
2. **SQLite doesn't work in serverless** - Need PostgreSQL for production
3. **NEXTAUTH_URL pointing to localhost** - Must be your production URL

## ✅ Solution Implemented

I've migrated your application to PostgreSQL and prepared everything for production deployment.

---

## 📋 Step-by-Step Deployment

### 1. **Set Up Vercel Postgres Database**

```bash
# Login to Vercel dashboard
https://vercel.com/dashboard

# Navigate to your project → Storage → Create Database → Postgres
# This automatically sets DATABASE_URL and POSTGRES_URL_NON_POOLING
```

> **DIRECT_URL Note**: Vercel automatically provides both pooled (`DATABASE_URL`) and direct (`POSTGRES_URL_NON_POOLING`) connections. You'll map the direct one in environment variables.

---

### 2. **Configure Environment Variables in Vercel**

Go to: **Project Settings → Environment Variables**

Add these for **Production, Preview, and Development**:

| Variable | Value | Notes |
|----------|-------|-------|
| `NEXTAUTH_URL` | `https://corewave-records.vercel.app` | Your production URL |
| `NEXTAUTH_SECRET` | Generate with `openssl rand -base64 32` | Keep this secure! |
| `DIRECT_URL` | Same as `POSTGRES_URL_NON_POOLING` | For migrations |

**Important**: Don't manually add `DATABASE_URL` - Vercel Postgres sets this automatically.

---

### 3. **Run Database Migration**

After environment variables are set:

```bash
# Install Vercel CLI if needed
npm i -g vercel

# Login and link project
vercel login
vercel link

# Pull environment variables locally (optional, for testing)
vercel env pull .env.local

# Deploy to production (this triggers migration via postinstall)
vercel --prod
```

**Alternative**: Manually run migration after deployment:
```bash
# SSH into Vercel project or use local connection with production DATABASE_URL
npx prisma migrate deploy
```

---

### 4. **Seed Initial Admin User (Optional)**

After migration, create an admin account:

```bash
# Update seed-admin.js with your admin credentials
node seed-admin.js
```

Or create via signup and manually promote in database.

---

## 🔧 What Was Changed

### Database Schema
- ✅ Migrated from SQLite to PostgreSQL
- ✅ Added connection pooling support (`directUrl`)
- ✅ Created initial migration in `prisma/migrations/0_init/`

### Build Configuration
- ✅ Added `prisma generate` to build process
- ✅ Added `postinstall` hook for automatic client generation
- ✅ Added database management scripts

### Environment Setup
- ✅ Created `.env.production` template
- ✅ Created `scripts/setup-vercel-env.js` automation script
- ✅ Updated migration lock to PostgreSQL

---

## 🧪 Verification Checklist

After deployment:

- [ ] Visit `https://corewave-records.vercel.app`
- [ ] Test signup flow
- [ ] Test login flow  
- [ ] Verify profile data persists
- [ ] Check Vercel function logs for errors
- [ ] Test track upload (if using file storage)

---

## 🔍 Troubleshooting

### "Database connection failed"
- Verify `DATABASE_URL` is set in Vercel dashboard (auto-set by Vercel Postgres)
- Check `DIRECT_URL` matches `POSTGRES_URL_NON_POOLING`

### "NEXTAUTH_URL is not defined"
- Add `NEXTAUTH_URL` environment variable
- Trigger new deployment after adding

### "Configuration error"
- Ensure `NEXTAUTH_SECRET` is set
- Must be at least 32 characters

### Migration fails
```bash
# Reset migration and push schema directly
npx prisma db push --accept-data-loss
```

---

## 🎯 Quick Commands Reference

```bash
# Generate Prisma Client
npm run postinstall

# Run migration in production
npm run db:migrate

# Push schema changes (development/prototype)
npm run db:push

# Open Prisma Studio
npm run studio

# Deploy to production
vercel --prod
```

---

## 🔐 Security Notes

1. **Never commit `.env` files** - Already in `.gitignore`
2. **Generate new NEXTAUTH_SECRET for production**
3. **Use strong passwords for admin accounts**
4. **Enable 2FA on Vercel account**
5. **Rotate secrets periodically**

---

## 📚 Additional Resources

- [Vercel Postgres Documentation](https://vercel.com/docs/storage/vercel-postgres)
- [Prisma Deploy Documentation](https://pris.ly/d/migrate-deploy)
- [NextAuth.js Environment Variables](https://next-auth.js.org/configuration/options#environment-variables)

---

**Ready to deploy!** 🚀

Follow the steps above and your authentication will work perfectly in production.
