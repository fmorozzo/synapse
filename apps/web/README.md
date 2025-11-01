# Synapse Web App

This is the **Next.js web application** for Synapse, designed for desktop use.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI Library**: shadcn/ui
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Database**: Supabase
- **API Integration**: Discogs, OpenAI

## Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## Project Structure

```
apps/web/
├── app/
│   ├── (dashboard)/          # Dashboard routes (protected)
│   │   ├── dashboard/
│   │   │   ├── page.tsx      # Dashboard home
│   │   │   ├── collection/   # Collection management
│   │   │   ├── search/       # Discogs search
│   │   │   ├── insights/     # AI insights
│   │   │   └── analytics/    # Statistics
│   │   └── layout.tsx        # Dashboard layout
│   ├── api/                  # API routes
│   │   ├── discogs/          # Discogs proxy
│   │   ├── records/          # Records CRUD
│   │   └── ai/               # AI endpoints
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Landing page
├── components/
│   ├── ui/                   # shadcn/ui components
│   └── layouts/              # Layout components
├── lib/
│   ├── supabase/             # Supabase clients
│   ├── discogs/              # Discogs client
│   └── utils.ts              # Utilities
└── package.json
```

## Environment Variables

Create a `.env.local` file:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Discogs
DISCOGS_API_KEY=
DISCOGS_API_SECRET=

# OpenAI
OPENAI_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Adding shadcn/ui Components

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
# etc...
```

## Deployment

Deploy to Vercel:

```bash
vercel
```

Or connect your repository to Vercel for automatic deployments.

