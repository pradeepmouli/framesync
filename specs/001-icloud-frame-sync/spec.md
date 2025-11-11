# Feature Specification: iCloud → Frame Sync

**Feature Branch**: `001-icloud-frame-sync`
**Created**: 2025-11-11
**Status**: Draft
**Input**: User description: "base iCloud -> Frame functionality, individual upload to Frame, manage/delete Frame images, sync album to Frame"

## User Scenarios & Testing (mandatory)

### User Story 1 — Upload a single photo to a Frame (Priority: P1)

As a device owner, I can select a single photo from my iCloud Photos and send it to a paired Samsung Frame so that it appears on the Frame.

Why this priority: This is the core moment of value—getting one photo onto the Frame quickly validates connectivity and end-to-end flow.

Independent Test: Can be fully tested by pairing a Frame and performing a one-off upload from a chosen photo; success is visible on the Frame without any other features.

Acceptance Scenarios:

1. Given a paired Frame and user-granted access to iCloud Photos, When I select one photo and tap Upload, Then the photo is transferred and displayed on the Frame with a success confirmation.
2. Given a large photo (>10MB) on typical Wi‑Fi, When I upload, Then I see progress and the upload completes without the app becoming unresponsive.
3. Given the Frame is temporarily offline, When I attempt upload, Then I receive a clear error with retry guidance.

---

### User Story 2 — Manage photos on the Frame (list and delete) (Priority: P2)

As a device owner, I can view the list/thumbnail set of images currently on the Frame and remove selected items so I can curate what is shown.

Why this priority: Management is essential to maintain control over storage and what the Frame cycles through.

Independent Test: Can be tested by listing Frame media, selecting one or more items, and confirming they no longer appear on the Frame media list.

Acceptance Scenarios:

1. Given images stored on the Frame, When I open the Frame media list, Then I see items with basic details (thumbnail, name or timestamp, size if available).
2. Given I select one or multiple items, When I confirm Delete, Then those items are removed from the Frame and no longer listed.
3. Given a delete operation fails (e.g., connectivity loss), When I retry, Then the app resumes and shows final status for each item.

---

### User Story 3 — Sync an iCloud album to the Frame (Priority: P3)

As a device owner, I can choose an iCloud album to keep in sync with the Frame so that new photos added to the album appear on the Frame automatically or on demand.

Why this priority: Album sync enables ongoing value and reduces manual effort after the initial setup.

Independent Test: Can be tested by choosing a small dedicated album, running a sync, and verifying new additions to the album appear on the Frame upon next sync.

Acceptance Scenarios:

1. Given album selection is configured, When I run Sync Now, Then photos missing on the Frame are added and duplicates are avoided per policy.
2. Given I add new photos to the chosen album, When I run Sync Now later, Then only new items transfer and prior items are not duplicated.
3. Given the Frame has limited available storage, When syncing would exceed capacity, Then I receive a clear message and partial sync behavior follows defined policy.

### Edge Cases

- Photo formats not natively rendered by the Frame (e.g., HEIC, RAW) require conversion before upload.
- Very large images or panoramas may exceed device constraints; app should inform users and offer a safe fallback.
- Duplicate handling between manual uploads and album sync must avoid multiple copies on the Frame.
- Frame offline or low storage during operations must surface actionable errors (retry, free space, or adjust selection).
- Network interruptions mid-transfer should resume or fail gracefully without corrupting Frame storage.
- Single-Frame MVP: users manage one Frame per account in the MVP; multi-Frame management is out of scope for the initial release and will be designed later to avoid accidental cross-device updates.

## Requirements (mandatory)

### Functional Requirements

- FR-001: The system MUST allow users to pair/select a Samsung Frame target before any media actions.
- FR-002: The system MUST request and obtain user permission to access iCloud Photos before browsing or uploading any media.
- FR-003: The system MUST enable selection of a single photo and perform a one-off upload to the selected Frame, with visible progress and completion/failure status.
- FR-004: The system MUST present a browsable list of images currently stored on the Frame and allow single- and multi-select deletion with confirmation.
- FR-005: The system MUST allow users to select one iCloud album for sync and initiate a manual "Sync Now" that uploads missing items only.
- FR-006: The system MUST avoid duplicates on the Frame using a hybrid deduplication policy: first a quick pre-check (filename + size), and when a potential duplicate is detected, verify using a deterministic content fingerprint. When a fingerprint match exists on the Frame, skip upload and record this in activity; when name/size match but the fingerprint does not, treat as distinct and upload.
- FR-007: The system MUST make deletion behavior during album sync configurable per album/device: default is Add-only (never delete). When "Mirror deletions" is enabled, items removed from the source album are removed from the Frame during sync, with guardrails (e.g., confirmation for bulk removals).
- FR-008: The system MUST clearly report errors (offline, permission denied, insufficient storage) and provide user-actionable next steps.
- FR-009: The system MUST provide basic activity logging or history visible to the user (e.g., last sync time, items uploaded, failed count) without exposing technical internals.
- FR-010: The system MUST respect user privacy, accessing only the minimum media necessary to fulfill user actions, and provide an easy way to revoke access.

### Key Entities (data involved)

- Frame Device: A controllable display target with an identifier, human-readable name, and available/used storage metadata (when available).
- Media Item: An image with attributes such as creation time, title/identifier, dimensions, approximate size, and a content fingerprint for deduplication.
- Album: A user-selected logical collection of Media Items eligible for sync.
- Sync Job: A run that evaluates source album vs Frame contents and performs uploads (and optionally deletions) according to policy.

## Success Criteria (mandatory)

### Measurable Outcomes

- SC-001: A single 5–8 MB photo upload completes successfully within 10 seconds on typical home Wi‑Fi (>50 Mbps) in 95% of attempts.
- SC-002: Frame media list loads and becomes interactive within 3 seconds for up to 500 items in 95% of attempts.
- SC-003: Initial album sync of 100 photos completes within 10 minutes on typical Wi‑Fi, with zero duplicates and a clear summary shown.
- SC-004: Subsequent incremental sync adds newly added album photos with zero duplicates and completes within 2 minutes for up to 20 new items.
- SC-005: User task success: 90% of users complete a first-time single upload without assistance; 85% complete album sync setup on first attempt.

## Assumptions & Dependencies

- User has an iCloud account on the device and grants permission to access Photos.
- A Samsung Frame is available and controllable by the user account, reachable on the same network or via a supported remote control path.
- The Frame’s available storage and supported formats may limit how many images can be stored or displayed; the app surfaces capacity errors.
- Default album sync behavior is one-way from iCloud album to Frame; bidirectional edits are out of scope unless otherwise decided.
- Automatic background sync scheduling is out of scope initially; manual "Sync Now" is sufficient for MVP.
- Videos, Live Photos motion content, and RAW files are out of initial scope unless support is explicitly added later.
