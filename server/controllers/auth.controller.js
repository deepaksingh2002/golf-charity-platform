import User from '../models/User.model.js';
import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/apiError.js';
import { sendApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
  getClearAuthCookieOptions,
} from '../utils/authCookies.js';

const normalizeRole = (role) => String(role || 'user').trim().toLowerCase();

const buildAuthPayload = (user, token) => {
  const userRole = user?.role || 'user';
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: normalizeRole(userRole),
    subscriptionStatus: user.subscriptionStatus,
    token,
  };
};

const parseCookieHeader = (cookieHeader = '') => {
  return cookieHeader
    .split(';')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .reduce((acc, item) => {
      const separatorIndex = item.indexOf('=');
      if (separatorIndex <= 0) return acc;
      const key = item.slice(0, separatorIndex).trim();
      const value = item.slice(separatorIndex + 1).trim();
      acc[key] = decodeURIComponent(value);
      return acc;
    }, {});
};

const readCookieToken = (req, key) => {
  if (req.cookies?.[key]) return req.cookies[key];
  const parsed = parseCookieHeader(req.headers?.cookie || '');
  return parsed[key] || null;
};

const issueSessionTokens = async (user, req, res) => {
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  res.cookie('accessToken', accessToken, getAccessTokenCookieOptions(req));
  res.cookie('refreshToken', refreshToken, getRefreshTokenCookieOptions(req));

  return { accessToken, refreshToken };
};

const buildProfilePayload = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: normalizeRole(user.role),
  charityPercentage: user.charityPercentage,
  selectedCharity: user.selectedCharity,
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
  const { accessToken } = await issueSessionTokens(user, req, res);

  sendApiResponse(res, 201, buildAuthPayload(user, accessToken), 'Account created successfully', {
    legacy: true,
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password +refreshToken');

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const { accessToken } = await issueSessionTokens(user, req, res);

  sendApiResponse(res, 200, buildAuthPayload(user, accessToken), 'Login successful', {
    legacy: true,
  });
});

export const refreshSession = asyncHandler(async (req, res) => {
  const incomingRefreshToken = readCookieToken(req, 'refreshToken');
  if (!incomingRefreshToken) {
    throw new ApiError(401, 'Refresh token is required');
  }

  if (!process.env.REFRESH_TOKEN_SECRET) {
    throw new ApiError(500, 'Refresh token secret is not configured');
  }

  let decoded;
  try {
    decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
  } catch {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }

  const userId = decoded?._id || decoded?.id;
  const user = await User.findById(userId).select('+refreshToken');

  if (!user || user.refreshToken !== incomingRefreshToken) {
    throw new ApiError(401, 'Refresh token is invalid');
  }

  const { accessToken } = await issueSessionTokens(user, req, res);

  sendApiResponse(res, 200, buildAuthPayload(user, accessToken), 'Session refreshed successfully', {
    legacy: true,
  });
});

export const logout = asyncHandler(async (req, res) => {
  if (req.user?._id) {
    await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } });
  }

  const clearOptions = getClearAuthCookieOptions(req);
  res.clearCookie('accessToken', clearOptions);
  res.clearCookie('refreshToken', clearOptions);

  sendApiResponse(res, 200, null, 'Logged out successfully');
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await findUserById(req.user._id, { populate: 'selectedCharity' });
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const userRole = user?.role || 'user';
  const payload = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: normalizeRole(userRole),
    charityPercentage: user.charityPercentage,
    selectedCharity: user.selectedCharity,
    subscriptionStatus: user.subscriptionStatus,
  };

  sendApiResponse(res, 200, payload, 'Profile loaded successfully', { legacy: true });
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

  sendApiResponse(res, 200, buildProfilePayload(updatedUser), 'Profile updated successfully', {
    legacy: true,
  });
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
