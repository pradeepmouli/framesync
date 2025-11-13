import { z } from 'zod';
export const frameMediaSchema = z.object({
    id: z.string(),
    title: z.string().optional(),
    createdAt: z.string().datetime().optional(),
    width: z.number().int().nonnegative().optional(),
    height: z.number().int().nonnegative().optional(),
    sizeBytes: z.number().int().nonnegative().optional(),
    fingerprint: z.string().optional(),
});
export const frameMediaListSchema = z.object({
    items: z.array(frameMediaSchema),
});
export const uploadFrameMediaRequestSchema = z.object({
    assetId: z.string(),
    convertIfNeeded: z.boolean().default(true),
});
export const uploadAcceptedSchema = z.object({
    uploadId: z.string(),
    status: z.enum(['pending', 'started']),
    acceptedAt: z.string().datetime().optional(),
});
export const deleteResultSchema = z.object({
    mediaId: z.string(),
    deleted: z.boolean(),
});
export const syncDeletionModeSchema = z.enum(['add-only', 'mirror']);
export const triggerSyncRequestSchema = z.object({
    albumId: z.string(),
    deletionMode: syncDeletionModeSchema.default('add-only'),
});
export const syncAcceptedSchema = z.object({
    jobId: z.string(),
    status: z.enum(['pending']),
    acceptedAt: z.string().datetime().optional(),
});
export const syncStatusSchema = z.enum(['pending', 'running', 'completed', 'failed']);
export const syncJobSchema = z.object({
    id: z.string(),
    albumId: z.string(),
    startedAt: z.string().datetime(),
    completedAt: z.string().datetime().nullable().optional(),
    addedCount: z.number().int().nonnegative(),
    skippedDuplicates: z.number().int().nonnegative(),
    failedCount: z.number().int().nonnegative(),
    deletionMode: syncDeletionModeSchema,
    status: syncStatusSchema.optional(),
});
