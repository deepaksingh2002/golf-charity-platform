import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { 
    type: String,
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true 

  },
  password: { 
    type: String, 
    required: true, 
    select: false 

  },
  refreshToken: {
    type: String,
    select: false,
  },
  role: { 
    type: String, 
    enum: ['user', 'admin'], 
    default: 'user',
    required: true
  },
  subscriptionStatus: { 
    type: String, 
    enum: ['active', 'inactive', 'lapsed', 'cancelled'], 
    default: 'inactive' 

  },
  subscriptionPlan: { 
    type: String, 
    enum: ['monthly', 'yearly', null], 
    default: null 

  },
  stripeCustomerId: { 
    type: String 

  },
  stripeSubscriptionId: { 
    type: String 
  },
  subscriptionRenewDate: { 
    type: Date 
  },
  selectedCharity: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Charity', 
    default: null 
  },
  charityPercentage: { 
    type: Number, 
    min: 10, 
    max: 100, 
    default: 10 
  },
  scores: {
    type: [{
      value: { type: Number, min: 1, max: 45 },
      date: { type: Date }
    }],
    default: [],
    validate: [arrayLimit, '{PATH} exceeds the limit of 5']
  },
  totalWinnings: { 
    type: Number, 
    default: 0 

  },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid'], 
    default: 'pending' 
  }
}, {
  timestamps: true
});

function arrayLimit(val) {
  if (!val) return true;
  return val.length <= 5;
}

userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function(candidate) {
  return await bcrypt.compare(candidate, this.password);
};

userSchema.methods.isPasswordCorrect = async function(password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function() {
  const accessSecret = process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET;

  return jwt.sign(
    {
      _id: this._id,
      id: this._id,
      email: this.email,
      role: this.role,
      name: this.name,
    },
    accessSecret,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '7d',
    }
  );
};

userSchema.methods.generateRefreshToken = function() {
  return jwt.sign(
    {
      _id: this._id,
      id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '30d',
    }
  );
};

export default mongoose.model('User', userSchema);
