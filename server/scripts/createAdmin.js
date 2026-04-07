import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.model.js';

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const email = process.env.ADMIN_EMAIL || 'admin@golfcharity.com';
    const password = process.env.ADMIN_PASSWORD;

    if (!password) {
      throw new Error('ADMIN_PASSWORD is required to create or update the admin user.');
    }

    const existing = await User.findOne({ email }).select('+password');

    if (existing) {
      existing.name = 'Platform Admin';
      existing.role = 'admin';
      existing.subscriptionStatus = 'active';
      existing.password = password;
      await existing.save();
      console.log(`Admin updated: ${email}`);
      return;
    }

    await User.create({
      name: 'Platform Admin',
      email,
      password,
      role: 'admin',
      subscriptionStatus: 'active'
    });
    console.log(`Admin created: ${email}`);
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    process.exit(process.exitCode || 0);
  }
};

run();
