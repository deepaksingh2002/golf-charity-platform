import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoConnectionString = process.env.MONGO_CONNECTION_STRING;
    const dbName = process.env.MONGO_DB_NAME;

    if (!mongoConnectionString) {
      throw new Error('MONGO_CONNECTION_STRING is required');
    }

    if (!dbName) {
      throw new Error('MONGO_DB_NAME is required');
    }

    const connectInstance = await mongoose.connect(mongoConnectionString, {
      dbName,
    });

    console.log(`MongoDB connected!! DB_HOST: ${connectInstance.connection.host}`);
    return connectInstance;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB;
