import { z } from 'zod';
/**
 * Shared Zod schemas for iCloud → Frame Sync feature
 * Based on specs/001-icloud-frame-sync/contracts/openapi.yaml
 * and specs/001-icloud-frame-sync/data-model.md
 */
export declare const FrameMediaSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodOptional<z.ZodString>;
    width: z.ZodOptional<z.ZodNumber>;
    height: z.ZodOptional<z.ZodNumber>;
    sizeBytes: z.ZodOptional<z.ZodNumber>;
    fingerprint: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    title?: string | undefined;
    createdAt?: string | undefined;
    width?: number | undefined;
    height?: number | undefined;
    sizeBytes?: number | undefined;
    fingerprint?: string | undefined;
}, {
    id: string;
    title?: string | undefined;
    createdAt?: string | undefined;
    width?: number | undefined;
    height?: number | undefined;
    sizeBytes?: number | undefined;
    fingerprint?: string | undefined;
}>;
export type FrameMedia = z.infer<typeof FrameMediaSchema>;
export declare const FrameDeviceSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    reachable: z.ZodBoolean;
    storageTotalMB: z.ZodOptional<z.ZodNumber>;
    storageFreeMB: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    reachable: boolean;
    storageTotalMB?: number | undefined;
    storageFreeMB?: number | undefined;
}, {
    id: string;
    name: string;
    reachable: boolean;
    storageTotalMB?: number | undefined;
    storageFreeMB?: number | undefined;
}>;
export type FrameDevice = z.infer<typeof FrameDeviceSchema>;
export declare const MediaItemFormatSchema: z.ZodEnum<["jpeg", "heic", "png", "raw", "other"]>;
export declare const MediaItemSchema: z.ZodObject<{
    id: z.ZodString;
    filename: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodOptional<z.ZodString>;
    width: z.ZodOptional<z.ZodNumber>;
    height: z.ZodOptional<z.ZodNumber>;
    sizeBytes: z.ZodOptional<z.ZodNumber>;
    format: z.ZodEnum<["jpeg", "heic", "png", "raw", "other"]>;
    fingerprint: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    format: "jpeg" | "heic" | "png" | "raw" | "other";
    createdAt?: string | undefined;
    width?: number | undefined;
    height?: number | undefined;
    sizeBytes?: number | undefined;
    fingerprint?: string | undefined;
    filename?: string | undefined;
}, {
    id: string;
    format: "jpeg" | "heic" | "png" | "raw" | "other";
    createdAt?: string | undefined;
    width?: number | undefined;
    height?: number | undefined;
    sizeBytes?: number | undefined;
    fingerprint?: string | undefined;
    filename?: string | undefined;
}>;
export type MediaItem = z.infer<typeof MediaItemSchema>;
export type MediaItemFormat = z.infer<typeof MediaItemFormatSchema>;
export declare const AlbumSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    itemCount: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    itemCount?: number | undefined;
}, {
    id: string;
    name: string;
    itemCount?: number | undefined;
}>;
export type Album = z.infer<typeof AlbumSchema>;
export declare const DeletionModeSchema: z.ZodEnum<["add-only", "mirror"]>;
export declare const SyncJobSchema: z.ZodObject<{
    id: z.ZodString;
    albumId: z.ZodString;
    startedAt: z.ZodString;
    completedAt: z.ZodOptional<z.ZodString>;
    addedCount: z.ZodNumber;
    skippedDuplicates: z.ZodNumber;
    failedCount: z.ZodNumber;
    deletionMode: z.ZodEnum<["add-only", "mirror"]>;
}, "strip", z.ZodTypeAny, {
    id: string;
    albumId: string;
    startedAt: string;
    addedCount: number;
    skippedDuplicates: number;
    failedCount: number;
    deletionMode: "add-only" | "mirror";
    completedAt?: string | undefined;
}, {
    id: string;
    albumId: string;
    startedAt: string;
    addedCount: number;
    skippedDuplicates: number;
    failedCount: number;
    deletionMode: "add-only" | "mirror";
    completedAt?: string | undefined;
}>;
export type SyncJob = z.infer<typeof SyncJobSchema>;
export type DeletionMode = z.infer<typeof DeletionModeSchema>;
export declare const UploadPhotoRequestSchema: z.ZodObject<{
    assetId: z.ZodString;
    convertIfNeeded: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    assetId: string;
    convertIfNeeded: boolean;
}, {
    assetId: string;
    convertIfNeeded?: boolean | undefined;
}>;
export type UploadPhotoRequest = z.infer<typeof UploadPhotoRequestSchema>;
export declare const UploadAcceptedSchema: z.ZodObject<{
    uploadId: z.ZodString;
    status: z.ZodEnum<["pending", "started"]>;
}, "strip", z.ZodTypeAny, {
    status: "pending" | "started";
    uploadId: string;
}, {
    status: "pending" | "started";
    uploadId: string;
}>;
export type UploadAccepted = z.infer<typeof UploadAcceptedSchema>;
export declare const ListFrameMediaResponseSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        title: z.ZodOptional<z.ZodString>;
        createdAt: z.ZodOptional<z.ZodString>;
        width: z.ZodOptional<z.ZodNumber>;
        height: z.ZodOptional<z.ZodNumber>;
        sizeBytes: z.ZodOptional<z.ZodNumber>;
        fingerprint: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        title?: string | undefined;
        createdAt?: string | undefined;
        width?: number | undefined;
        height?: number | undefined;
        sizeBytes?: number | undefined;
        fingerprint?: string | undefined;
    }, {
        id: string;
        title?: string | undefined;
        createdAt?: string | undefined;
        width?: number | undefined;
        height?: number | undefined;
        sizeBytes?: number | undefined;
        fingerprint?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    items: {
        id: string;
        title?: string | undefined;
        createdAt?: string | undefined;
        width?: number | undefined;
        height?: number | undefined;
        sizeBytes?: number | undefined;
        fingerprint?: string | undefined;
    }[];
}, {
    items: {
        id: string;
        title?: string | undefined;
        createdAt?: string | undefined;
        width?: number | undefined;
        height?: number | undefined;
        sizeBytes?: number | undefined;
        fingerprint?: string | undefined;
    }[];
}>;
export type ListFrameMediaResponse = z.infer<typeof ListFrameMediaResponseSchema>;
export declare const DeleteResultSchema: z.ZodObject<{
    mediaId: z.ZodString;
    deleted: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    mediaId: string;
    deleted: boolean;
}, {
    mediaId: string;
    deleted: boolean;
}>;
export type DeleteResult = z.infer<typeof DeleteResultSchema>;
export declare const TriggerSyncRequestSchema: z.ZodObject<{
    albumId: z.ZodString;
    deletionMode: z.ZodDefault<z.ZodEnum<["add-only", "mirror"]>>;
}, "strip", z.ZodTypeAny, {
    albumId: string;
    deletionMode: "add-only" | "mirror";
}, {
    albumId: string;
    deletionMode?: "add-only" | "mirror" | undefined;
}>;
export type TriggerSyncRequest = z.infer<typeof TriggerSyncRequestSchema>;
export declare const SyncAcceptedSchema: z.ZodObject<{
    jobId: z.ZodString;
    status: z.ZodEnum<["pending"]>;
}, "strip", z.ZodTypeAny, {
    status: "pending";
    jobId: string;
}, {
    status: "pending";
    jobId: string;
}>;
export type SyncAccepted = z.infer<typeof SyncAcceptedSchema>;
