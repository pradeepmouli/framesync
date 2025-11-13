import { z } from 'zod';
export declare const frameMediaSchema: z.ZodObject<{
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
export declare const frameMediaListSchema: z.ZodObject<{
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
export declare const uploadFrameMediaRequestSchema: z.ZodObject<{
    assetId: z.ZodString;
    convertIfNeeded: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    assetId: string;
    convertIfNeeded: boolean;
}, {
    assetId: string;
    convertIfNeeded?: boolean | undefined;
}>;
export declare const uploadAcceptedSchema: z.ZodObject<{
    uploadId: z.ZodString;
    status: z.ZodEnum<["pending", "started"]>;
    acceptedAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "pending" | "started";
    uploadId: string;
    acceptedAt?: string | undefined;
}, {
    status: "pending" | "started";
    uploadId: string;
    acceptedAt?: string | undefined;
}>;
export declare const deleteResultSchema: z.ZodObject<{
    mediaId: z.ZodString;
    deleted: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    mediaId: string;
    deleted: boolean;
}, {
    mediaId: string;
    deleted: boolean;
}>;
export declare const syncDeletionModeSchema: z.ZodEnum<["add-only", "mirror"]>;
export declare const triggerSyncRequestSchema: z.ZodObject<{
    albumId: z.ZodString;
    deletionMode: z.ZodDefault<z.ZodEnum<["add-only", "mirror"]>>;
}, "strip", z.ZodTypeAny, {
    albumId: string;
    deletionMode: "add-only" | "mirror";
}, {
    albumId: string;
    deletionMode?: "add-only" | "mirror" | undefined;
}>;
export declare const syncAcceptedSchema: z.ZodObject<{
    jobId: z.ZodString;
    status: z.ZodEnum<["pending"]>;
    acceptedAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "pending";
    jobId: string;
    acceptedAt?: string | undefined;
}, {
    status: "pending";
    jobId: string;
    acceptedAt?: string | undefined;
}>;
export declare const syncStatusSchema: z.ZodEnum<["pending", "running", "completed", "failed"]>;
export declare const syncJobSchema: z.ZodObject<{
    id: z.ZodString;
    albumId: z.ZodString;
    startedAt: z.ZodString;
    completedAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    addedCount: z.ZodNumber;
    skippedDuplicates: z.ZodNumber;
    failedCount: z.ZodNumber;
    deletionMode: z.ZodEnum<["add-only", "mirror"]>;
    status: z.ZodOptional<z.ZodEnum<["pending", "running", "completed", "failed"]>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    albumId: string;
    deletionMode: "add-only" | "mirror";
    startedAt: string;
    addedCount: number;
    skippedDuplicates: number;
    failedCount: number;
    status?: "pending" | "running" | "completed" | "failed" | undefined;
    completedAt?: string | null | undefined;
}, {
    id: string;
    albumId: string;
    deletionMode: "add-only" | "mirror";
    startedAt: string;
    addedCount: number;
    skippedDuplicates: number;
    failedCount: number;
    status?: "pending" | "running" | "completed" | "failed" | undefined;
    completedAt?: string | null | undefined;
}>;
