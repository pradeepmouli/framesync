# FrameSync

Native iOS app built with Expo that manages photos/art on Samsung Frame TV. The app uses `expo-media-library` to access your photo library (including iCloud assets when available) and communicates directly with the Frame TV over WebSockets from React Native.

## Features

- **Single Photo Upload**: Select a photo from your iCloud Photos and send it to your paired Samsung Frame with real-time progress tracking
- **Frame Media Management**: View, browse, and delete photos stored on your Frame TV
- **Album Sync**: Sync entire albums to your Frame with configurable deletion modes
  - Add-only mode: Only add new photos, never delete
  - Mirror mode: Keep Frame in sync with album, including deletions
- **Deduplication**: Automatically skip duplicate photos during sync
- **Connection Management**: Easy pairing flow with your Samsung Frame TV

## Package Structure

- `packages/mobile`: Expo + React Native app for iOS
- `packages/server`: Express API (optional, for future backend features)
- `shared`: Shared TypeScript types and Zod schemas

## Quick start

### Prerequisites

- Node.js 20+
- iOS device or simulator with iOS 15.1+
- Samsung Frame TV on the same network
- iCloud Photos enabled

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the Expo app:
```bash
npm run ios
```

### Usage

1. **Connect to Frame**: Enter your Frame TV's IP address and connect
2. **Pair**: If prompted, enter the PIN shown on your TV
3. **Send Photos**: 
   - Tap "Continue" to browse your photo library
   - Select a photo and tap "Send" to upload to Frame
4. **Manage Frame Media**:
   - Tap "Manage Frame Media" to view photos on your Frame
   - Select photos and delete them as needed
5. **Sync Album**:
   - Tap "Sync Album to Frame" to sync an entire album
   - Select an album and choose deletion mode
   - Tap "Start Sync" to begin

## Architecture

- **Mobile App**: React Native with Expo, using WebSocket to communicate directly with Frame TV
- **Frame Communication**: WebSocket-based protocol on port 8001 (ws) or 8002 (wss)
- **Media Access**: `expo-media-library` for iOS Photos access
- **State Management**: Jotai for app state
- **Type Safety**: TypeScript + Zod schemas for runtime validation

## Development

### Scripts

- `npm run ios`: Start iOS app
- `npm run typecheck`: Run TypeScript type checking
- `npm run lint`: Run oxlint
- `npm run format`: Format code with oxfmt
- `npm test`: Run tests

### Type Checking and Linting

```bash
npm run typecheck
npm run lint
```

## Notes

- Direct TV control is implemented via WebSockets in the app (no Node server required for core functionality)
- Some Samsung models/firmwares behave differently; we focus on P1 flows in the spec
- Photos are automatically converted from HEIC/RAW to JPEG if needed before upload
- Single-Frame MVP: manage one Frame per account

## Future Enhancements

- Automatic background sync scheduling
- Multi-Frame support
- Video and Live Photos support
- Advanced deduplication with content fingerprinting
- Activity log and sync history
