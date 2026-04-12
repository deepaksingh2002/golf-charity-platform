import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';

import { handleWebhook } from './controllers/subscription.controller.js';
import { getHealthStatus } from './controllers/system.controller.js';
import { buildAllowedOrigins, createCorsOptions } from './utils/cors.js';
import { notFoundHandler, errorHandler } from './utils/apiError.js';
import { registerRoutes } from './routes/index.js';

const app = express();
const isProduction = process.env.NODE_ENV === 'production';

app.set('trust proxy', 1);
app.disable('x-powered-by');

const allowedOrigins = buildAllowedOrigins({
  corsOrigins: process.env.CORS_ORIGINS,
  isProduction
});

const registerMiddleware = () => {
  app.use(cors(createCorsOptions(allowedOrigins)));
  app.use(helmet());
  app.use(morgan(isProduction ? 'combined' : 'dev'));
  app.use(
    express.json({
      limit: '1mb',
      verify: (req, res, buf) => {
        if (req.originalUrl?.startsWith('/api/subscriptions/webhook')) {
          req.rawBody = Buffer.from(buf);
        }
      }
    })
  );
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
};

const mountRoutes = () => {
  registerRoutes(app, {
    webhookMiddleware: express.raw({ type: 'application/json' }),
    handleWebhook,
    healthHandler: getHealthStatus
  });
};

registerMiddleware();
mountRoutes();
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
