# Tasks: iCloud → Frame Sync

Feature Dir: /Users/pmouli/GitHub.nosync/framesync/specs/001-icloud-frame-sync
Spec: ./spec.md
Plan: ./plan.md
Contracts: ./contracts/openapi.yaml

## Phase 1 — Setup

- [X] T001 Ensure iOS Photos and Local Network permissions in ios/framesync/Info.plist
- [X] T001a Document swift-samsung-frame version/branch requirement in specs/001-icloud-frame-sync/research.md (use 001-samsung-tv-client branch)
- [X] T002 Add `swift-samsung-frame` as a Swift Package in ios/framesync.xcodeproj (SPM dependency)
- [X] T003 Create shared schemas in shared/src/frame/schemas.ts (FrameMedia, SyncJob, requests)
- [X] T004 Wire server route registration in packages/server/src/index.ts for frame and sync routes
- [X] T005 Create server route modules packages/server/src/routes/frame.ts and packages/server/src/routes/sync.ts

## Phase 2 — Foundational

- [X] T006 Implement iOS native bridge skeleton ios/framesync/FrameModule.swift (listMedia, uploadPhoto, deleteMedia, syncAlbum, getSyncJob)
- [X] T006a Implement Frame discovery/pairing flow in ios/framesync/FrameModule.swift (using swift-samsung-frame TVClient discovery)
- [X] T006b Create Frame pairing UI packages/mobile/src/features/frame/screens/PairFrameScreen.tsx (discover, select, pair)
- [X] T007 Export React Native module declaration in ios/framesync/framesync-Bridging-Header.h
- [X] T008 Create mobile API client packages/mobile/src/features/frame/api/client.ts (axios bound to server base URL)
- [X] T009 Add shared types import/wiring packages/mobile/src/features/frame/types.ts (re-export from shared)

## Phase 3 — User Story 1 (P1): Single photo upload

Goal: Select a photo from iCloud Photos and upload to the paired Frame with progress and completion status.

Independent test: Pick a single photo, tap Upload, see it display on the Frame with success confirmation.

- [X] T010 [US1] Implement POST /frame/media/upload in packages/server/src/routes/frame.ts (validate body, call service)
- [X] T011 [US1] Implement FrameService.upload in packages/server/src/services/frameService.ts (delegate to iOS bridge)
- [X] T012 [US1] Implement native bridge method uploadPhoto in ios/framesync/FrameModule.swift
- [X] T013 – Create Upload UI
  `packages/mobile/src/features/frame/screens/UploadScreen.tsx` (select photo, call API, show result).
- [X] T014 [P] [US1] Wire client.uploadPhoto in packages/mobile/src/features/frame/api/client.ts (progress events)
- [X] T015 [US1] Add navigation entry to Upload screen packages/mobile/src/app/(frame)/upload.tsx

## Phase 4 — User Story 2 (P2): Manage photos on the Frame

Goal: List media on the Frame and delete selected items.

Independent test: Open media list, delete one or multiple items, verify they disappear from the list.

- [X] T016 [US2] Implement GET /frame/media in packages/server/src/routes/frame.ts (map to FrameService.listMedia)
- [X] T017 [US2] Implement DELETE /frame/media/:mediaId in packages/server/src/routes/frame.ts
- [X] T018 [US2] Implement FrameService.listMedia and deleteMedia in packages/server/src/services/frameService.ts
- [X] T019 [US2] Implement native bridge methods listMedia and deleteMedia in ios/framesync/FrameModule.swift
- [X] T020 [P] [US2] Create Media List UI packages/mobile/src/features/frame/screens/MediaListScreen.tsx
- [X] T021 [P] [US2] Wire client.listMedia and client.deleteMedia in packages/mobile/src/features/frame/api/client.ts
- [X] T022 [US2] Add navigation entry to Media List screen packages/mobile/src/app/(frame)/media.tsx

## Phase 5 — User Story 3 (P3): Sync album to the Frame

Goal: Select an iCloud album and sync missing items to the Frame, with configurable deletion mode.

Independent test: Choose an album, run Sync Now, verify only new items upload; no duplicates.

- [X] T023 [US3] Implement POST /sync/jobs in packages/server/src/routes/sync.ts (accept albumId, deletionMode)
- [X] T024 [US3] Implement GET /sync/jobs/:jobId in packages/server/src/routes/sync.ts
- [X] T025 [US3] Implement SyncService in packages/server/src/services/syncService.ts (diff, dedup policy, invoke native)
- [X] T026 [US3] Implement native bridge methods syncAlbum and getSyncJob in ios/framesync/FrameModule.swift
- [X] T027 [P] [US3] Create Album Sync UI packages/mobile/src/features/frame/screens/AlbumSyncScreen.tsx (select album, run sync, show results)
- [X] T028 [P] [US3] Wire client.triggerSync and client.getSyncJob in packages/mobile/src/features/frame/api/client.ts
- [X] T029 [US3] Add navigation entry to Album Sync screen packages/mobile/src/app/(frame)/sync.tsx

## Final Phase — Polish & Cross-Cutting

- [X] T030 Add basic activity log view packages/mobile/src/features/frame/screens/ActivityScreen.tsx (recent uploads/sync summaries)
- [X] T031 Error surface mapping and toasts packages/mobile/src/features/frame/utils/errors.ts
- [X] T032 Update README and quickstart with run instructions README.md and specs/001-icloud-frame-sync/quickstart.md
- [X] T033 Verify Info.plist entitlements for Photos/Local Network ios/framesync/Info.plist
- [X] T034 Create Settings screen packages/mobile/src/features/frame/screens/SettingsScreen.tsx (manage permissions, revoke Photo Library access, unpair Frame)
- [X] T035 Add navigation entry to Settings screen packages/mobile/src/app/(frame)/settings.tsx

## Dependencies

- User story order: US1 → US2 → US3
- Foundational tasks (T006–T009) must complete before US1
- Setup tasks (T001–T005) must complete before Foundational

## Parallel Execution Examples

- T013 and T014 can run in parallel (mobile UI and API client) after T010–T012 are underway.
- T020 and T021 can run in parallel (list UI and client wiring) after T016–T019 start.
- T027 and T028 can run in parallel after T023–T026 start.

## Implementation Strategy

- MVP delivers US1 (upload single photo) end-to-end.
- Incrementally add US2 (management) and US3 (album sync) in separate PRs.
- Keep server/service surface minimal; prefer thin endpoints delegating to native bridge.