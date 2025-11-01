# Synapse Setup Guide

This guide will help you set up the Synapse project from scratch.

## Prerequisites

Before you begin, make sure you have:

- **Node.js** 18 or higher
- **pnpm** 8 or higher (`npm install -g pnpm`)
- A **Supabase** account (free tier is fine)
- A **Discogs** developer account for API credentials
- An **OpenAI** API key (optional, for AI features)
- **Expo Go** app on your iOS device (for mobile development)

## Step 1: Install Dependencies

```bash
cd synapse
pnpm install
```

This will install all dependencies for the monorepo.

## Step 2: Set Up Supabase

### 2.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the project to be provisioned

### 2.2 Run the Database Migration

1. In your Supabase project, go to the SQL Editor
2. Open `packages/supabase/src/migrations/001_initial_schema.sql`
3. Copy the entire SQL content
4. Paste it into the Supabase SQL Editor
5. Run the query

This creates the necessary tables and policies.

### 2.3 Get Your Credentials

In your Supabase project settings:

1. Go to **Settings > API**
2. Copy your **Project URL**
3. Copy your **anon/public key**
4. Copy your **service_role key** (keep this secret!)

## Step 3: Get Discogs API Credentials

1. Go to [discogs.com/settings/developers](https://www.discogs.com/settings/developers)
2. Create a new application
3. Note down your **Consumer Key** and **Consumer Secret**

## Step 4: Get OpenAI API Key (Optional)

1. Go to [platform.openai.com](https://platform.openai.com)
2. Create an API key
3. Add credits to your account

## Step 5: Configure Environment Variables

### Web App

Create `apps/web/.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Discogs
DISCOGS_API_KEY=your_consumer_key
DISCOGS_API_SECRET=your_consumer_secret

# OpenAI (optional)
OPENAI_API_KEY=sk-your_openai_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Mobile App

Create `apps/mobile/.env`:

```bash
EXPO_PUBLIC_API_URL=http://localhost:3000/api
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

**Note**: For mobile development, use your computer's local IP instead of localhost:
```bash
EXPO_PUBLIC_API_URL=http://192.168.1.X:3000/api
```

## Step 6: Start Development

### Web App

```bash
pnpm dev:web
```

Visit http://localhost:3000

### Mobile App

In a separate terminal:

```bash
pnpm dev:mobile
```

Scan the QR code with Expo Go on your iOS device.

## Step 7: Test the Integration

1. **Test Discogs Search**:
   - Go to Dashboard > Search
   - Search for an album
   - Verify results appear

2. **Test Database**:
   - Add a record to your collection
   - Check Supabase to see if it was saved

3. **Test AI Features** (if configured):
   - Try the AI album analysis
   - Request recommendations

## Troubleshooting

### "Cannot connect to Supabase"

- Verify your Supabase URL and keys are correct
- Check that your Supabase project is running
- Ensure the database migration was run successfully

### "Discogs API error"

- Verify your Discogs API credentials
- Check that your application is approved in Discogs settings
- Ensure you haven't hit rate limits

### Mobile app can't connect to API

- Use your computer's local IP instead of localhost
- Ensure both devices are on the same network
- Check firewall settings

### TypeScript errors

```bash
# Clean and reinstall
pnpm clean
pnpm install
```

### Missing dependencies

```bash
# Reinstall specific package
pnpm --filter web install
pnpm --filter mobile install
```

## Next Steps

Once everything is set up:

1. ✅ Explore the web dashboard
2. ✅ Try searching for music on Discogs
3. ✅ Add records to your collection
4. ✅ Test the mobile app
5. ✅ Configure AI features
6. ✅ Start customizing the app!

## Support

If you encounter issues:

1. Check this guide again
2. Review error messages carefully
3. Check the main README.md for more details
4. Look at example `.env.example` files

Happy coding! 🎵

