import 'dotenv/config';
import mongoose from 'mongoose';
import Charity from '../models/Charity.model.js';

const charities = [
  { name: 'Golf for Kids', description: 'Teaching underprivileged children golf', isFeatured: true, isActive: true },
  { name: 'Green Fairways Foundation', description: 'Environmental conservation through golf', isFeatured: false, isActive: true },
  { name: 'Stroke of Luck', description: 'Supporting cancer research via golf events', isFeatured: false, isActive: true }
];

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    for (const charity of charities) {
      await Charity.findOneAndUpdate(
        { name: charity.name },
        { $set: charity },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
    console.log('Charities seeded or updated');
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

run();
