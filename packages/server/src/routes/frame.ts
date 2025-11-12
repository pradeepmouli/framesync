import express, { RequestHandler } from 'express';

import { FrameService } from '../services/frameService.js';

const frameRouter = express.Router();
const frameService = new FrameService();

const uploadHandler: RequestHandler = async (req, res, next) => {
	try {
		const acceptance = await frameService.upload(req.body);
		res.status(202).json(acceptance);
	} catch (error) {
		next(error);
	}
};

const listMediaHandler: RequestHandler = async (_req, res, next) => {
	try {
		const result = await frameService.listMedia();
		res.status(200).json(result);
	} catch (error) {
		next(error);
	}
};

const deleteMediaHandler: RequestHandler = async (req, res, next) => {
	try {
		const { mediaId } = req.params;
		const result = await frameService.deleteMedia(mediaId);
		res.status(200).json(result);
	} catch (error) {
		next(error);
	}
};

frameRouter.get('/media', listMediaHandler);
frameRouter.post('/media/upload', uploadHandler);
frameRouter.delete('/media/:mediaId', deleteMediaHandler);

export { frameRouter };
