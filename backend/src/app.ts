import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { apiRoutes } from './routes';
import { errorHandler } from './middleware/errorHandler';
import { apiRateLimiter } from './middleware/rateLimit';
import { swaggerDocument } from './docs/swagger';
import { env } from './config/env';

export function createApp(): Application {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(
    cors({
      origin: env.frontendUrl.split(',').map((u) => u.trim()),
      credentials: true,
    })
  );
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));

  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, { customSiteTitle: 'GESTOCK API Docs' }));

  app.get('/', (_req: Request, res: Response) => {
    res.json({
      app: 'GESTOCK API',
      version: '1.0.0',
      docs: '/api/docs',
      health: '/api/health',
    });
  });

  app.use('/api', apiRateLimiter, apiRoutes);

  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: 'La ruta solicitada no existe.',
      code: 'NOT_FOUND',
    });
  });

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    errorHandler(err, _req, res, _next);
  });

  return app;
}