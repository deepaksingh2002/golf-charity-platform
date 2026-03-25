const express = require('express');
const { createCheckoutSession, cancelSubscription, getSubscriptionStatus, handleWebhook } = require('../controllers/subscription.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/subscribe', protect, createCheckoutSession);
router.post('/cancel', protect, cancelSubscription);
router.get('/status', protect, getSubscriptionStatus);

// Stripe needs raw body for webhook signature verification
router.post('/webhook', express.raw({ type: 'application/json' }), (req, res, next) => {
  req.rawBody = req.body;
  next();
}, handleWebhook);

module.exports = router;
