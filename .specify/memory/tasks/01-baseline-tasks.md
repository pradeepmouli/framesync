# Tasks: FrameSync Baseline (Expo-only)

- [ ] Research TV WebSocket protocol and pairing flow compatibility with React Native (wss://<ip>:8002)
- [ ] Create mobile screens: Connect (IP entry + connect), Albums (picker), Send (preview + send)
- [ ] Implement pairing: prompt for PIN when required; persist session tokens if applicable
- [ ] Implement photo sending: read image data via expo-media-library and send over WS in required format
- [ ] Implement brightness/matte commands
- [ ] Handle iOS permissions: Photos, Local Network (usage strings)
- [ ] Error display and retry flow; simple logs for debugging
- [ ] Tests: smoke + protocol mocks where feasible
