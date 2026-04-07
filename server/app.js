import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';

import { handleWebhook } from './controllers/subscription.controller.js';
import { getHealthStatus } from './controllers/system.controller.js';
import { buildAllowedOrigins, createCorsOptions } from './utils/cors.js';
import { registerRoutes } from './routes/index.js';
import { notFoundHandler } from './middleware/notFound.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';

const app = express();
const isProduction = process.env.NODE_ENV === 'production';

app.set('trust proxy', 1);

const allowedOrigins = buildAllowedOrigins({
  corsOrigins: process.env.CORS_ORIGINS,
  isProduction
});

const registerMiddleware = () => {
  app.use(cors(createCorsOptions(allowedOrigins)));
  app.use(helmet());
  app.use(morgan(isProduction ? 'combined' : 'dev'));
  app.use(express.json());
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
