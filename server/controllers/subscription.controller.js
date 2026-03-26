import User from '../models/User.model.js';
import Subscription from '../models/Subscription.model.js';
import * as stripeService from '../services/stripe.service.js';
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res) => {
  try {
    const { priceId, plan } = req.body;
    const selectedPlan = plan || (priceId && priceId.toLowerCase().includes('year') ? 'yearly' : 'monthly');
    let user = await User.findById(req.user._id);

    const isMockStripe = !process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('placeholder');
    const allowDevMock = process.env.NODE_ENV === 'development' && !priceId && plan;
    if (isMockStripe || allowDevMock) {
      const now = Date.now();
      const days = selectedPlan === 'yearly' ? 365 : 30;
      user.subscriptionStatus = 'active';
      user.subscriptionPlan = selectedPlan;
      user.subscriptionRenewDate = new Date(now + days * 24 * 60 * 60 * 1000);
      await user.save();
      return res.json({ success: true, mocked: true, message: 'Subscription activated (test mode)' });
    }

    if (!priceId) {
      return res.status(400).json({ message: 'priceId is required for Stripe checkout' });
    }

    if (!user.stripeCustomerId) {
      const customer = await stripeService.createCustomer(user.email, user.name);
      user.stripeCustomerId = customer.id;
      await user.save();
    }

    const subscription = await stripeService.createSubscription(user.stripeCustomerId, priceId);
    
    user.stripeSubscriptionId = subscription.id;
    await user.save();

    res.json({
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
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

    await stripeService.cancelSubscription(user.stripeSubscriptionId);
    
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
    const payload = req.rawBody || req.body;
    event = stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    const data = event.data.object;

    switch (event.type) {
      case 'customer.subscription.created': {
        const user = await User.findOne({ stripeCustomerId: data.customer });
        if (user) {
          user.subscriptionStatus = 'active';
          user.stripeSubscriptionId = data.id;
          await user.save();

          await Subscription.create({
            userId: user._id,
            stripeSubscriptionId: data.id,
            stripeCustomerId: data.customer,
            stripePriceId: data.items.data[0].price.id,
            plan: data.items.data[0].price.recurring.interval === 'year' ? 'yearly' : 'monthly',
            status: data.status,
            currentPeriodStart: new Date(data.current_period_start * 1000),
            currentPeriodEnd: new Date(data.current_period_end * 1000)
          });
        }
        break;
      }
      case 'customer.subscription.updated': {
        const sub = await Subscription.findOne({ stripeSubscriptionId: data.id });
        if (sub) {
          sub.status = data.status;
          sub.currentPeriodStart = new Date(data.current_period_start * 1000);
          sub.currentPeriodEnd = new Date(data.current_period_end * 1000);
          await sub.save();
        }
        
        const user = await User.findOne({ stripeCustomerId: data.customer });
        if (user) {
          user.subscriptionStatus = data.status === 'active' ? 'active' : 'inactive';
          await user.save();
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const user = await User.findOne({ stripeCustomerId: data.customer });
        if (user) {
          user.subscriptionStatus = 'lapsed';
          await user.save();
        }
        await Subscription.findOneAndUpdate(
          { stripeSubscriptionId: data.id },
          { status: 'lapsed' }
        );
        break;
      }
      case 'invoice.payment_succeeded': {
        if (data.subscription) {
          const user = await User.findOne({ stripeCustomerId: data.customer });
          if (user) {
            user.subscriptionRenewDate = new Date(data.lines.data[0].period.end * 1000);
            await user.save();
          }
        }
        break;
      }
      case 'invoice.payment_failed': {
        if (data.subscription) {
          const user = await User.findOne({ stripeCustomerId: data.customer });
          if (user) {
            user.subscriptionStatus = 'lapsed';
            await user.save();
          }
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
