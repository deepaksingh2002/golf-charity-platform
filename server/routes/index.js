import authRoutes from './auth.routes.js';
import scoreRoutes from './score.routes.js';
import charityRoutes from './charity.routes.js';
import subscriptionRoutes from './subscription.routes.js';
import drawRoutes from './draw.routes.js';
import adminRoutes from './admin.routes.js';

export const registerRoutes = (app, { webhookMiddleware, handleWebhook, healthHandler }) => {
  app.post('/api/subscriptions/webhook', webhookMiddleware, handleWebhook);
  app.get('/api/health', healthHandler);

  app.use('/api/auth', authRoutes);
  app.use('/api/scores', scoreRoutes);
  app.use('/api/charities', charityRoutes);
  app.use('/api/subscriptions', subscriptionRoutes);
  app.use('/api/draws', drawRoutes);
  app.use('/api/admin', adminRoutes);
};
