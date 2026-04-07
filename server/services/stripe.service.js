import Stripe from 'stripe';
import { ApiError } from '../utils/apiError.js';

let stripeClient = null;

const getStripeClient = () => {
  if (stripeClient) return stripeClient;

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new ApiError(500, 'Stripe secret key is not configured');
  }

  stripeClient = new Stripe(secretKey);
  return stripeClient;
};

export const createCustomer = async (email, name) => {
  return getStripeClient().customers.create({ email, name });
};

export const createSubscription = async (customerId, priceId) => {
  return getStripeClient().subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    expand: ['latest_invoice.payment_intent'],
  });
};

export const cancelSubscription = async (stripeSubscriptionId) => {
  return getStripeClient().subscriptions.update(stripeSubscriptionId, {
    cancel_at_period_end: true,
  });
};

export const getSubscription = async (stripeSubscriptionId) => {
  return getStripeClient().subscriptions.retrieve(stripeSubscriptionId);
};
