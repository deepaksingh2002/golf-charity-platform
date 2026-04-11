import Stripe from 'stripe';
import User from '../models/User.model.js';
import Subscription from '../models/Subscription.model.js';
import * as stripeService from '../services/stripe.service.js';
import { ApiError } from '../utils/apiError.js';
import { sendApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

let stripeWebhookClient = null;

const getStripeWebhookClient = () => {
  if (stripeWebhookClient) return stripeWebhookClient;

  if (!process.env.STRIPE_SECRET_KEY) {
    throw new ApiError(500, 'Stripe secret key is not configured');
  }

  stripeWebhookClient = new Stripe(process.env.STRIPE_SECRET_KEY);
  return stripeWebhookClient;
};

const SUPPORTED_PLANS = ['monthly', 'yearly'];

const getUserOrThrow = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found');
  return user;
};

const isPlaceholderValue = (value) => !value || String(value).toLowerCase().includes('placeholder');

const resolvePriceId = (plan, explicitPriceId) => {
  if (explicitPriceId) return explicitPriceId;
  if (plan === 'yearly') return process.env.STRIPE_YEARLY_PRICE_ID;
  return process.env.STRIPE_MONTHLY_PRICE_ID;
};

const resolveSelectedPlan = (plan, priceId) => {
  const inferredPlan = priceId && priceId.toLowerCase().includes('year') ? 'yearly' : 'monthly';
  const selectedPlan = (plan || inferredPlan).toLowerCase();

  if (!SUPPORTED_PLANS.includes(selectedPlan)) {
    throw new ApiError(400, "Plan must be either 'monthly' or 'yearly'");
  }

  return selectedPlan;
};

const buildSubscriptionStatusPayload = (user, subscription = null) => {
  if (subscription) {
    return {
      status: mapStripeStatusToUserStatus(subscription.status),
      subscriptionPlan: user.subscriptionPlan,
      renewDate: user.subscriptionRenewDate,
      stripeData: {
        current_period_end: subscription.current_period_end,
        cancel_at_period_end: subscription.cancel_at_period_end,
        status: subscription.status,
      },
    };
  }

  return {
    status: user.subscriptionStatus,
    subscriptionPlan: user.subscriptionPlan,
    renewDate: user.subscriptionRenewDate,
    stripeData: {
      current_period_end: user.subscriptionRenewDate
        ? Math.floor(user.subscriptionRenewDate.getTime() / 1000)
        : null,
      cancel_at_period_end: user.subscriptionStatus === 'cancelled',
      status: mapUserStatusToMockStripeStatus(user.subscriptionStatus),
    },
  };
};

const getRenewDateFromUnix = (timestamp) => (timestamp ? new Date(timestamp * 1000) : undefined);

const getMockSubscriptionStatus = (user) => buildSubscriptionStatusPayload(user);

const mapStripeStatusToUserStatus = (status) => {
  if (status === 'active' || status === 'trialing') return 'active';
  if (status === 'past_due' || status === 'unpaid') return 'lapsed';
  if (status === 'canceled') return 'cancelled';
  return 'inactive';
};

const mapStripeStatusToSubscriptionStatus = (status) => {
  if (status === 'active' || status === 'trialing') return 'active';
  if (status === 'past_due' || status === 'unpaid') return 'past_due';
  if (status === 'canceled') return 'cancelled';
  if (status === 'lapsed') return 'lapsed';
  return 'inactive';
};

const mapUserStatusToMockStripeStatus = (status) => {
  if (status === 'active') return 'active';
  if (status === 'cancelled') return 'canceled';
  if (status === 'lapsed') return 'past_due';
  return 'inactive';
};

const parseWebhookBody = (body) => {
  if (Buffer.isBuffer(body)) return JSON.parse(body.toString('utf8'));
  if (typeof body === 'string') return JSON.parse(body);
  return body;
};

export const createCheckoutSession = asyncHandler(async (req, res) => {
  const { priceId, plan } = req.body;
  const selectedPlan = resolveSelectedPlan(plan, priceId);
  const resolvedPriceId = resolvePriceId(selectedPlan, priceId);
  const user = await getUserOrThrow(req.user._id);

  const hasRealStripeKey = !isPlaceholderValue(process.env.STRIPE_SECRET_KEY);
  const hasRequiredPriceId = !isPlaceholderValue(
    selectedPlan === 'yearly'
      ? process.env.STRIPE_YEARLY_PRICE_ID
      : process.env.STRIPE_MONTHLY_PRICE_ID
  );
  const allowMockStripe =
    process.env.NODE_ENV !== 'production' && (!hasRealStripeKey || !hasRequiredPriceId);
  if (allowMockStripe) {
    const now = Date.now();
    const days = selectedPlan === 'yearly' ? 365 : 30;
    user.subscriptionStatus = 'active';
    user.subscriptionPlan = selectedPlan;
    user.subscriptionRenewDate = new Date(now + days * 24 * 60 * 60 * 1000);
    user.stripeSubscriptionId = `mock_sub_${now}`;
    await user.save();
    return sendApiResponse(
      res,
      200,
      { mocked: true, plan: selectedPlan },
      'Subscription activated (test mode)',
      { legacy: true }
    );
  }

  if (!resolvedPriceId) {
    throw new ApiError(
      400,
      `Missing Stripe price for ${selectedPlan} plan. Set STRIPE_${selectedPlan.toUpperCase()}_PRICE_ID on the backend, or use test mode without Stripe config.`
    );
  }

  if (!hasRealStripeKey) {
    throw new ApiError(
      500,
      'Stripe is not configured for production. Set STRIPE_SECRET_KEY before enabling subscriptions.'
    );
  }

  if (!user.stripeCustomerId) {
    const customer = await stripeService.createCustomer(user.email, user.name);
    user.stripeCustomerId = customer.id;
    await user.save();
  }

  const subscription = await stripeService.createSubscription(
    user.stripeCustomerId,
    resolvedPriceId
  );

  const clientSecret = subscription?.latest_invoice?.payment_intent?.client_secret;
  if (!clientSecret) {
    throw new ApiError(502, 'Stripe did not return a payment intent client secret');
  }

  user.stripeSubscriptionId = subscription.id;
  user.subscriptionPlan = selectedPlan;
  await user.save();

  sendApiResponse(
    res,
    200,
    {
      subscriptionId: subscription.id,
      clientSecret,
      plan: selectedPlan,
    },
    'Checkout session created successfully',
    { legacy: true }
  );
});

