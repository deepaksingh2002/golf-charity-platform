import authRoutes from './auth.routes.js';
import scoreRoutes from './score.routes.js';
import charityRoutes from './charity.routes.js';
import subscriptionRoutes from './subscription.routes.js';
import drawRoutes from './draw.routes.js';
import adminRoutes from './admin.routes.js';

const mountApiRoutes = (app, basePath) => {
  app.use(`${basePath}/auth`, authRoutes);
  app.use(`${basePath}/scores`, scoreRoutes);
  app.use(`${basePath}/charities`, charityRoutes);
  app.use(`${basePath}/subscriptions`, subscriptionRoutes);
  app.use(`${basePath}/draws`, drawRoutes);
  app.use(`${basePath}/admin`, adminRoutes);
};

export const registerRoutes = (app, { webhookMiddleware, handleWebhook, healthHandler }) => {
  // Keep /api for existing clients and /api/v1 for versioned production contracts.
  app.post('/api/subscriptions/webhook', webhookMiddleware, handleWebhook);
  app.post('/api/v1/subscriptions/webhook', webhookMiddleware, handleWebhook);
  app.get('/api/health', healthHandler);
  app.get('/api/v1/health', healthHandler);

  mountApiRoutes(app, '/api');
  mountApiRoutes(app, '/api/v1');
};
