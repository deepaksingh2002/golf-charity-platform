import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  subscriptionStatus: { type: String, enum: ['active', 'inactive', 'lapsed', 'cancelled'], default: 'inactive' },
  subscriptionPlan: { type: String, enum: ['monthly', 'yearly', null], default: null },
  stripeCustomerId: { type: String },
  stripeSubscriptionId: { type: String },
  subscriptionRenewDate: { type: Date },
  selectedCharity: { type: mongoose.Schema.Types.ObjectId, ref: 'Charity' },
  charityPercentage: { type: Number, min: 10, max: 100, default: 10 },
  scores: {
    type: [{
      value: { type: Number, min: 1, max: 45 },
      date: { type: Date }
    }],
    validate: [arrayLimit, '{PATH} exceeds the limit of 5']
  },
  totalWinnings: { type: Number, default: 0 },
  paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' }
}, {
  timestamps: true
});

function arrayLimit(val) {
  return val.length <= 5;
}

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidate) {
  return await bcrypt.compare(candidate, this.password);
};

export default mongoose.model('User', userSchema);
