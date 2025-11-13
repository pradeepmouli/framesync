# Data Model: iCloud → Frame Sync

## Entities

### FrameDevice
- id: string (stable identifier)
- name: string
- reachable: boolean
- storageTotalMB?: number
- storageFreeMB?: number

Relationships:
- Has many FrameMedia

### FrameMedia
- id: string (Frame-side identifier)
- title?: string
- createdAt?: string (ISO)
- width?: number
- height?: number
- sizeBytes?: number
- fingerprint?: string (SHA-256 hash of image data for deduplication)

Relationships:
- Belongs to FrameDevice

### Album
- id: string (Photos album identifier)
- name: string
- itemCount?: number

### MediaItem
- id: string (Photos asset identifier)
- filename?: string
- createdAt?: string (ISO)
- width?: number
- height?: number
- sizeBytes?: number
- format: 'jpeg' | 'heic' | 'png' | 'raw' | 'other'
- fingerprint?: string (SHA-256 hash for deduplication)

### SyncJob
- id: string (uuid)
- albumId: string
- startedAt: string (ISO)
- completedAt?: string (ISO)
- addedCount: number
- skippedDuplicates: number
- failedCount: number
- deletionMode: 'add-only' | 'mirror'

## Validation Rules
- MediaItem.format unsupported by Frame → must be converted to JPEG before upload.
- Deduplication uses quick pre-check (filename+size) followed by fingerprint confirmation.
- Mirror deletions must prompt user confirmation for bulk removes.

## Notes
- Single-Frame MVP: Only one FrameDevice is active at a time.
- Activity history: maintain last N job summaries client-side.
