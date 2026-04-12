import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getAccessTokenCookieOptions } from '../utils/authCookies.js';
import { readCookieToken } from '../utils/requestCookies.js';

const normalizeRole = (role) => String(role || 'user').trim().toLowerCase();

const logAuthFailure = (req, stage, error) => {
  console.warn(`[AUTH] ${stage} failed`, {
    method: req.method,
    path: req.originalUrl,
    ip: req.ip,
    origin: req.get('origin') || null,
    userAgent: req.get('user-agent') || null,
    errorName: error?.name || 'UnknownError',
    errorMessage: error?.message || 'Unknown auth error',
  });
};

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET;
  const headerToken = req
    .header('Authorization')
    ?.replace(/^Bearer\s+/i, '')
    ?.trim();
  const accessToken = headerToken || readCookieToken(req, 'accessToken');

  if (accessToken) {
    try {
      const decodedToken = jwt.verify(accessToken, accessTokenSecret);
      const userId = decodedToken?._id || decodedToken?.id;
      const user = await User.findById(userId).select('-password');

      if (user) {
        user.role = normalizeRole(user.role || decodedToken?.role);
        req.user = user;
        return next();
      }

      logAuthFailure(req, 'access-token-user-lookup', new Error('User not found for access token'));
    } catch (error) {
      logAuthFailure(req, 'access-token-verify', error);
      // Fall through to refresh token check when access token is invalid/expired.
    }
  }

  const refreshToken = readCookieToken(req, 'refreshToken');
  if (!refreshToken) {
    logAuthFailure(req, 'refresh-token-missing', new Error('Refresh token cookie is missing'));
    throw new ApiError(401, 'Invalid access token.');
  }

  if (!process.env.REFRESH_TOKEN_SECRET) {
    logAuthFailure(req, 'refresh-token-config', new Error('REFRESH_TOKEN_SECRET is not configured'));
    throw new ApiError(401, 'Refresh token expired or invalid');
  }

  let decodedRefreshToken;
  try {
    decodedRefreshToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
  } catch (error) {
    logAuthFailure(req, 'refresh-token-verify', error);
    throw new ApiError(401, 'Refresh token expired or invalid');
  }

  const refreshUserId = decodedRefreshToken?._id || decodedRefreshToken?.id;
  const user = await User.findById(refreshUserId).select('+refreshToken');
  if (!user || user.refreshToken !== refreshToken) {
    logAuthFailure(req, 'refresh-token-database-check', new Error('Refresh token mismatch or user missing'));
    throw new ApiError(401, 'Invalid refresh token');
  }

  // Auto-heal expired access tokens for authenticated sessions using a valid refresh cookie.
  const newAccessToken = user.generateAccessToken();

  res.cookie('accessToken', newAccessToken, getAccessTokenCookieOptions(req));

  req.user = await User.findById(user._id).select('-password');
  req.user.role = normalizeRole(req.user.role);
  return next();
});

export const protect = verifyJWT;

export const adminOnly = (req, res, next) => {
  if (req.user && normalizeRole(req.user.role) === 'admin') {
    return next();
  }
  throw new ApiError(403, 'Not authorized as an admin');
};

export const subscriberOnly = (req, res, next) => {
  if (req.user && (req.user.subscriptionStatus === 'active' || normalizeRole(req.user.role) === 'admin')) {
    return next();
  }
  throw new ApiError(403, 'Active subscription required');
};
