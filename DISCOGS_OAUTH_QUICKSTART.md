# Discogs OAuth - Quick Start 🚀

> **TL;DR:** Get your Discogs OAuth running in 5 minutes!

## Prerequisites
- Discogs account ([create one](https://www.discogs.com/users/create))
- Development server running

## Quick Setup Steps

### 1. Register Your App on Discogs (2 minutes)

Go to: **https://www.discogs.com/settings/developers**

Create application with:
- **Name:** `Synapse - Music Collection Manager`
- **Callback URL:** `http://localhost:3000/api/discogs/oauth/callback`

**Save your credentials:**
- ✅ Consumer Key
- ✅ Consumer Secret

### 2. Add Environment Variables (1 minute)

Edit `apps/web/.env.local`:

```bash
# Add these lines:
DISCOGS_CONSUMER_KEY=paste_your_consumer_key_here
DISCOGS_CONSUMER_SECRET=paste_your_consumer_secret_here

# Make sure this exists:
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run Database Migration (1 minute)

Open Supabase SQL Editor and run:

```sql
-- Migration 002_add_discogs_token.sql
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS discogs_username TEXT,
ADD COLUMN IF NOT EXISTS discogs_token TEXT,
ADD COLUMN IF NOT EXISTS discogs_connected BOOLEAN DEFAULT false;

-- Migration 003_add_discogs_token_secret.sql
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS discogs_token_secret TEXT;

CREATE INDEX IF NOT EXISTS idx_profiles_discogs_connected 
ON profiles(discogs_connected) 
WHERE discogs_connected = true;
```

### 4. Restart Development Server (30 seconds)

```bash
# Stop the server (Ctrl+C)
# Start it again:
pnpm dev:web
```

### 5. Test OAuth Flow (1 minute)

1. Go to: **http://localhost:3000/dashboard/settings**
2. Click **"Discogs Integration"** tab
3. Click **"Connect with Discogs"** button
4. Authorize on Discogs
5. ✅ **Success!** You'll be redirected back

## ✅ Verification

You should see:
- ✅ "Successfully Connected!" message
- ✅ Your Discogs username displayed
- ✅ "Connected" status badge

## 🚨 Troubleshooting

### Error: "OAuth credentials not configured"
→ Check `.env.local` has correct `DISCOGS_CONSUMER_KEY` and `DISCOGS_CONSUMER_SECRET`
→ Restart dev server after adding env variables

### Error: "Invalid callback URL"
→ In Discogs settings, verify callback URL is exactly: `http://localhost:3000/api/discogs/oauth/callback`

### Not redirected back after authorization
→ Clear browser cookies
→ Try in incognito mode
→ Check browser console for errors

## Production Setup

When deploying to Vercel:

1. **Create production Discogs app** with callback: `https://yourapp.vercel.app/api/discogs/oauth/callback`
2. **Add env variables** in Vercel:
   - `DISCOGS_CONSUMER_KEY`
   - `DISCOGS_CONSUMER_SECRET`
   - `NEXT_PUBLIC_APP_URL=https://yourapp.vercel.app`

## 📚 Full Documentation

For detailed information, see **[DISCOGS_OAUTH_SETUP.md](./DISCOGS_OAUTH_SETUP.md)**

## 🎯 What's Next?

After OAuth is working:
- Build collection import feature
- Sync Discogs wantlist
- Add AI-powered recommendations

---

**Need Help?** Open an issue or check the full setup guide!

