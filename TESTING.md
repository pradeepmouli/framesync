# Testing Guide: FrameSync

## Quick Start Testing

### Prerequisites
- macOS with Xcode installed
- Node 20+ installed
- iOS Simulator or physical iOS device
- (Optional) Samsung Frame TV on same network

### 1. Install Dependencies

```bash
# From repo root
npm install

# Install iOS pods
cd packages/mobile/ios
pod install
cd -
```

### 2. Set Up Environment

Create `packages/mobile/.env`:

```bash
EXPO_PUBLIC_API_URL=http://localhost:3000
```

Create `packages/server/.env` (optional):

```bash
PORT=3000
FRAME_TV_HOST=192.168.1.100  # Your Frame TV IP (optional)
FRAME_TV_PORT=8001
```

### 3. Start the Server

```bash
# Terminal 1
cd packages/server
npm run dev
```

Server should start on `http://localhost:3000`

### 4. Start the Mobile App

```bash
# Terminal 2
cd packages/mobile
npm start
```

Then press `i` for iOS Simulator or scan QR code with Expo Go app.

## Testing Workflows

### Test 1: Frame Pairing (T006a, T006b)

**Goal**: Verify Frame discovery and pairing flow

**Steps**:
1. Open app, navigate to "Pair" screen
2. Tap "Discover Frames"
3. Should see discovered Frame devices (currently returns mock device)
4. Tap on a device to pair
5. Verify success alert and paired device displayed
6. Navigate to Settings screen
7. Verify paired device shows in Settings
8. Tap "Unpair Frame"
9. Confirm unpaired state

**Expected Results**:
- ✅ Discovery shows mock Samsung Frame TV
- ✅ Pairing succeeds with alert
- ✅ Settings shows paired device info
- ✅ Unpair removes device and shows "No Frame paired"

**Mock Data**: Currently uses placeholder discovery. Real discovery requires swift-samsung-frame integration.

---

### Test 2: Photo Upload (T010-T015)

**Goal**: Verify single photo upload flow

**Steps**:
1. Navigate to "Upload" screen
2. Enter a mock asset ID (e.g., "test-asset-001")
3. Tap "Upload to Frame"
4. Check server logs for upload request
5. Verify success/error alert

**Expected Results**:
- ✅ Upload button disabled while uploading
- ✅ Loading indicator shows
- ✅ Server receives POST /frame/media/upload
- ✅ Alert shows upload ID on success

**Note**: Real photo selection requires `expo-image-picker` integration (documented in quickstart.md).

---

### Test 3: Media List & Delete (T016-T022)

**Goal**: Verify Frame media management

**Steps**:
1. Navigate to "Media List" screen
2. Verify media loads (currently empty or mock data)
3. Tap items to select them
4. Tap "Delete Selected"
5. Confirm deletion in alert
6. Verify items removed from list

**Expected Results**:
- ✅ List loads within 3s
- ✅ Multi-select works (items highlight)
- ✅ Delete confirmation appears
- ✅ Server receives DELETE /frame/media/:mediaId

---

### Test 4: Album Sync (T023-T029)

**Goal**: Verify album sync functionality

**Steps**:
1. Navigate to "Album Sync" screen
2. Enter album ID (e.g., "test-album-001")
3. Tap "Sync Now"
4. Verify loading indicator
5. Check job summary display

**Expected Results**:
- ✅ Sync starts with loading indicator
- ✅ Server receives POST /sync/jobs
- ✅ Job summary shows: jobId, albumId, counts
- ✅ Poll GET /sync/jobs/:jobId succeeds

---

### Test 5: Settings & Permissions (T034, T035)

**Goal**: Verify settings and permission management

**Steps**:
1. Navigate to "Settings" screen
2. Verify paired Frame section displays correctly
3. Tap "Manage in Settings" for Photos permission
4. Should open iOS Settings app
5. Verify "Unpair Frame" button works
6. Check app version displayed

**Expected Results**:
- ✅ Settings screen renders all sections
- ✅ Paired Frame info shows (or "No Frame paired")
- ✅ Permission switches show current state
- ✅ "Manage in Settings" opens iOS Settings
- ✅ Version shows 0.1.0

---

### Test 6: Activity Log (T030)

**Goal**: Verify activity tracking (basic)

**Steps**:
1. Navigate to "Activity" screen
2. Check for empty state message

**Expected Results**:
- ✅ Shows "No recent activity" initially
- ✅ Screen renders without errors

**Note**: Activity persistence not yet implemented (placeholder only).

---

### Test 7: Error Handling (T031)

**Goal**: Verify error utilities work

**Steps**:
1. Stop the server
2. Try to upload a photo
3. Verify error alert displays
4. Restart server
5. Try upload again

**Expected Results**:
- ✅ Network error shows clear message
- ✅ Alert displays actionable text
- ✅ App doesn't crash on errors

---

## API Testing (Server)

### Manual API Tests

```bash
# List media
curl http://localhost:3000/frame/media

# Upload photo
curl -X POST http://localhost:3000/frame/media/upload \
  -H "Content-Type: application/json" \
  -d '{"assetId": "test-123", "convertIfNeeded": true}'

# Delete media
curl -X DELETE http://localhost:3000/frame/media/test-media-id

# Trigger sync
curl -X POST http://localhost:3000/sync/jobs \
  -H "Content-Type: application/json" \
  -d '{"albumId": "test-album", "deletionMode": "add-only"}'

# Get sync job
curl http://localhost:3000/sync/jobs/JOB_ID
```

### Run Server Tests

```bash
cd packages/server
npm test
```

---

## Native Bridge Testing (iOS)

### Using Xcode

1. Open `ios/framesync.xcworkspace` in Xcode
2. Select a simulator or device
3. Build and run (⌘R)
4. Set breakpoints in `FrameModule.swift`
5. Test native method calls from React Native

### Check Native Logs

```bash
# Watch iOS device logs
xcrun simctl spawn booted log stream --predicate 'subsystem CONTAINS "framesync"' --level debug
```

---

## Troubleshooting

### Server won't start
```bash
# Check port 3000 is free
lsof -i :3000
# Kill if needed
kill -9 <PID>
```

### Expo app won't connect to server
- Ensure both devices on same network
- Update `EXPO_PUBLIC_API_URL` in `.env` to your machine's IP
- Restart Expo dev server

### Swift compilation errors
```bash
cd packages/mobile/ios
pod install --repo-update
```

### TypeScript errors
```bash
npm run typecheck
```

---

## Performance Testing

### Success Criteria Validation

**SC-001**: Upload 5-8 MB photo in ≤10s
- Test with actual photo file
- Monitor with network inspector
- Should complete on ≥25 Mbps WiFi

**SC-002**: Media list loads in ≤3s for 500 items
- Mock 500 items in server response
- Measure `useEffect` to render time

**SC-003**: Album sync of 100 photos in ≤10 min
- Requires real Photos integration
- Monitor progress in Activity log

---

## Coverage Report

Run all tests:

```bash
# Server tests
cd packages/server && npm test

# Mobile type check
cd packages/mobile && npm run typecheck

# Lint all
cd ../.. && npm run lint
```

---

## Next Steps

1. **Add expo-image-picker** to UploadScreen for real photo selection
2. **Integrate swift-samsung-frame** TVClient for actual Frame discovery
3. **Add Photos framework** integration for album access
4. **Test on physical device** with real Samsung Frame TV
5. **Add E2E tests** with Detox or Maestro (optional)

---

## CI/CD (Future)

GitHub Actions workflow should run:
- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npm run build`

See `.github/workflows/` for automation.
