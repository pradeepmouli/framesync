import {
	uploadFrameMediaRequestSchema,
	uploadAcceptedSchema,
	frameMediaListSchema,
	deleteResultSchema,
} from '../../../../shared/src/frame/schemas.js';

export class FrameService {
	async upload(request: unknown) {
		const _validRequest = uploadFrameMediaRequestSchema.parse(request);

		// TODO: Delegate to native bridge via NativeModules or server-side iOS integration
		const acceptance = {
			uploadId: crypto.randomUUID(),
			status: 'pending' as const,
			acceptedAt: new Date().toISOString(),
		};

		return uploadAcceptedSchema.parse(acceptance);
	}

	async listMedia() {
		// TODO: Delegate to native bridge
		const items: unknown[] = [];
		return frameMediaListSchema.parse({ items });
	}

	async deleteMedia(mediaId: string) {
		// TODO: Delegate to native bridge
		return deleteResultSchema.parse({
			mediaId,
			deleted: false,
		});
	}
}
