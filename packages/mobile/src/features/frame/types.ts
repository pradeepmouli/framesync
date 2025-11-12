import { z } from 'zod';

import {
	frameMediaSchema,
	frameMediaListSchema,
	uploadFrameMediaRequestSchema,
	uploadAcceptedSchema,
	deleteResultSchema,
	syncDeletionModeSchema,
	triggerSyncRequestSchema,
	syncAcceptedSchema,
	syncStatusSchema,
	syncJobSchema,
} from '@framesync/shared';

export {
	frameMediaSchema,
	frameMediaListSchema,
	uploadFrameMediaRequestSchema,
	uploadAcceptedSchema,
	deleteResultSchema,
	syncDeletionModeSchema,
	triggerSyncRequestSchema,
	syncAcceptedSchema,
	syncStatusSchema,
	syncJobSchema,
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
