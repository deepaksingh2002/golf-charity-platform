const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  stripeSubscriptionId: { type: String },
  stripeCustomerId: { type: String },
  stripePriceId: { type: String },
  plan: { type: String, enum: ['monthly', 'yearly'] },
  status: { type: String, enum: ['active', 'cancelled', 'past_due', 'lapsed'] },
  currentPeriodStart: { type: Date },
  currentPeriodEnd: { type: Date },
  charityContribution: { type: Number },
  prizePoolContribution: { type: Number }
}, {
  timestamps: true
});

module.exports = mongoose.model('Subscription', subscriptionSchema);
