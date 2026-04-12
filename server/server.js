import app from './app.js';
import connectDB from './config/db.js';
import mongoose from 'mongoose';
import { bootstrapAdminUser } from './services/adminBootstrap.service.js';

const PORT = process.env.PORT || 10000;
let server;

const shutdown = async (signal) => {
  try {
    console.log(`${signal} received, shutting down gracefully...`);

    if (server) {
      await new Promise((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Graceful shutdown failed:', error);
    process.exit(1);
  }
};

const startServer = async () => {
  await connectDB();

  if (process.env.NODE_ENV !== 'test') {
    const adminBootstrapResult = await bootstrapAdminUser();
    if (adminBootstrapResult.status === 'skipped') {
      console.warn(`[ADMIN_BOOTSTRAP] ${adminBootstrapResult.reason}`);
    } else {
      console.log(`[ADMIN_BOOTSTRAP] ${adminBootstrapResult.status}`);
    }
  }

  server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

process.on('SIGTERM', () => {
  shutdown('SIGTERM');
});

process.on('SIGINT', () => {
  shutdown('SIGINT');
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
  shutdown('unhandledRejection');
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  shutdown('uncaughtException');
});
