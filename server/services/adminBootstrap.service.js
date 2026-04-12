import User from '../models/User.model.js';

const parseBool = (value, fallback = true) => {
  if (value === undefined || value === null || value === '') return fallback;
  return String(value).trim().toLowerCase() === 'true';
};

export const bootstrapAdminUser = async () => {
  const adminEmail = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;
  const syncPassword = parseBool(process.env.ADMIN_SYNC_PASSWORD_ON_BOOT, true);

  if (!adminEmail || !adminPassword) {
    return {
      status: 'skipped',
      reason: 'ADMIN_EMAIL or ADMIN_PASSWORD missing',
    };
  }

  const existing = await User.findOne({ email: adminEmail }).select('+password');

  if (!existing) {
    await User.create({
      name: 'Platform Admin',
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
      subscriptionStatus: 'active',
    });

    return {
      status: 'created',
      email: adminEmail,
    };
  }

  let changed = false;

  if (existing.role !== 'admin') {
    existing.role = 'admin';
    changed = true;
  }

  if (existing.subscriptionStatus !== 'active') {
    existing.subscriptionStatus = 'active';
    changed = true;
  }

  if (existing.name !== 'Platform Admin') {
    existing.name = 'Platform Admin';
    changed = true;
  }

  if (syncPassword) {
    existing.password = adminPassword;
    changed = true;
  }

  if (changed) {
    await existing.save();
  }

  return {
    status: changed ? 'updated' : 'unchanged',
    email: adminEmail,
  };
};
