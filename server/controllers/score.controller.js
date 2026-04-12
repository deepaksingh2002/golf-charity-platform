import User from '../models/User.model.js';
import { ApiError } from '../utils/apiError.js';
import { sendApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ensureObjectId } from '../utils/dbHelpers.js';

const sortScoresDesc = (scores) => scores.sort((a, b) => new Date(b.date) - new Date(a.date));

export const addScore = asyncHandler(async (req, res) => {
  const { value, date } = req.body;
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (user.scores.length >= 5) {
    user.scores.sort((a, b) => new Date(a.date) - new Date(b.date));
    user.scores.shift();
  }

  user.scores.push({ value, date });
  await user.save();

  sendApiResponse(res, 201, sortScoresDesc(user.scores), 'Score added successfully');
});

export const getScores = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  sendApiResponse(res, 200, sortScoresDesc(user.scores), 'Scores loaded successfully');
});

export const updateScore = asyncHandler(async (req, res) => {
  const { value, date } = req.body;
  const { scoreId } = req.params;
  ensureObjectId(scoreId, 'Invalid score id');
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (value === undefined && date === undefined) {
    throw new ApiError(400, 'Nothing to update');
  }

  const score = user.scores.id(scoreId);
  if (!score) {
    throw new ApiError(404, 'Score not found');
  }

  if (value !== undefined) score.value = value;
  if (date !== undefined) score.date = date;

  await user.save();

  sendApiResponse(res, 200, sortScoresDesc(user.scores), 'Score updated successfully');
});

export const deleteScore = asyncHandler(async (req, res) => {
  const { scoreId } = req.params;
  ensureObjectId(scoreId, 'Invalid score id');
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const score = user.scores.id(scoreId);
  if (!score) {
    throw new ApiError(404, 'Score not found');
  }

  user.scores.pull(scoreId);
  await user.save();

  sendApiResponse(res, 200, sortScoresDesc(user.scores), 'Score deleted successfully');
});
