import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import connectDB from './config/db.js';

// Routes
import authRoutes from './routes/auth.routes.js';
import scoreRoutes from './routes/score.routes.js';
import charityRoutes from './routes/charity.routes.js';
import subscriptionRoutes from './routes/subscription.routes.js';
import drawRoutes from './routes/draw.routes.js';
import adminRoutes from './routes/admin.routes.js';

// Controller for standalone webhook usage
import { handleWebhook } from './controllers/subscription.controller.js';

const app = express();

connectDB();

app.use(helmet());
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

const isOriginAllowed = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.includes('*')) return true;
  return allowedOrigins.some(allowed => allowed.toLowerCase() === origin.toLowerCase());
};

app.use(cors({
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      // Return the exact request origin to avoid comma-joined values.
      return callback(null, origin || true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('dev'));

// Webhook needs raw body - MUST be before express.json()
app.post('/api/subscriptions/webhook', express.raw({ type: 'application/json' }), handleWebhook);

app.use(express.json());

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
