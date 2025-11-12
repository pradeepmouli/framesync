declare module 'express' {
  export type NextFunction = (err?: unknown) => void;

  export interface Request {
    body?: unknown;
    params: Record<string, string>;
    query: Record<string, string | string[]>;
  }

  export interface Response {
    status: (code: number) => Response;
    json: (body: unknown) => Response;
  }

  export type RequestHandler = (req: Request, res: Response, next: NextFunction) => unknown;
  export type ErrorRequestHandler = (
    err: unknown,
    req: Request,
    res: Response,
    next: NextFunction,
  ) => unknown;

  export interface Router {
    use: (...args: unknown[]) => Router;
    get: (path: string, ...handlers: RequestHandler[]) => Router;
    post: (path: string, ...handlers: RequestHandler[]) => Router;
    delete: (path: string, ...handlers: RequestHandler[]) => Router;
  }

  export interface Application extends Router {
    listen: (port: number, callback?: () => void) => void;
  }

  export interface ExpressExport {
    (): Application;
    Router: () => Router;
    json: () => RequestHandler;
  }

  const express: ExpressExport;
  export default express;
}
