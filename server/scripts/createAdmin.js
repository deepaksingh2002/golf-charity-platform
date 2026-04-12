import 'dotenv/config';
import mongoose from 'mongoose';
import { bootstrapAdminUser } from '../services/adminBootstrap.service.js';

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
    const result = await bootstrapAdminUser();
    if (result.status === 'skipped') {
      throw new Error(result.reason);
    }

    console.log(`Admin ${result.status}: ${result.email}`);
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    process.exit(process.exitCode || 0);
  }
};

run();