export const cancelSubscription = asyncHandler(async (req, res) => {
  const user = await getUserOrThrow(req.user._id);
  if (!user.stripeSubscriptionId) throw new ApiError(400, 'No active subscription found');

  const isMockSubscription = user.stripeSubscriptionId.startsWith('mock_sub_');

  if (!isMockSubscription) {
    await stripeService.cancelSubscription(user.stripeSubscriptionId);
  }

  // Stripe cancellations are set to period-end in this API, so access remains active until renewal date.
  user.subscriptionStatus = isMockSubscription ? 'cancelled' : 'active';
  if (isMockSubscription) {
    user.subscriptionRenewDate = null;
  }
  await user.save();

  await Subscription.findOneAndUpdate(
    { stripeSubscriptionId: user.stripeSubscriptionId },
    { status: isMockSubscription ? 'cancelled' : 'active' }
  );

  const statusPayload = isMockSubscription
    ? buildSubscriptionStatusPayload(user)
    : {
        ...buildSubscriptionStatusPayload(user),
        stripeData: {
          current_period_end: user.subscriptionRenewDate
            ? Math.floor(user.subscriptionRenewDate.getTime() / 1000)
            : null,
          cancel_at_period_end: true,
          status: 'active',
        },
      };

  sendApiResponse(res, 200, statusPayload, 'Subscription cancelled successfully', { legacy: true });
});

export const getSubscriptionStatus = asyncHandler(async (req, res) => {
  const user = await getUserOrThrow(req.user._id);
  if (!user.stripeSubscriptionId) {
    return sendApiResponse(
      res,
      200,
      { status: 'inactive' },
      'Subscription status loaded successfully',
      { legacy: true }
    );
  }

  if (user.stripeSubscriptionId.startsWith('mock_sub_')) {
    return sendApiResponse(
      res,
      200,
      getMockSubscriptionStatus(user),
      'Subscription status loaded successfully',
      { legacy: true }
    );
  }

  const subscription = await stripeService.getSubscription(user.stripeSubscriptionId);

  const effectiveStatus = mapStripeStatusToUserStatus(subscription.status);
  if (user.subscriptionStatus !== effectiveStatus) {
    user.subscriptionStatus = effectiveStatus;
    if (subscription.current_period_end) {
      user.subscriptionRenewDate = getRenewDateFromUnix(subscription.current_period_end);
    }
    await user.save();
  }

  sendApiResponse(
    res,
    200,
    buildSubscriptionStatusPayload(user, subscription),
    'Subscription status loaded successfully',
    { legacy: true }
  );
});

export const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    const allowInsecureWebhookTest =
      process.env.NODE_ENV !== 'production' &&
      process.env.ALLOW_INSECURE_WEBHOOK_TEST === 'true' &&
      req.headers['x-webhook-test'] === 'true';

    if (allowInsecureWebhookTest) {
      event = parseWebhookBody(req.body);
    } else {
      const rawPayload =
        Buffer.isBuffer(req.body) || typeof req.body === 'string'
          ? req.body
          : req.rawBody;

      if (!rawPayload) {
        throw new Error('Missing raw webhook body for signature verification');
      }

      event = getStripeWebhookClient().webhooks.constructEvent(
        rawPayload,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    }
  } catch (err) {
    console.error('Webhook signature failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    const data = event.data.object;

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const stripeStatus = data.status;
        const plan =
          data.items?.data?.[0]?.price?.recurring?.interval === 'year' ? 'yearly' : 'monthly';
        const subscriptionRenewDate = getRenewDateFromUnix(data.current_period_end);

        const user = await User.findOneAndUpdate(
          { stripeCustomerId: data.customer },
          {
            subscriptionStatus: mapStripeStatusToUserStatus(stripeStatus),
            stripeSubscriptionId: data.id,
            subscriptionPlan: plan,
            ...(subscriptionRenewDate && { subscriptionRenewDate }),
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
              status: mapStripeStatusToSubscriptionStatus(stripeStatus),
              currentPeriodStart: getRenewDateFromUnix(data.current_period_start),
              currentPeriodEnd: subscriptionRenewDate,
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
          const renewDate = getRenewDateFromUnix(data.lines?.data?.[0]?.period?.end);
          await User.findOneAndUpdate(
            { stripeCustomerId: data.customer },
            {
              subscriptionStatus: 'active',
              ...(renewDate && { subscriptionRenewDate: renewDate }),
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
