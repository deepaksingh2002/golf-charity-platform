import express from 'express';
import { body } from 'express-validator';
import { register, login, getMe, updateProfile, changePassword } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';
import { loginLimiter, registerLimiter } from '../middleware/rateLimiter.middleware.js';

const router = express.Router();

router.post(
  '/register',
  registerLimiter,
  [
    body('name', 'Name is required').notEmpty(),
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
  ],
  validate,
  register
);

router.post(
  '/login',
  loginLimiter,
  [
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password is required').exists()
  ],
  validate,
  login
);

router.get('/me', protect, getMe);

router.put('/profile', protect, updateProfile);

router.put(
  '/change-password',
  protect,
  [
    body('currentPassword', 'Current password is required').exists(),
    body('newPassword', 'New password must be at least 6 characters').isLength({ min: 6 })
  ],
  validate,
  changePassword
);

export default router;
