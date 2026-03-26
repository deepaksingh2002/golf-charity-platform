import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCustomer = async (email, name) => {
  return await stripe.customers.create({ email, name });
};

export const createSubscription = async (customerId, priceId) => {
  return await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    expand: ['latest_invoice.payment_intent'],
  });
};

export const cancelSubscription = async (stripeSubscriptionId) => {
  return await stripe.subscriptions.update(stripeSubscriptionId, {
    cancel_at_period_end: true,
  });
};

export const getSubscription = async (stripeSubscriptionId) => {
  return await stripe.subscriptions.retrieve(stripeSubscriptionId);
};
