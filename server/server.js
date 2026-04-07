import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import connectDB from './config/db.js';

import authRoutes from './routes/auth.routes.js';
import scoreRoutes from './routes/score.routes.js';
import charityRoutes from './routes/charity.routes.js';
import subscriptionRoutes from './routes/subscription.routes.js';
import drawRoutes from './routes/draw.routes.js';
import adminRoutes from './routes/admin.routes.js';

import { handleWebhook } from './controllers/subscription.controller.js';

const app = express();

app.set('trust proxy', 1);

connectDB();

const normalizeOrigin = (value) => value?.trim().replace(/\/+$/, '').toLowerCase();

const parseOrigins = (...values) =>
  [...new Set(
    values
      .filter(Boolean)
      .flatMap(value => String(value).split(','))
      .map(origin => origin.trim())
      .filter(Boolean)
      .map(origin => normalizeOrigin(origin))
  )];

const allowedOrigins = parseOrigins(
  process.env.CORS_ORIGINS,
  ...(process.env.NODE_ENV !== 'production'
    ? ['http://localhost:5173']
    : [])
);

const isOriginAllowed = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.includes('*')) return true;

  const normalizedOrigin = normalizeOrigin(origin);
  if (allowedOrigins.some(allowed => normalizeOrigin(allowed) === normalizedOrigin)) {
    return true;
  }

  // Optional Vercel support for preview and production frontends.
  if (process.env.ALLOW_VERCEL_PREVIEWS === 'true' && normalizedOrigin.endsWith('.vercel.app')) {
    return true;
  }

  const vercelProject = process.env.VERCEL_PROJECT_NAME?.trim().toLowerCase();
  if (vercelProject && normalizedOrigin === `https://${vercelProject}.vercel.app`) {
    return true;
  }

  return false;
};

const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      return callback(null, origin || true);
    }
    console.log('CORS blocked origin:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.use(helmet());
app.use(morgan('dev'));

app.post('/api/subscriptions/webhook', express.raw({ type: 'application/json' }), handleWebhook);

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    port: process.env.PORT,
    mongoConnected: mongoose.connection.readyState === 1
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/scores', scoreRoutes);
app.use('/api/charities', charityRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/draws', drawRoutes);
app.use('/api/admin', adminRoutes);

app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'Endpoint not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server on port ${PORT}`));
