# FrameSync (Option C: Expo-only)

Native iOS app built with Expo that manages photos/art on Samsung Frame TV. The app uses `expo-media-library` to access your photo library (including iCloud assets when available) and will directly communicate with the Frame TV over WebSockets from React Native.

## Package
- `packages/mobile`: Expo + React Native app for iOS

## Quick start
1. Install deps
2. Start the Expo app

Implementation is currently paused pending Specify steps. See `.specify/memory` for the constitution, baseline spec, plan, and tasks.

## Notes
- Direct TV control will be implemented via WebSockets in the app (no Node server).
- Some Samsung models/firmwares behave differently; we’ll iterate based on the P1 flows in the spec.
