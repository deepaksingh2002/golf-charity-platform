import User from '../models/User.model.js';
import { generateToken } from '../utils/jwt.util.js';
import { ApiError } from '../utils/apiError.js';
import { sendApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const buildAuthPayload = (user, token) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  subscriptionStatus: user.subscriptionStatus,
  token
});

const buildProfilePayload = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  charityPercentage: user.charityPercentage,
  selectedCharity: user.selectedCharity
});

const findUserById = (userId, { includePassword = false, populate = null } = {}) => {
  let query = User.findById(userId);

  query = includePassword ? query.select('+password') : query.select('-password');
  if (populate) query = query.populate(populate);

  return query;
};

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new ApiError(409, 'Email already in use');
  }

  const user = await User.create({ name, email, password });
  const token = generateToken(user._id, user.role);

  sendApiResponse(res, 201, buildAuthPayload(user, token), 'Account created successfully', { legacy: true });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = generateToken(user._id, user.role);

  sendApiResponse(res, 200, buildAuthPayload(user, token), 'Login successful', { legacy: true });
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await findUserById(req.user._id, { populate: 'selectedCharity' });
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  sendApiResponse(res, 200, user, 'Profile loaded successfully', { legacy: true });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await findUserById(req.user._id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  user.name = req.body.name || user.name;

  if (req.body.email && req.body.email !== user.email) {
    const emailExists = await User.findOne({ email: req.body.email });
    if (emailExists) {
      throw new ApiError(400, 'Email already in use');
    }
    user.email = req.body.email;
  }

  if (req.body.charityPercentage !== undefined) {
    const pct = Number(req.body.charityPercentage);
    if (Number.isNaN(pct) || pct < 10 || pct > 100) {
      throw new ApiError(400, 'Charity percentage must be between 10 and 100');
    }
    user.charityPercentage = pct;
  }

  if (Object.prototype.hasOwnProperty.call(req.body, 'selectedCharity')) {
    user.selectedCharity = req.body.selectedCharity || null;
  }

  const updatedUser = await user.save();

  sendApiResponse(res, 200, buildProfilePayload(updatedUser), 'Profile updated successfully', { legacy: true });
});

export const changePassword = asyncHandler(async (req, res) => {
  const user = await findUserById(req.user._id, { includePassword: true });
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const isMatch = await user.comparePassword(req.body.currentPassword);
  if (!isMatch) {
    throw new ApiError(401, 'Incorrect current password');
  }

  user.password = req.body.newPassword;
  await user.save();

  sendApiResponse(res, 200, null, 'Password updated successfully');
});
