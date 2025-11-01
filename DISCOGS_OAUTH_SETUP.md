# Discogs OAuth Setup Guide

This guide explains how to set up Discogs OAuth authentication for your Synapse application.

## Overview

Synapse uses **OAuth 1.0a** to connect with Discogs, providing a secure way for users to link their Discogs accounts without sharing their passwords. The flow is:

1. User clicks "Connect with Discogs" in Settings
2. User is redirected to Discogs to authorize the app
3. Discogs redirects back to Synapse with an authorization code
4. Synapse exchanges the code for access tokens
5. Tokens are stored securely in the database

## Prerequisites

- A Discogs account (create one at [discogs.com/users/create](https://www.discogs.com/users/create))
- Access to Discogs Developer Settings

## Step 1: Register Your Application on Discogs

1. **Go to Discogs Developer Settings:**
   - Visit: https://www.discogs.com/settings/developers
   - Log in to your Discogs account if needed

2. **Create a new application:**
   - Click on **"Create an Application"** or **"Developer Settings"**
   - Fill in the application details:

### Application Details

| Field | Value | Example |
|-------|-------|---------|
| **Application Name** | Your app name | `Synapse - Music Collection Manager` |
| **Application Description** | Brief description | `Connect your Discogs collection to Synapse for AI-powered insights and offline browsing` |
| **Application URL** | Your app homepage | `http://localhost:3000` (development) or `https://yourapp.vercel.app` (production) |
| **Callback URL** | OAuth redirect endpoint | `http://localhost:3000/api/discogs/oauth/callback` (development) or `https://yourapp.vercel.app/api/discogs/oauth/callback` (production) |

> **Important:** The Callback URL must exactly match your application's OAuth callback route.

3. **Save the application**

4. **Get your credentials:**
   - After creating the app, you'll see:
     - **Consumer Key** (also called API Key)
     - **Consumer Secret**
   - Copy both values - you'll need them in the next step

## Step 2: Configure Environment Variables

Add the following to your `.env.local` file (web app):

```bash
# Discogs OAuth Configuration
DISCOGS_CONSUMER_KEY=your_consumer_key_here
DISCOGS_CONSUMER_SECRET=your_consumer_secret_here

# Your app URL (used for OAuth callbacks)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### For Production (Vercel)

In your Vercel project settings, add these environment variables:

```bash
DISCOGS_CONSUMER_KEY=your_consumer_key_here
DISCOGS_CONSUMER_SECRET=your_consumer_secret_here
NEXT_PUBLIC_APP_URL=https://yourapp.vercel.app
```

> **Security Note:** Never commit `.env.local` to version control. These credentials should remain secret.

## Step 3: Run Database Migration

The OAuth flow stores additional data in the database. Run the migration:

```bash
# From the project root
cd packages/supabase
# Run the migration SQL in your Supabase SQL Editor:
# - 002_add_discogs_token.sql
# - 003_add_discogs_token_secret.sql
```

Or use the Supabase CLI:

```bash
npx supabase migration up
```

## Step 4: Test the OAuth Flow

1. **Start your development server:**
   ```bash
   pnpm dev:web
   ```

2. **Sign in to your Synapse account**

3. **Go to Settings:**
   - Navigate to `/dashboard/settings`
   - Click on the "Discogs Integration" tab

4. **Connect your account:**
   - Click "Connect with Discogs"
   - You'll be redirected to Discogs
   - Authorize the application
   - You'll be redirected back to Synapse

5. **Verify the connection:**
   - You should see a success message
   - Your Discogs username should be displayed
   - The status should show "Connected"

## Troubleshooting

### Error: "OAuth credentials not configured"

**Solution:** Make sure you've set `DISCOGS_CONSUMER_KEY` and `DISCOGS_CONSUMER_SECRET` in your `.env.local` file and restarted the development server.

### Error: "Failed to get request token"

**Solutions:**
- Verify your Consumer Key and Secret are correct
- Check that your Callback URL in Discogs settings matches your app URL exactly
- Ensure your app URL is accessible (for production)

### Error: "OAuth token secret not found"

**Solution:** This usually means cookies aren't working. Check:
- You're using HTTPS in production (required for secure cookies)
- Your browser isn't blocking cookies
- The OAuth flow completed within 10 minutes (tokens expire)

### Error: "Invalid callback URL"

**Solution:** 
- In Discogs developer settings, update the Callback URL to match exactly: `http://localhost:3000/api/discogs/oauth/callback` (dev) or `https://yourapp.vercel.app/api/discogs/oauth/callback` (prod)
- Make sure there's no trailing slash
- Restart your dev server after changing environment variables

### User is not redirected back after authorization

**Solutions:**
- Check your Callback URL in Discogs settings
- Verify `NEXT_PUBLIC_APP_URL` is set correctly
- Check browser console for errors
- Try clearing cookies and starting the flow again

## Development vs Production

### Development Setup
```bash
# .env.local
DISCOGS_CONSUMER_KEY=dev_consumer_key
DISCOGS_CONSUMER_SECRET=dev_consumer_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Discogs Callback URL: `http://localhost:3000/api/discogs/oauth/callback`

### Production Setup
```bash
# Vercel Environment Variables
DISCOGS_CONSUMER_KEY=prod_consumer_key
DISCOGS_CONSUMER_SECRET=prod_consumer_secret
NEXT_PUBLIC_APP_URL=https://yourapp.vercel.app
```

Discogs Callback URL: `https://yourapp.vercel.app/api/discogs/oauth/callback`

> **Tip:** You can create separate Discogs applications for development and production with different callback URLs.

## Security Best Practices

1. **Never expose your Consumer Secret** - Keep it in environment variables only
2. **Use HTTPS in production** - Required for secure OAuth flow
3. **Validate callback URLs** - Discogs will only redirect to registered URLs
4. **Store tokens securely** - OAuth tokens are encrypted in the database
5. **Implement token refresh** - Consider adding token refresh logic if needed

## API Endpoints

The OAuth flow uses these API routes:

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/discogs/oauth/initiate` | GET | Starts OAuth flow, redirects to Discogs |
| `/api/discogs/oauth/callback` | GET | Handles Discogs callback, exchanges tokens |
| `/api/discogs/oauth/disconnect` | POST | Removes Discogs connection |

## Database Schema

The OAuth flow stores data in the `profiles` table:

```sql
discogs_username      TEXT       -- Discogs username
discogs_token         TEXT       -- OAuth access token
discogs_token_secret  TEXT       -- OAuth token secret (OAuth 1.0a)
discogs_connected     BOOLEAN    -- Connection status
```

## Next Steps

Once OAuth is set up:

1. **Import Collections:** Build the collection import feature
2. **Sync Wantlist:** Fetch and sync user wantlists
3. **API Integration:** Use the stored tokens to make authenticated Discogs API calls
4. **Token Refresh:** Implement token refresh if needed (OAuth 1.0a tokens typically don't expire)

## Resources

- [Discogs OAuth Documentation](https://www.discogs.com/developers/#page:authentication)
- [OAuth 1.0a Specification](https://oauth.net/core/1.0a/)
- [Discogs API Documentation](https://www.discogs.com/developers/)

## Support

If you encounter issues not covered here:
1. Check the browser console for errors
2. Review server logs for API errors
3. Verify all environment variables are set correctly
4. Test the OAuth flow with a fresh browser session (incognito mode)

