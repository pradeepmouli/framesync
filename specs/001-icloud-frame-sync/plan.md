# Implementation Plan: iCloud → Frame Sync

**Branch**: `001-icloud-frame-sync` | **Date**: 2025-11-11 | **Spec**: `./spec.md`
**Input**: Feature specification from `./spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Enable one-off iCloud photo uploads to a paired Samsung Frame, list/delete Frame media, and manually sync a chosen iCloud album to the Frame with a hybrid deduplication policy. Use a Single-Frame MVP assumption. Integrate with the Swift package `swift-samsung-frame` to handle discovery, pairing, and media transfer to the Frame.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript (Node 20+), Swift 5.9+ (iOS integration)
**Primary Dependencies**: swift-samsung-frame (Frame control), Expo/React Native mobile app, Express server, zod, axios
**Storage**: N/A for MVP (no persistent server DB). Local state/preferences in app; transient server cache if needed.
**Testing**: vitest (server/shared), XCTest (iOS bridging), mobile E2E later if applicable
**Target Platform**: iOS (Expo app with native module/bridge), Node server
**Project Type**: Mobile + Server (per constitution)
**Performance Goals**: See spec success criteria (upload ≤10s typical, list ≤3s for 500 items, etc.)
**Constraints**: iOS Photos permission, local network access, Frame storage constraints; no secrets in repo
**Scale/Scope**: Single user/device MVP; single Frame per user in MVP

## Constitution Check

Gates (FrameSync Constitution):
- TypeScript First: PASS (server/shared remain TypeScript). Swift limited to device integration via library.
- Mobile + Server Separation: PASS (Expo app drives UI; server exposes HTTP contract; no shared runtime logic beyond types).
- Contract-Driven Development: PASS (we will define OpenAPI + zod schemas before implementing endpoints).
- Test-First, Minimal Surface: PASS (add minimal contract tests and smoke tests; keep APIs small).
- Simplicity & DX: PASS (Node 20+, oxlint/oxfmt in CI, .env for config).

Result: PASS to proceed to Phase 0.

### Post-Design Re-check (after Phase 1 artifacts)
- Added contracts (OpenAPI) before implementation: COMPLIANT
- Added data-model.md reflecting spec entities: COMPLIANT
- research.md decisions align with constitution (no scope creep): COMPLIANT
- No additional runtime layers or abstractions added prematurely: COMPLIANT
- Testing approach (contract + smoke + unit for bridge) remains minimal: COMPLIANT

Final Gate Status: PASS

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
packages/
  mobile/                # Expo app (iOS focus for MVP)
    src/features/frame/  # UI flows for upload, list/delete, album sync
  server/                # Express API for Frame operations
shared/                  # Shared types/schemas (zod)

ios/                     # Native iOS project (bridge hooks to swift-samsung-frame)
  framesync/             # App target; add native module shims if needed

specs/001-icloud-frame-sync/
  plan.md
  research.md
  data-model.md
  quickstart.md
  contracts/
```

**Structure Decision**: Mobile + API structure. React Native app in `packages/mobile` drives UX; server endpoints in `packages/server`; native iOS integration via `swift-samsung-frame` with a light bridge.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
