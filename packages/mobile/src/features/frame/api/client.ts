import axios, { AxiosInstance } from 'axios';

import {
	frameMediaListSchema,
	uploadFrameMediaRequestSchema,
	uploadAcceptedSchema,
	deleteResultSchema,
	triggerSyncRequestSchema,
	syncAcceptedSchema,
	syncJobSchema,
	type FrameMedia,
	type UploadFrameMediaRequest,
	type UploadAccepted,
	type DeleteResult,
	type TriggerSyncRequest,
	type SyncAccepted,
	type SyncJob,
} from '../types';

export class FrameApiClient {
	private readonly http: AxiosInstance;

	constructor(baseUrl: string, http?: AxiosInstance) {
		this.http = http ?? axios.create({
			baseURL: baseUrl.replace(/\/$/, ''),
			timeout: 10_000,
			headers: {
				'Content-Type': 'application/json',
			},
		});
	}

	async listMedia(): Promise<FrameMedia[]> {
		const response = await this.http.get('/frame/media');
		const payload = frameMediaListSchema.parse(response.data);
		return payload.items;
	}

	async uploadPhoto(request: UploadFrameMediaRequest): Promise<UploadAccepted> {
		const body = uploadFrameMediaRequestSchema.parse(request);
		const response = await this.http.post('/frame/media/upload', body);
		return uploadAcceptedSchema.parse(response.data);
	}

	async deleteMedia(mediaId: string): Promise<DeleteResult> {
		const response = await this.http.delete(`/frame/media/${encodeURIComponent(mediaId)}`);
		return deleteResultSchema.parse(response.data);
	}

	async triggerSync(request: TriggerSyncRequest): Promise<SyncAccepted> {
		const body = triggerSyncRequestSchema.parse(request);
		const response = await this.http.post('/sync/jobs', body);
		return syncAcceptedSchema.parse(response.data);
	}

	async getSyncJob(jobId: string): Promise<SyncJob> {
		const response = await this.http.get(`/sync/jobs/${encodeURIComponent(jobId)}`);
		return syncJobSchema.parse(response.data);
	}
}
