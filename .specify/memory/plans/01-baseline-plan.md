# Plan: FrameSync Baseline

Scope: Implement minimal Expo app features to connect to TV, pair, send one photo, and adjust brightness/matte (no server).

Phases:
1) Protocol research: Verify WebSocket handshake and pairing steps compatible with React Native.
2) App UI: Connect screen (IP input), album picker, send flow, basic status.
3) Pairing: Prompt for PIN and retain session where applicable.
4) Commands: Implement minimal messages for Art Mode display and settings (brightness/matte).
5) Docs: README updates.
6) Tests: Smoke + mocked protocol tests.

Risks:
- Variations across TV firmware; pairing differences.
- Image processing requirements (size/aspect).
- RN WebSocket vs TV TLS/protocol nuances; cert/pinning considerations.

Rollout:
- Local LAN only; document local network permission on iOS.
