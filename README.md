# Synapse 🎵

**Your intelligent music collection manager with Discogs integration and AI insights.**

Synapse is a modern, multi-platform application for managing your music collection. It combines the power of the Discogs database with AI-powered insights to help you organize, discover, and appreciate your music collection like never before.

## ✨ Features

- 🎵 **Discogs Integration** - Access millions of releases from the world's largest music database
- 📱 **Multi-Platform** - Web app (desktop) and native iOS mobile app
- 🤖 **AI-Powered Insights** - Get personalized recommendations and collection analysis
- 📊 **Analytics** - Track your collection's value, genres, and trends
- 🔍 **Smart Search** - Find releases quickly with advanced search capabilities
- 📸 **Barcode Scanning** (Mobile) - Add records instantly by scanning barcodes
- 💾 **Cloud Sync** - Your collection syncs seamlessly across all devices

## 🏗️ Architecture

This is a **monorepo** containing:

```
synapse/
├── apps/
│   ├── web/          # Next.js web application (desktop)
│   └── mobile/       # React Native + Expo mobile app (iOS)
├── packages/
│   ├── shared/       # Shared types, utilities, and constants
│   ├── supabase/     # Database client and queries
│   └── ai/           # AI integration (OpenAI)
```

### Tech Stack

#### Web (Desktop)
- **Framework**: Next.js 14 (App Router)
- **UI**: shadcn/ui + Tailwind CSS
- **Language**: TypeScript

#### Mobile (iOS)
- **Framework**: React Native + Expo
- **UI**: NativeWind (Tailwind for React Native)
- **Language**: TypeScript

#### Backend
- **API**: Next.js API Routes (serverless)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Hosting**: Vercel (web) + Expo EAS (mobile)

#### Integrations
- **Music Data**: Discogs API
- **AI**: OpenAI GPT-4

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and pnpm 8+
- Supabase account (free tier available)
- Discogs API credentials
- OpenAI API key (optional, for AI features)

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd synapse
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Set up environment variables**

Create `.env.local` files in the apps:

**Web app** (`apps/web/.env.local`):
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Discogs
DISCOGS_API_KEY=your_discogs_api_key
DISCOGS_API_SECRET=your_discogs_api_secret

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Mobile app** (`apps/mobile/.env`):
```bash
EXPO_PUBLIC_API_URL=http://localhost:3000/api
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Set up the database**

Run the SQL migration in your Supabase project:
```bash
# Copy the SQL from packages/supabase/src/migrations/001_initial_schema.sql
# and run it in your Supabase SQL editor
```

5. **Start development servers**

**Web app**:
```bash
pnpm dev:web
```
Visit http://localhost:3000

**Mobile app**:
```bash
pnpm dev:mobile
```
Scan the QR code with Expo Go app on your iOS device

## 📖 Documentation

### Project Structure

- **`apps/web`** - Next.js web application
  - `app/` - Next.js App Router pages and API routes
  - `components/` - React components (including shadcn/ui)
  - `lib/` - Utility functions and clients

- **`apps/mobile`** - React Native mobile app
  - `app/` - Expo Router screens
  - `components/` - React Native components
  - `lib/` - Utility functions

- **`packages/shared`** - Shared code
  - `types/` - TypeScript type definitions
  - `utils/` - Utility functions
  - `constants/` - App constants

- **`packages/supabase`** - Database layer
  - `client.ts` - Supabase client factory
  - `queries/` - Database query functions
  - `migrations/` - SQL migration files

- **`packages/ai`** - AI integration
  - `openai.ts` - OpenAI client and functions
  - `prompts/` - AI prompt templates

### API Routes

The web app provides these API endpoints:

- **Discogs**
  - `GET /api/discogs/search` - Search for releases
  - `GET /api/discogs/release/[id]` - Get release details

- **Records**
  - `GET /api/records` - Get user's records
  - `POST /api/records` - Create a new record
  - `GET /api/records/[id]` - Get a specific record
  - `PATCH /api/records/[id]` - Update a record
  - `DELETE /api/records/[id]` - Delete a record

- **AI**
  - `POST /api/ai/analyze` - Analyze an album
  - `POST /api/ai/recommend` - Get personalized recommendations

### Database Schema

The database includes these tables:

- **`profiles`** - User profiles
- **`records`** - User's music collection records

See `packages/supabase/src/migrations/001_initial_schema.sql` for the full schema.

## 🔧 Development

### Available Scripts

```bash
# Install dependencies
pnpm install

# Development
pnpm dev              # Start all apps in parallel
pnpm dev:web          # Start web app only
pnpm dev:mobile       # Start mobile app only

# Build
pnpm build            # Build all apps
pnpm build:web        # Build web app only

# Linting & Type Checking
pnpm lint             # Lint all packages
pnpm type-check       # Type check all packages

# Clean
pnpm clean            # Remove all node_modules and build artifacts
```

### Adding Packages

To add a package to a specific app:
```bash
pnpm --filter web add <package-name>
pnpm --filter mobile add <package-name>
```

### Using Shared Packages

Import from shared packages:
```typescript
import { Record, DiscogsRelease } from '@synapse/shared';
import { getUserRecords, createRecord } from '@synapse/supabase';
import { analyzeAlbum, getRecommendations } from '@synapse/ai';
```

## 🚢 Deployment

### Web App (Vercel)

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy!

### Mobile App (Expo EAS)

1. Install EAS CLI:
```bash
npm install -g eas-cli
```

2. Configure EAS:
```bash
cd apps/mobile
eas build:configure
```

3. Build for iOS:
```bash
eas build --platform ios
```

4. Submit to App Store:
```bash
eas submit --platform ios
```

## 📱 Features Roadmap

### Current Features
- ✅ User authentication
- ✅ Discogs search and integration
- ✅ Collection management (CRUD)
- ✅ AI-powered album analysis
- ✅ Personalized recommendations
- ✅ Collection statistics

### Planned Features
- 🔄 Barcode scanning (mobile)
- 🔄 Image recognition for album covers
- 🔄 Price tracking and collection valuation
- 🔄 Want list and wishlist management
- 🔄 Collection sharing and social features
- 🔄 Advanced filtering and sorting
- 🔄 Export collection data

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is private and proprietary.

## 🙏 Acknowledgments

- [Discogs](https://www.discogs.com/) for their amazing music database
- [Supabase](https://supabase.com/) for the backend infrastructure
- [Vercel](https://vercel.com/) for hosting
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [OpenAI](https://openai.com/) for AI capabilities

## 📧 Support

For questions or support, please open an issue in the repository.

---

Built with ❤️ and 🎵 by Federico

