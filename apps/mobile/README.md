# Synapse Mobile App

This is the **React Native mobile application** for Synapse, designed for iOS devices.

## Tech Stack

- **Framework**: React Native + Expo
- **Router**: Expo Router
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Language**: TypeScript
- **Database**: Supabase
- **API**: Connects to Next.js backend

## Development

```bash
# Install dependencies
pnpm install

# Start Expo development server
pnpm start

# Start on iOS simulator
pnpm ios

# Start on Android emulator (future)
pnpm android
```

## Project Structure

```
apps/mobile/
├── app/
│   ├── (tabs)/               # Tab navigation screens
│   │   ├── index.tsx         # Home screen
│   │   ├── scan.tsx          # Barcode scanner
│   │   ├── collection.tsx    # Collection view
│   │   └── profile.tsx       # User profile
│   ├── _layout.tsx           # Root layout
│   └── +not-found.tsx        # 404 screen
├── components/               # React Native components
├── lib/
│   └── supabase.ts          # Supabase client
├── assets/                   # Images, fonts, etc.
├── app.json                  # Expo configuration
└── package.json
```

## Environment Variables

Create a `.env` file:

```bash
EXPO_PUBLIC_API_URL=http://localhost:3000/api
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

## Running on Device

1. Install Expo Go on your iOS device
2. Start the development server: `pnpm start`
3. Scan the QR code with your device

## Building for Production

### iOS

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Build for iOS
eas build --platform ios

# Submit to App Store
eas submit --platform ios
```

## Features

- 🏠 **Home Screen** - Quick overview of your collection
- 📸 **Barcode Scanner** - Quickly add records (coming soon)
- 📚 **Collection View** - Browse your records
- 👤 **Profile** - Manage settings and preferences

## Deployment

Deployments are handled through Expo EAS. Configure in `eas.json` and use EAS CLI for builds and submissions.

