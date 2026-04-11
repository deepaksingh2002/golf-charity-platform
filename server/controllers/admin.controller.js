import { ApiError } from '../utils/apiError.js';
import { sendApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getAdminDashboardStats } from '../services/adminDashboard.service.js';
import { getAdminUserDetail } from '../services/adminUserDetail.service.js';
import {
  getAdminUsers,
  getAdminWinners,
  getAdminCharityReport,
  updateAdminUserScore,
  updateAdminSubscription,
  verifyAdminWinner,
} from '../services/admin.service.js';

export const getDashboardStats = asyncHandler(async (req, res) => {
  const dashboardStats = await getAdminDashboardStats();

  sendApiResponse(res, 200, dashboardStats, 'Dashboard stats loaded successfully', {
    legacy: true,
  });
});

export const getAllUsers = asyncHandler(async (req, res) => {
  const usersPayload = await getAdminUsers(req.query);

  sendApiResponse(res, 200, usersPayload, 'Users loaded successfully', { legacy: true });
});

export const getUserDetail = asyncHandler(async (req, res) => {
  const userDetail = await getAdminUserDetail(req.params.id);
  if (!userDetail) {
    throw new ApiError(404, 'User not found');
  }

  sendApiResponse(res, 200, userDetail, 'User detail loaded successfully', { legacy: true });
});

export const editUserScore = asyncHandler(async (req, res) => {
  const { userId, scoreId } = req.params;
  const { value, date } = req.body;

  const scores = await updateAdminUserScore(userId, scoreId, value, date);
  sendApiResponse(res, 200, scores, 'User scores updated successfully', {
    collectionKey: 'scores',
  });
});

export const manageSubscription = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { action } = req.body;

  const user = await updateAdminSubscription(userId, action);
  sendApiResponse(res, 200, user, 'Subscription updated successfully', { legacy: true });
});

export const getWinnersList = asyncHandler(async (req, res) => {
  const { paymentStatus } = req.query;
  const allWinners = await getAdminWinners(paymentStatus);

  sendApiResponse(res, 200, allWinners, 'Winners loaded successfully', {
    collectionKey: 'winners',
  });
});

export const verifyWinner = asyncHandler(async (req, res) => {
  const { drawId, winnerId } = req.params;
  const winner = await verifyAdminWinner(drawId, winnerId);
  sendApiResponse(res, 200, winner, 'Winner verified successfully', { legacy: true });
});

export const getCharityReport = asyncHandler(async (req, res) => {
  const charityReport = await getAdminCharityReport();

  sendApiResponse(res, 200, charityReport, 'Charity report loaded successfully', {
    collectionKey: 'charityReport',
  });
});
