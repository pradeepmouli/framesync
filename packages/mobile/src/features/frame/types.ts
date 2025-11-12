import { z } from 'zod';

import {
    deleteResultSchema,
    frameMediaListSchema,
    frameMediaSchema,
    syncAcceptedSchema,
    syncDeletionModeSchema,
    syncJobSchema,
    syncStatusSchema,
    triggerSyncRequestSchema,
    uploadAcceptedSchema,
    uploadFrameMediaRequestSchema,
} from '@framesync/shared';

export {
    deleteResultSchema, frameMediaListSchema, frameMediaSchema, syncAcceptedSchema, syncDeletionModeSchema, syncJobSchema, syncStatusSchema, triggerSyncRequestSchema, uploadAcceptedSchema, uploadFrameMediaRequestSchema
};

export type FrameMedia = z.infer<typeof frameMediaSchema>;
export type FrameMediaList = z.infer<typeof frameMediaListSchema>;
export type UploadFrameMediaRequest = z.infer<typeof uploadFrameMediaRequestSchema>;
export type UploadAccepted = z.infer<typeof uploadAcceptedSchema>;
export type DeleteResult = z.infer<typeof deleteResultSchema>;
export type SyncDeletionMode = z.infer<typeof syncDeletionModeSchema>;
export type TriggerSyncRequest = z.infer<typeof triggerSyncRequestSchema>;
export type SyncAccepted = z.infer<typeof syncAcceptedSchema>;
export type SyncStatus = z.infer<typeof syncStatusSchema>;
export type SyncJob = z.infer<typeof syncJobSchema>;
