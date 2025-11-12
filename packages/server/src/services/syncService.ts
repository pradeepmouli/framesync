import {
    syncAcceptedSchema,
    syncJobSchema,
    triggerSyncRequestSchema,
} from '../../../../shared/src/frame/schemas.js';

export class SyncService {
	private jobs = new Map<string, unknown>();

	async triggerSync(request: unknown) {
		const validRequest = triggerSyncRequestSchema.parse(request);
		const jobId = crypto.randomUUID();
		const now = new Date().toISOString();

		const job = {
			id: jobId,
			albumId: validRequest.albumId,
			startedAt: now,
			completedAt: null,
			addedCount: 0,
			skippedDuplicates: 0,
			failedCount: 0,
			deletionMode: validRequest.deletionMode,
			status: 'pending' as const,
		};

		this.jobs.set(jobId, job);

		// TODO: Delegate to native bridge for actual sync execution
		const acceptance = {
			jobId,
			status: 'pending' as const,
			acceptedAt: now,
		};

		return syncAcceptedSchema.parse(acceptance);
	}

	async getSyncJob(jobId: string) {
		const job = this.jobs.get(jobId);
		if (!job) {
			throw new Error(`Sync job ${jobId} not found`);
		}
		return syncJobSchema.parse(job);
	}
}
