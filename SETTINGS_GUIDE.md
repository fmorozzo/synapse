# Settings & Discogs Integration Guide 🎛️

Complete guide to using the Settings page and connecting your Discogs account.

---

## 🎯 What's New

You now have a **Settings page** where you can:
- ✅ Update your profile information
- ✅ **Connect your Discogs account**
- ✅ Store your Discogs credentials securely
- ✅ Prepare to import your Discogs collection

---

## 📋 Step 1: Update Database

First, add the new `discogs_token` column to your database:

### In Supabase:
1. Go to your Supabase project
2. Open **SQL Editor**
3. Copy the SQL from: `packages/supabase/src/migrations/002_add_discogs_token.sql`
4. Run it

**The migration adds:**
- `discogs_token` column to store your token
- Index for faster queries
- Helpful comments

---

## 🎯 Step 2: Access Settings

1. Visit your app: http://localhost:3000/dashboard
2. Click **"Settings"** in the navigation menu
3. You'll see two tabs:
   - **Profile** - Update your name and email
   - **Discogs Integration** - Connect your Discogs account

---

## 🔐 Step 3: Get Your Discogs Credentials

### Option A: Personal Access Token (Recommended)

1. **Go to Discogs Developer Settings:**
   https://www.discogs.com/settings/developers

2. **Generate a Token:**
   - Scroll to "Personal Access Tokens"
   - Click "Generate new token"
   - Give it a name: "Synapse App"
   - Copy the token

3. **Get Your Username:**
   - Your Discogs username is in your profile URL
   - Example: `discogs.com/user/YOUR_USERNAME`

### What You'll Need:
- ✅ Your Discogs username
- ✅ Your Personal Access Token

---

## 🎯 Step 4: Connect Discogs Account

1. In Settings, click the **"Discogs Integration"** tab
2. Fill in:
   - **Discogs Username**: Your username
   - **Personal Access Token**: The token you just generated
3. Click **"Connect Discogs"**
4. You'll see a success message! ✅

---

## ✨ What This Enables

Once connected, you can:

### 1. **Import Your Collection** (Coming Soon)
- Fetch all your Discogs collection
- Import records automatically
- Keep metadata synced

### 2. **Search Your Collection**
- Search releases in your Discogs library
- Add them to your Synapse collection
- Get AI insights on your collection

### 3. **Sync Want List** (Future)
- Import your Discogs wantlist
- Track records you want to buy
- Get alerts for new releases

### 4. **Enhanced Data**
- Use Discogs as the source of truth
- Get complete album information
- Access hi-res album artwork

---

## 🔒 Security

Your Discogs token is:
- ✅ **Stored securely** in your Supabase database
- ✅ **Never exposed** to the frontend
- ✅ **Only used server-side** for API calls
- ✅ **Encrypted at rest** by Supabase

### Best Practices:
- Don't share your token with anyone
- Regenerate it if compromised
- You can revoke it anytime on Discogs

---

## 🐛 Troubleshooting

### "Failed to save Discogs settings"
- Check that your username is correct
- Make sure you copied the entire token
- Verify the token hasn't expired

### "Not seeing my collection"
- Import feature is coming in the next update
- For now, the connection just stores your credentials
- You'll be able to import soon!

### Token expired
- Go to Discogs → Settings → Developers
- Generate a new token
- Update it in Settings

---

## 🚀 Next Steps

### What's Coming Next:

1. **Import Collection Button**
   - One-click import of your entire Discogs collection
   - Progress bar showing import status
   - Automatic metadata enrichment

2. **Sync Features**
   - Keep collection synced with Discogs
   - Two-way sync (Synapse ↔ Discogs)
   - Conflict resolution

3. **Advanced Features**
   - Fetch marketplace prices
   - Track collection value over time
   - Import want list and selling list

---

## 📊 Current Features Available

### Profile Tab:
- ✅ Update your full name
- ✅ View your email (read-only)
- ✅ Save changes

### Discogs Integration Tab:
- ✅ Add Discogs username
- ✅ Add Personal Access Token
- ✅ See connection status
- ✅ Update credentials anytime

---

## 💡 Using the API

The settings are accessible via API:

### Get Profile:
```bash
GET /api/profile
```

### Update Profile:
```bash
PATCH /api/profile
Content-Type: application/json

{
  "full_name": "John Doe",
  "discogs_username": "johndoe",
  "discogs_token": "your_token_here"
}
```

---

## 📝 Database Schema

The `profiles` table now includes:

```sql
- id (uuid)
- email (text)
- full_name (text)
- discogs_username (text)      ← NEW!
- discogs_token (text)          ← NEW!
- discogs_connected (boolean)
- preferences (jsonb)
- created_at (timestamp)
- updated_at (timestamp)
```

---

## 🎨 Customizing Settings

Want to add more settings? Easy!

### Add a New Tab:
1. Edit `apps/web/app/(dashboard)/dashboard/settings/page.tsx`
2. Add a new `<TabsTrigger>` and `<TabsContent>`
3. Create your form

### Add More Fields:
1. Update the database schema (new migration)
2. Update `packages/supabase/src/types.ts`
3. Add fields to the settings form
4. Update the API route

---

## 🔗 Related Files

- **Settings Page**: `apps/web/app/(dashboard)/dashboard/settings/page.tsx`
- **API Route**: `apps/web/app/api/profile/route.ts`
- **Database Migration**: `packages/supabase/src/migrations/002_add_discogs_token.sql`
- **Types**: `packages/supabase/src/types.ts`

---

## 🎉 You're All Set!

Your Discogs account is now connected! The next feature will allow you to import your entire collection with one click.

**Questions or ideas?** Let me know what you'd like to build next!

---

Built with ❤️ for music collectors

