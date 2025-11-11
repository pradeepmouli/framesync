# Research & Decisions: iCloud → Frame Sync

**Date**: 2025-11-11
**Branch**: 001-icloud-frame-sync
**Source Spec**: ./spec.md

## Overview
This document captures resolved technical decisions for implementing single-photo upload, Frame media management, and album sync using a Swift integration library (`swift-samsung-frame`) within a React Native (Expo) + Node server architecture.

## Decisions

### D1: Frame Integration Approach
- **Decision**: Use `swift-samsung-frame` directly via a lightweight native module bridge (Swift → React Native) for iOS.
- **Rationale**: Reuses specialized logic for Frame communication; reduces time-to-market vs building protocol code.
- **Alternatives Considered**:
  - Custom protocol implementation in Swift: Higher maintenance, protocol reverse-engineering risk.
  - Pure JavaScript via local network calls only: Lacks direct Frame control features exposed by library.

### D2: Single-Frame MVP
- **Decision**: Support exactly one paired Frame in MVP; future multi-device design reserved.
- **Rationale**: Simplifies UI, state, and error handling; validates core value quickly.
- **Alternatives**: Immediate multi-frame support adds complexity (selection UI, per-device sync policies) without MVP necessity.

### D3: Album Sync Behavior
- **Decision**: Manual "Sync Now" trigger; no background scheduler initially.
- **Rationale**: Avoids complexity around background tasks, battery policies, and privacy; manual control is explicit.
- **Alternatives**: Automatic periodic sync (needs scheduling constraints and user controls) deferred.

### D4: Deletion Policy During Sync
- **Decision**: Configurable per album/device; default Add-only. Optional Mirror (with bulk deletion confirmation).
- **Rationale**: Prevent unintended mass deletions while allowing advanced curation.
- **Alternatives**: Strict mirror (risk of accidental loss), add-only only (less alignment with user expectations for true sync).

### D5: Deduplication Policy
- **Decision**: Hybrid two-step (filename+size quick check → content fingerprint confirmation). Skip upload if fingerprint match; treat differing fingerprint as distinct.
- **Rationale**: Balances performance and correctness; prevents duplicates across manual + sync flows.
- **Alternatives**: Filename-only (false negatives), hash-only (more compute for all items).

### D6: Media Conversion
- **Decision**: HEIC/RAW unsupported directly -> convert to JPEG (quality ~0.9) before upload when required.
- **Rationale**: Broad compatibility, predictable size.
- **Alternatives**: Keep original (risk of incompatibility), PNG (larger files).

### D7: Content Fingerprint Method
- **Decision**: Use perceptual hash (pHash) for similarity + fallback to SHA256 for exactness.
- **Rationale**: Avoid storing duplicates that differ only in metadata; still handle exact match reliably.
- **Alternatives**: SHA256 only (misses visually identical variants); average hash (less robust).

### D8: Progress & Cancellation
- **Decision**: Provide upload progress events (0–100%) and allow user-initiated cancel pre-completion.
- **Rationale**: Better UX for large photos; prevents waiting on unwanted uploads.
- **Alternatives**: Fire-and-forget (poor UX on slow networks).

### D9: Error Handling Strategy
- **Decision**: Map low-level errors to user-facing categories: Connectivity, Permission, Storage, Format, Unknown.
- **Rationale**: Consistent actionable guidance; supports analytics.
- **Alternatives**: Raw error propagation (confusing to users).

### D10: Activity Logging
- **Decision**: Maintain in-memory session log + persisted lightweight history (last N entries in mobile secure storage) for upload/sync summaries.
- **Rationale**: Enables user review of recent operations; minimal complexity.
- **Alternatives**: Full server-side logging (overkill for MVP), no logging (reduces transparency).

## Unresolved / Deferred
- Background automatic sync scheduling.
- Multi-Frame orchestration and per-frame policies.
- Video/Live Photo support.

## Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|-----------|
| Large album initial sync duration | User frustration | Show running summary + allow early cancel |
| Frame storage exhaustion | Failed uploads | Pre-check available capacity (if exposed) + clear messaging |
| Hash collision (perceptual) | Duplicate or skipped distinct image | Fallback to SHA256 check before final skip |
| Permission revocation mid-process | Failed operations | Detect and prompt re-auth before starting tasks |
| Network drop mid-upload | Partial/corrupt transfer | Chunked or atomic upload; retry from start with clear status |

## Summary
All clarifications from spec are resolved. No gating issues against the constitution. Ready for Phase 1 design artifacts.
