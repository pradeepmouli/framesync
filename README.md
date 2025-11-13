# FrameSync

iOS app with Expo + React Native frontend and Node.js backend to sync photos from iCloud to Samsung Frame TV. Uses Swift native bridge to access Photos framework and control Frame via `swift-samsung-frame`.

## Packages

- `packages/mobile`: Expo/React Native mobile app
- `packages/server`: Express server providing Frame API
- `shared`: Shared TypeScript types and Zod schemas

## Quick Start

### Prerequisites

- Node 20+
- pnpm (recommended) or npm
- iOS development environment (Xcode, CocoaPods)
- Samsung Frame TV on local network

### Installation

```bash
# Install dependencies (pnpm recommended)
pnpm install

# Or with npm
npm install

# Install iOS pods
cd packages/mobile/ios && pod install && cd -
```

### Running

```bash
# Terminal 1: Start server
cd packages/server
pnpm run dev  # or: npm run dev

# Terminal 2: Start Expo app
cd packages/mobile
pnpm start    # or: npm start
```

### Environment

Create `.env` in `packages/mobile/`:

```
EXPO_PUBLIC_API_URL=http://localhost:3000
```

## Architecture

- **Mobile App**: Upload photos, list/delete Frame media, trigger album sync
- **Server**: REST API for Frame operations (routes delegate to services, services call native bridge)
- **Native Bridge**: Swift module (`FrameModule.swift`) accessing Photos framework and `swift-samsung-frame` for TV control

See `specs/001-icloud-frame-sync/` for detailed specification and tasks.
