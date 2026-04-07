import mongoose from 'mongoose';

const globalForMongoose = globalThis;

if (!globalForMongoose.mongoose) {
  globalForMongoose.mongoose = { conn: null, promise: null };
}

const cached = globalForMongoose.mongoose;

const connectDB = async () => {
  try {
    if (cached.conn) {
      return cached.conn;
    }

    if (!cached.promise) {
      if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI is required');
      }

      cached.promise = mongoose.connect(process.env.MONGO_URI).then((conn) => conn);
    }

    cached.conn = await cached.promise;
    console.log(`MongoDB connected: ${cached.conn.connection.host}`);
    return cached.conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
