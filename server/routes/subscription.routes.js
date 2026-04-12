import express from 'express';
import {
	createCheckoutSession,
	cancelSubscription,
	getSubscriptionStatus,
	getSubscriptionConfigStatus,
} from '../controllers/subscription.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/subscribe', protect, createCheckoutSession);
router.post('/cancel', protect, cancelSubscription);
router.get('/status', protect, getSubscriptionStatus);
router.get('/config-status', protect, getSubscriptionConfigStatus);

export default router;
