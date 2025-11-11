# Quickstart: iCloud → Frame Sync

This guide describes how the mobile app and server integrate with the `swift-samsung-frame` library to upload photos, manage Frame media, and run album sync.

## Prerequisites
- iOS device with iCloud Photos enabled
- Samsung Frame on the same network
- Local Network and Photos permissions

## High-Level Flow
1) Mobile app requests Photos permission and selects an asset or album.
2) Mobile app calls server API to initiate upload/sync.
3) Server bridges to native iOS integrations (via module) or proxies commands if running on-device.
4) `swift-samsung-frame` handles Frame discovery and media transfer.

## Integration Notes
- Use a lightweight native module wrapper to expose `swift-samsung-frame` capabilities to React Native.
- Convert unsupported formats (HEIC/RAW) to JPEG before upload.
- Show progress and allow cancel on uploads; surface errors with actionable messages.

## Contracts
See `./contracts/openapi.yaml` for endpoints:
- GET /frame/media
- POST /frame/media/upload
- DELETE /frame/media/{mediaId}
- POST /sync/jobs
- GET /sync/jobs/{jobId}
