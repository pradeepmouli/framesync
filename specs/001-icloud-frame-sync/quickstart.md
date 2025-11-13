# Quickstart: iCloud → Frame Sync

This guide walks through running the FrameSync app to upload photos from iCloud to Samsung Frame TV.

## Prerequisites

- iOS device with iCloud Photos enabled
- Samsung Frame TV on same local network
- Node 20+ installed
- Xcode and CocoaPods installed

## Setup

### 1. Clone and Install

```bash
git clone <repo-url>
cd framesync
npm install
cd packages/mobile/ios && pod install && cd -
```

### 2. Configure Environment

Create `packages/mobile/.env`:

```
EXPO_PUBLIC_API_URL=http://localhost:3000
```

### 3. Start Services

**Terminal 1 - Server:**

```bash
cd packages/server
npm run dev
```

Server runs on `http://localhost:3000`

**Terminal 2 - Mobile App:**

```bash
cd packages/mobile
npm start
```

Press `i` to launch iOS simulator or scan QR with Expo Go.

## Usage

### Pair Frame (Required First Time)

1. Navigate to Pairing screen
2. Tap "Discover Frames"
3. Select your Samsung Frame from detected devices
4. Confirm pairing

### Upload Photo

1. Navigate to Upload screen
2. Tap "Select Photo" to open image picker
3. Choose photo from library
4. Tap "Upload to Frame"
5. View confirmation or error alert

### List/Delete Media

1. Navigate to Media List screen
2. View all Frame media
3. Tap items to select
4. Tap "Delete Selected" to remove from Frame

### Sync Album

1. Navigate to Album Sync screen
2. Enter iCloud album ID
3. Tap "Sync Now"
4. View job summary (added/skipped/failed counts)

### Manage Settings

1. Navigate to Settings screen
2. View paired Frame status
3. Manage Photo Library permissions
4. Unpair Frame if needed

## Architecture

- **Mobile App**: React Native UI with Expo
- **Server**: Express REST API at `/frame/media` and `/sync/jobs`
- **Native Bridge**: `FrameModule.swift` integrating `swift-samsung-frame` (branch: `001-samsung-tv-client`) TVClient
- **Shared Schemas**: Zod validation for all requests/responses

## Permissions Required

Configure in `ios/framesync/Info.plist`:

- `NSPhotoLibraryUsageDescription`: Access iCloud Photos
- `NSLocalNetworkUsageDescription`: Discover Frame on LAN

## API Contracts

See `specs/001-icloud-frame-sync/contracts/openapi.yaml`:

- `GET /frame/media` - List Frame media
- `POST /frame/media/upload` - Upload photo
- `DELETE /frame/media/{mediaId}` - Delete media
- `POST /sync/jobs` - Trigger album sync
- `GET /sync/jobs/{jobId}` - Get sync status

## Next Steps

1. Complete Frame pairing UI (T006a, T006b)
2. Integrate image picker in UploadScreen
3. Implement Settings/Permissions management (T034, T035)
4. Test on physical device with real Frame TV
