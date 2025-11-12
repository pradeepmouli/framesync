import express, { RequestHandler } from 'express';

import { SyncService } from '../services/syncService.js';

const syncRouter = express.Router();
const syncService = new SyncService();

const triggerSyncHandler: RequestHandler = async (req, res, next) => {
	try {
		const acceptance = await syncService.triggerSync(req.body);
		res.status(202).json(acceptance);
	} catch (error) {
		next(error);
	}
};

const getSyncJobHandler: RequestHandler = async (req, res, next) => {
	try {
		const { jobId } = req.params;
		const job = await syncService.getSyncJob(jobId);
		res.status(200).json(job);
	} catch (error) {
		next(error);
	}
};

syncRouter.post('/jobs', triggerSyncHandler);
syncRouter.get('/jobs/:jobId', getSyncJobHandler);

export { syncRouter };
