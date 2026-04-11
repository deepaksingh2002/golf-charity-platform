import mongoose from 'mongoose';

export const getHealthStatus = (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    port: process.env.PORT,
    mongoConnected: mongoose.connection.readyState === 1,
  });
};
