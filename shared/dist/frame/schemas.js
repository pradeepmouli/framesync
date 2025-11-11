import { z } from 'zod';
/**
 * Shared Zod schemas for iCloud → Frame Sync feature
 * Based on specs/001-icloud-frame-sync/contracts/openapi.yaml
 * and specs/001-icloud-frame-sync/data-model.md
 */
// ===== FrameMedia =====
export const FrameMediaSchema = z.object({
    id: z.string(),
    title: z.string().optional(),
    createdAt: z.string().datetime().optional(),
    width: z.number().int().optional(),
    height: z.number().int().optional(),
    sizeBytes: z.number().int().optional(),
    fingerprint: z.string().optional(),
});
// ===== FrameDevice =====
export const FrameDeviceSchema = z.object({
    id: z.string(),
    name: z.string(),
    reachable: z.boolean(),
    storageTotalMB: z.number().optional(),
    storageFreeMB: z.number().optional(),
});
// ===== MediaItem (iCloud Photos) =====
export const MediaItemFormatSchema = z.enum(['jpeg', 'heic', 'png', 'raw', 'other']);
export const MediaItemSchema = z.object({
    id: z.string(),
    filename: z.string().optional(),
    createdAt: z.string().datetime().optional(),
    width: z.number().int().optional(),
    height: z.number().int().optional(),
    sizeBytes: z.number().int().optional(),
    format: MediaItemFormatSchema,
    fingerprint: z.string().optional(),
});
// ===== Album =====
export const AlbumSchema = z.object({
    id: z.string(),
    name: z.string(),
    itemCount: z.number().int().optional(),
});
// ===== SyncJob =====
export const DeletionModeSchema = z.enum(['add-only', 'mirror']);
export const SyncJobSchema = z.object({
    id: z.string(),
    albumId: z.string(),
    startedAt: z.string().datetime(),
    completedAt: z.string().datetime().optional(),
    addedCount: z.number().int(),
    skippedDuplicates: z.number().int(),
    failedCount: z.number().int(),
    deletionMode: DeletionModeSchema,
});
// ===== API Request/Response Schemas =====
// Upload Photo Request
export const UploadPhotoRequestSchema = z.object({
    assetId: z.string(),
    convertIfNeeded: z.boolean().default(true),
});
// Upload Accepted Response
export const UploadAcceptedSchema = z.object({
    uploadId: z.string(),
    status: z.enum(['pending', 'started']),
});
// List Frame Media Response
export const ListFrameMediaResponseSchema = z.object({
    items: z.array(FrameMediaSchema),
});
// Delete Result Response
export const DeleteResultSchema = z.object({
    mediaId: z.string(),
    deleted: z.boolean(),
});
// Trigger Sync Request
export const TriggerSyncRequestSchema = z.object({
    albumId: z.string(),
    deletionMode: DeletionModeSchema.default('add-only'),
});
// Sync Accepted Response
export const SyncAcceptedSchema = z.object({
    jobId: z.string(),
    status: z.enum(['pending']),
});
