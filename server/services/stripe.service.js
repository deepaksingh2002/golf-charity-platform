const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const createCustomer = async (email, name) => {
  return await stripe.customers.create({ email, name });
};

const createSubscription = async (customerId, priceId) => {
  return await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    expand: ['latest_invoice.payment_intent'],
  });
};

const cancelSubscription = async (stripeSubscriptionId) => {
  return await stripe.subscriptions.update(stripeSubscriptionId, {
    cancel_at_period_end: true,
  });
};

const getSubscription = async (stripeSubscriptionId) => {
  return await stripe.subscriptions.retrieve(stripeSubscriptionId);
};

module.exports = { createCustomer, createSubscription, cancelSubscription, getSubscription };
