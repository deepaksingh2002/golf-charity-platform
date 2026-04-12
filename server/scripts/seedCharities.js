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
    const mongoConnectionString = process.env.MONGO_CONNECTION_STRING;
    const dbName = process.env.MONGO_DB_NAME;

    if (!mongoConnectionString) {
      throw new Error('MONGO_CONNECTION_STRING is required');
    }

    if (!dbName) {
      throw new Error('MONGO_DB_NAME is required');
    }

    await mongoose.connect(mongoConnectionString, { dbName });
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
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    process.exit(process.exitCode || 0);
  }
};

run();
