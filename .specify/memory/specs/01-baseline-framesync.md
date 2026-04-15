# Feature Specification: FrameSync Baseline

Feature Branch: `[001-baseline-framesync]`
Created: 2025-11-04
Status: Draft
Input: Native iOS app (Expo-only) to manage photos/art on Samsung Frame TV with direct WebSocket control

## User Scenarios & Testing

### User Story 1 - Discover/Connect to TV (P1)

As an iOS user, I can input or discover the TV IP and verify WebSocket connectivity from the app.
Why: Unblocks all other flows.
Independent Test: Attempt WS connect to TV (wss://<ip>:8002) and display status.
Acceptance:

1. Given TV IP known, When Connect, Then app shows connected.
2. Given unreachable IP, When Connect, Then an error is shown and not persisted.

### User Story 2 - Pair with TV (P1)

As a user, I can perform the pairing flow (PIN entry when required) directly from the app via WebSocket handshake.
Independent Test: Mock pairing responses; app handles pairingRequired true/false.
Acceptance:

1. Given TV host configured, When Pair, Then app prompts for PIN if required and stores session details.

### User Story 3 - Send and Display Photo (P1)

As a user, I can select a single photo from my iOS library and send it to the TV to display in Art Mode directly over WebSocket.
Independent Test: Using a dummy image, mock a successful send and confirm UI status.
Acceptance:

1. Given photo selected, When send, Then app reports success.
2. Given success, TV displays the image in Art Mode.

### User Story 4 - Adjust Art Settings (P2)

As a user, I can set brightness and matte style for Art Mode via WebSocket commands.
Independent Test: Mock brightness/matte commands and verify UI feedback.
Acceptance:

1. When setting brightness 0..100, Then TV applies change.

### User Story 5 - List & Select Art (P3)

As a user, I can list available art and select one to display.

### Edge Cases

- Missing/incorrect TV host → server responds with error and guidance.
- Large images → server rejects >10MB or resizes (TBD).
- TV offline → timeouts and retries surfaced to client.

## Requirements

### Functional Requirements

- FR-001: App MUST allow configuring a TV IP (and optional discovery later).
- FR-002: App MUST connect to TV via WebSocket (wss://<ip>:8002) and perform pairing handshake.
- FR-003: App MUST request Photos permission and allow selecting a photo (including iCloud assets where available via expo-media-library).
- FR-004: App SHOULD send selected photo to TV using the appropriate protocol for Art Mode (details TBD from TV protocol).
- FR-005: App SHOULD support brightness/matte adjustments.
- FR-006: [Clarification] Image resizing, color profile, and aspect handling TBD.

### Key Entities

- UploadResult { id?: string, status: 'queued'|'done'|'error' }
- ArtListItem { id: string, title?: string, createdAt?: string }

## Success Criteria

- SC-001: User can connect to TV and see connected state within 5 seconds.
- SC-002: A selected local photo is sent and displayed within 10 seconds on LAN.
- SC-003: Brightness changes reflect on TV (manual verification acceptable for MVP).
- SC-004: No unhandled errors in the app during happy path.
