import express from 'express';
import { body } from 'express-validator';
import { register, login, getMe, updateProfile, changePassword } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';
import { loginLimiter, registerLimiter } from '../middleware/rateLimiter.middleware.js';

const router = express.Router();

// ============================================================================
// Validation Rules
// ============================================================================

const registerValidationRules = [
  body('name', 'Name is required').notEmpty().trim(),
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
];

const loginValidationRules = [
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Password is required').exists()
];

const updateProfileValidationRules = [
  body('name', 'Name must not be empty').if((value) => value !== undefined).trim().notEmpty(),
  body('email', 'Please include a valid email').if((value) => value !== undefined).isEmail(),
  body('charityPercentage', 'Charity percentage must be between 10 and 100').if((value) => value !== undefined).isInt({ min: 10, max: 100 })
];

const changePasswordValidationRules = [
  body('currentPassword', 'Current password is required').exists(),
  body('newPassword', 'New password must be at least 6 characters').isLength({ min: 6 })
];

// ============================================================================
// Routes
// ============================================================================

router.post(
  '/register',
  registerLimiter,
  registerValidationRules,
  validate,
  register
);

router.post(
  '/login',
  loginLimiter,
  loginValidationRules,
  validate,
  login
);

router.get(
  '/me',
  protect,
  getMe
);

router.put(
  '/profile',
  protect,
  updateProfileValidationRules,
  validate,
  updateProfile
);

router.put(
  '/change-password',
  protect,
  changePasswordValidationRules,
  validate,
  changePassword
);

export default router;
