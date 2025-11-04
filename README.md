# FrameSync

Native iOS (Expo) app + Node server to manage photos/art on Samsung Frame TV. The server uses `samsung-frame-connect` to pair and control Art Mode; the app browses your photo library and sends selections to the TV.

## Packages
- `packages/server`: Express + TypeScript REST/SSE API wrapping samsung-frame-connect
- `packages/mobile`: Expo + React Native app for iOS
- `shared`: Shared zod schemas and TypeScript types

## Quick start
1. Install deps
2. Configure server `.env` (see `packages/server/.env.example`)
3. Start server, then run the mobile app.

See detailed instructions in each package `README`.

## Notes
- Initial implementation targets a single Samsung Frame TV on your LAN.
- Pairing and upload behavior depends on TV model/firmware; keep your TV up to date.
- Server should run on the same network as the TV. Secure your LAN.
