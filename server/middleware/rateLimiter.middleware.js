import { rateLimit } from 'express-rate-limit';

const createAuthLimiter = (max, message, extraOptions = {}) => rateLimit({
  windowMs: 15 * 60 * 1000,
  max,
  message: { message },
  standardHeaders: true,
  legacyHeaders: false,
  ...extraOptions
});

export const loginLimiter = createAuthLimiter(
  10,
  'Too many login attempts from this IP, please try again after 15 minutes',
  { skipSuccessfulRequests: true }
);

export const registerLimiter = createAuthLimiter(
  5,
  'Too many registration attempts from this IP, please try again after 15 minutes'
);
