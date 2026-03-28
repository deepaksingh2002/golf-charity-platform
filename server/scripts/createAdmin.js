import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.model.js';

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const email = 'admin@golfcharity.com';
    const password = 'Admin1234!';
    const existing = await User.findOne({ email }).select('+password');

    if (existing) {
      existing.name = 'Platform Admin';
      existing.role = 'admin';
      existing.subscriptionStatus = 'active';
      existing.password = password;
      await existing.save();
      console.log('Admin updated: admin@golfcharity.com / Admin1234!');
      return;
    }

    await User.create({
      name: 'Platform Admin',
      email,
      password,
      role: 'admin',
      subscriptionStatus: 'active'
    });
    console.log('Admin created: admin@golfcharity.com / Admin1234!');
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

run();
