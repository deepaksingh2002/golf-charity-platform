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
  const stripe = getStripeClient();

  const item =
    typeof priceId === 'string'
      ? { price: priceId }
      : await (async () => {
          const product = await stripe.products.create({
            name: priceId.productName || 'Golf Charity Subscription',
          });

          return {
          price_data: {
            currency: priceId.currency || 'usd',
            product: product.id,
            unit_amount: priceId.unitAmount,
            recurring: {
              interval: priceId.interval,
            },
          },
        };
        })();

  return stripe.subscriptions.create({
    customer: customerId,
    items: [item],
    payment_behavior: 'default_incomplete',
    expand: ['latest_invoice.payment_intent', 'latest_invoice.confirmation_secret'],
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
