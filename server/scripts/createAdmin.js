import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.model.js';

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const existing = await User.findOne({ email: 'admin@golfcharity.com' });
    if (existing) {
      console.log('Admin exists');
      return;
    }
    await User.create({
      name: 'Platform Admin',
      email: 'admin@golfcharity.com',
      password: 'Admin1234!',
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
