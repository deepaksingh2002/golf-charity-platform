import User from '../models/User.model.js';
import Subscription from '../models/Subscription.model.js';
import * as stripeService from '../services/stripe.service.js';
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const resolvePriceId = (plan, explicitPriceId) => {
  if (explicitPriceId) return explicitPriceId;
  if (plan === 'yearly') return process.env.STRIPE_YEARLY_PRICE_ID;
  return process.env.STRIPE_MONTHLY_PRICE_ID;
};

export const createCheckoutSession = async (req, res) => {
  try {
    const { priceId, plan } = req.body;
    const selectedPlan = plan || (priceId && priceId.toLowerCase().includes('year') ? 'yearly' : 'monthly');
    const resolvedPriceId = resolvePriceId(selectedPlan, priceId);
    let user = await User.findById(req.user._id);

    const hasRealStripeKey = Boolean(process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('placeholder'));
    const allowMockStripe = process.env.NODE_ENV !== 'production' && !hasRealStripeKey;
    if (allowMockStripe) {
      const now = Date.now();
      const days = selectedPlan === 'yearly' ? 365 : 30;
      user.subscriptionStatus = 'active';
      user.subscriptionPlan = selectedPlan;
      user.subscriptionRenewDate = new Date(now + days * 24 * 60 * 60 * 1000);
      user.stripeSubscriptionId = 'mock_sub_' + now;
      await user.save();
      return res.json({ success: true, mocked: true, plan: selectedPlan, message: 'Subscription activated (test mode)' });
    }

    if (!resolvedPriceId) {
      return res.status(400).json({
        message: `Missing Stripe price for ${selectedPlan} plan. Set STRIPE_${selectedPlan.toUpperCase()}_PRICE_ID on the backend.`
      });
    }

    if (!hasRealStripeKey) {
      return res.status(500).json({
        message: 'Stripe is not configured for production. Set STRIPE_SECRET_KEY before enabling subscriptions.'
      });
    }

    if (!user.stripeCustomerId) {
      const customer = await stripeService.createCustomer(user.email, user.name);
      user.stripeCustomerId = customer.id;
      await user.save();
    }

    const subscription = await stripeService.createSubscription(user.stripeCustomerId, resolvedPriceId);
    
    user.stripeSubscriptionId = subscription.id;
    user.subscriptionPlan = selectedPlan;
    await user.save();

    res.json({
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      plan: selectedPlan
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const cancelSubscription = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.stripeSubscriptionId) {
      return res.status(400).json({ message: 'No active subscription found' });
    }

    if (!user.stripeSubscriptionId.startsWith('mock_sub_')) {
      await stripeService.cancelSubscription(user.stripeSubscriptionId);
    }
    
    user.subscriptionStatus = 'cancelled';
    await user.save();

    await Subscription.findOneAndUpdate(
      { stripeSubscriptionId: user.stripeSubscriptionId },
      { status: 'cancelled' }
    );

    res.json({ message: 'Subscription cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSubscriptionStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.stripeSubscriptionId) {
      return res.json({ status: 'inactive' });
    }
    
    if (user.stripeSubscriptionId.startsWith('mock_sub_')) {
      return res.json({
        status: user.subscriptionStatus,
        subscriptionPlan: user.subscriptionPlan,
        renewDate: user.subscriptionRenewDate,
        stripeData: {
          current_period_end: user.subscriptionRenewDate ? Math.floor(user.subscriptionRenewDate.getTime() / 1000) : null,
          cancel_at_period_end: false,
          status: 'active'
        }
      });
    }

    const subscription = await stripeService.getSubscription(user.stripeSubscriptionId);
    res.json({
      status: user.subscriptionStatus,
      subscriptionPlan: user.subscriptionPlan,
      renewDate: user.subscriptionRenewDate,
      stripeData: {
        current_period_end: subscription.current_period_end,
        cancel_at_period_end: subscription.cancel_at_period_end,
        status: subscription.status
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    const data = event.data.object;

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const plan = data.items?.data?.[0]?.price?.recurring?.interval === 'year' ? 'yearly' : 'monthly';
        const subscriptionRenewDate = data.current_period_end ? new Date(data.current_period_end * 1000) : undefined;

        const user = await User.findOneAndUpdate(
          { stripeCustomerId: data.customer },
          {
            subscriptionStatus: data.status === 'active' ? 'active' : 'inactive',
            stripeSubscriptionId: data.id,
            subscriptionPlan: plan,
            ...(subscriptionRenewDate && { subscriptionRenewDate })
          },
          { new: true }
        );

        if (user) {
          await Subscription.findOneAndUpdate(
            { stripeSubscriptionId: data.id },
            {
              userId: user._id,
              stripeSubscriptionId: data.id,
              stripeCustomerId: data.customer,
              stripePriceId: data.items?.data?.[0]?.price?.id,
              plan,
              status: data.status === 'active' ? 'active' : 'past_due',
              currentPeriodStart: data.current_period_start ? new Date(data.current_period_start * 1000) : undefined,
              currentPeriodEnd: subscriptionRenewDate
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
          );
        }
        break;
      }
      case 'customer.subscription.deleted': {
        await User.findOneAndUpdate(
          { stripeCustomerId: data.customer },
          { subscriptionStatus: 'cancelled' }
        );
        await Subscription.findOneAndUpdate(
          { stripeSubscriptionId: data.id },
          { status: 'cancelled' }
        );
        break;
      }
      case 'invoice.payment_succeeded': {
        if (data.subscription) {
          const renewDate = data.lines?.data?.[0]?.period?.end ? new Date(data.lines.data[0].period.end * 1000) : undefined;
          await User.findOneAndUpdate(
            { stripeCustomerId: data.customer },
            {
              subscriptionStatus: 'active',
              ...(renewDate && { subscriptionRenewDate: renewDate })
            }
          );
        }
        break;
      }
      case 'invoice.payment_failed': {
        if (data.subscription) {
          await User.findOneAndUpdate(
            { stripeCustomerId: data.customer },
            { subscriptionStatus: 'lapsed' }
          );
          await Subscription.findOneAndUpdate(
            { stripeSubscriptionId: data.subscription },
            { status: 'past_due' }
          );
        }
        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
