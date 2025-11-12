import express, { ErrorRequestHandler, NextFunction, Request, Response } from 'express';

import { frameRouter } from './routes/frame.js';
import { syncRouter } from './routes/sync.js';

export const createServer = () => {
	const app = express();

	app.use(express.json());

	app.use('/frame', frameRouter);
	app.use('/sync', syncRouter);

		app.get('/healthz', (_req: Request, res: Response) => {
		res.json({ status: 'ok' });
	});

				const errorHandler: ErrorRequestHandler = (
					err: unknown,
					_req: Request,
					res: Response,
					_next: NextFunction,
				) => {
		const message = err instanceof Error ? err.message : 'Unknown error';
		res.status(500).json({ error: message });
	};

	app.use(errorHandler);

	return app;
};

if (require.main === module) {
	const port = Number(process.env.PORT ?? 3000);
	const app = createServer();

	app.listen(port, () => {
		// eslint-disable-next-line no-console
		console.log(`[framesync] server listening on :${port}`);
	});
}
