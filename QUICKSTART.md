# 🚀 QUICK START - Fix Production Auth

## The Problem
Your site shows "Server error" during login/signup because:
- Environment variables not set in Vercel
- SQLite database won't work in serverless environment

## The Fix (3 Steps)

### Step 1: Set Up Database (2 minutes)
1. Go to https://vercel.com/dashboard
2. Click your project → **Storage** tab → **Create Database**
3. Select **Postgres** → Click **Create**
4. Done! `DATABASE_URL` is auto-configured

### Step 2: Add Environment Variables (1 minute)
1. Stay in Vercel dashboard
2. Go to **Settings** → **Environment Variables**
3. Add these **for all environments**:

```
NEXTAUTH_URL = https://corewave-records.vercel.app
NEXTAUTH_SECRET = [generate with: openssl rand -base64 32]
DIRECT_URL = [copy from POSTGRES_URL_NON_POOLING in Storage tab]
```

### Step 3: Deploy (30 seconds)
```bash
git add .
git commit -m "fix: production database setup"
git push
```

**OR** click "Redeploy" in Vercel dashboard

---

## ✅ Verification

After deployment (1-2 minutes):
1. Visit: https://corewave-records.vercel.app
2. Try signing up
3. Try logging in
4. ✨ Authentication works!

---

## 📖 Need More Details?

See [DEPLOYMENT.md](file:///C:/Users/x%20four/.gemini/antigravity/scratch/corewave-app/DEPLOYMENT.md) for comprehensive guide.

---

**Everything is ready to go - just follow these 3 steps!** 🎯
