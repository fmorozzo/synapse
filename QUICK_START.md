# Quick Start Guide 🚀

Get Synapse up and running in 5 minutes!

## 1. Install Dependencies

```bash
pnpm install
```

## 2. Set Up Environment Variables

### Web App (`apps/web/.env.local`)

```bash
cp apps/web/.env.example apps/web/.env.local
```

Edit the file and add your credentials.

### Mobile App (`apps/mobile/.env`)

```bash
cp apps/mobile/.env.example apps/mobile/.env
```

Edit the file and add your credentials.

## 3. Set Up Database

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Copy SQL from `packages/supabase/src/migrations/001_initial_schema.sql`
3. Run it in Supabase SQL Editor

## 4. Start Development

### Web (Terminal 1)
```bash
pnpm dev:web
```
Open http://localhost:3000

### Mobile (Terminal 2)
```bash
pnpm dev:mobile
```
Scan QR with Expo Go app

## That's It! 🎉

You now have:
- ✅ Web app running on localhost:3000
- ✅ Mobile app running on your phone
- ✅ Supabase database connected
- ✅ Ready to add music to your collection!

## Next Steps

1. Search for music in the Discogs database
2. Add records to your collection
3. Get AI-powered recommendations
4. Explore the analytics

## Need Help?

See the full [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed instructions.

