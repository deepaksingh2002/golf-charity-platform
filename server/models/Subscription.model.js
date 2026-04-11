import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId,
     ref: 'User', 
     required: true, 
     index: true 
    },

    stripeSubscriptionId: {
     type: String 
    },

  stripeCustomerId: { 
    type: String 
  },

  stripePriceId: { 
    type: String 
  },

  plan: { 
    type: String, 
    enum: ['monthly', 'yearly', null], 
    default: null 
  },

  status: { 
    type: String, 
    enum: ['active', 'inactive', 'cancelled', 'past_due', 'lapsed'], 
    default: 'inactive', 
    index: true 
  },

  currentPeriodStart: { 
    type: Date 
  },
  currentPeriodEnd: { 
    type: Date 
  },
  charityContribution: { 
    type: Number, 
    min: 0, 
    default: 0 
  },
  prizePoolContribution: { 
    type: Number, 
    min: 0, 
    default: 0 
  }
}, {
  timestamps: true
});

subscriptionSchema.index({ stripeSubscriptionId: 1 });
subscriptionSchema.index({ stripeCustomerId: 1 });

export default mongoose.model('Subscription', subscriptionSchema);
