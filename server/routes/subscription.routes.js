import express from 'express';
import { createCheckoutSession, cancelSubscription, getSubscriptionStatus, handleWebhook } from '../controllers/subscription.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/subscribe', protect, createCheckoutSession);
router.post('/cancel', protect, cancelSubscription);
router.get('/status', protect, getSubscriptionStatus);

// Stripe needs raw body for webhook signature verification
router.post('/webhook', express.raw({ type: 'application/json' }), (req, res, next) => {
  req.rawBody = req.body;
  next();
}, handleWebhook);

export default router;
