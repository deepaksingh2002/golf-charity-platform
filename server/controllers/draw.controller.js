import Draw from '../models/Draw.model.js';
import User from '../models/User.model.js';
import Subscription from '../models/Subscription.model.js';
import * as drawService from '../services/draw.service.js';
import { calculatePrizePool } from '../utils/prizePool.util.js';
import { ApiError } from '../utils/apiError.js';
import { sendApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { findByIdOrThrow, findLatestUnpublishedDraw } from '../utils/dbHelpers.js';

const getRevenueBreakdown = (subscriptions = [], users = []) => {
  if (subscriptions.length > 0) {
    return subscriptions.reduce(
      (totals, subscription) => {
        if (subscription.plan === 'monthly') totals.monthlyRevenue += 10;
        if (subscription.plan === 'yearly') totals.yearlyRevenue += 100 / 12;
        return totals;
      },
      { monthlyRevenue: 0, yearlyRevenue: 0, participantCount: subscriptions.length }
    );
  }

  return users.reduce(
    (totals, user) => {
      if (user.subscriptionPlan === 'yearly') totals.yearlyRevenue += 100 / 12;
      else totals.monthlyRevenue += 10;
      totals.participantCount += 1;
      return totals;
    },
    { monthlyRevenue: 0, yearlyRevenue: 0, participantCount: 0 }
  );
};

const buildParticipationStatus = (user) => {
  const hasEnoughScores = user?.scores?.length === 5;
  const isSubscribed = user?.subscriptionStatus === 'active';

  return {
    isEligible: hasEnoughScores && isSubscribed,
    hasEnoughScores,
    isSubscribed,
  };
};

const getDrawByParam = (id) =>
  id === 'current' ? findLatestUnpublishedDraw(Draw) : findByIdOrThrow(Draw, id, 'Draw not found');

export const createDraw = asyncHandler(async (req, res) => {
  const { month, drawType, forced } = req.body;
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const drawMonth = month || currentMonth;
  const type = drawType || 'random';

  const existing = await Draw.findOne({ month: drawMonth });
  if (existing && !forced) {
    throw new ApiError(400, 'Draw already exists for this month');
  }
  if (existing && forced) {
    return sendApiResponse(res, 200, existing, 'Draw already exists for this month', {
      legacy: true,
    });
  }

  const activeSubs = await Subscription.find({ status: 'active' });
  const activeUsers =
    activeSubs.length > 0 ? [] : await User.find({ subscriptionStatus: 'active' });
  const revenueBreakdown = getRevenueBreakdown(activeSubs, activeUsers);

  const lastDraw = await Draw.findOne().sort({ createdAt: -1 });
  const rolledOverJackpot = lastDraw ? lastDraw.jackpotRolledOver : 0;
  const prizePool = calculatePrizePool(
    revenueBreakdown.participantCount,
    revenueBreakdown.monthlyRevenue,
    revenueBreakdown.yearlyRevenue,
    rolledOverJackpot
  );

  const draw = await Draw.create({
    month: drawMonth,
    drawType: type,
    status: 'draft',
    prizePool,
    participantCount: revenueBreakdown.participantCount,
  });

  sendApiResponse(res, 201, draw, 'Draw created successfully', { legacy: true });
});

export const simulateDraw = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const draw = await getDrawByParam(id);

  if (draw.status === 'published') throw new ApiError(400, 'Already published');

  if (draw.drawType === 'random') {
    draw.drawnNumbers = drawService.generateRandomNumbers();
  } else {
    draw.drawnNumbers = await drawService.generateAlgorithmicNumbersFromDb();
  }

  draw.status = 'simulated';
  await draw.save();

  const winners = await drawService.calculateWinners(draw._id);
  draw.winners = winners;
  await draw.save();

  sendApiResponse(res, 200, draw, 'Draw simulated successfully', { legacy: true });
});

export const publishDraw = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const draw = await getDrawByParam(id);

  if (draw.status === 'published') throw new ApiError(400, 'Already published');
  if (draw.status !== 'simulated' || !draw.drawnNumbers) {
    throw new ApiError(400, 'Please simulate draw first');
  }

  draw.status = 'published';
  draw.publishedAt = new Date();

  const winners = await drawService.calculateWinners(draw._id);
  draw.winners = winners;

  let hasJackpotWinner = false;
  for (const winner of winners) {
    if (winner.matchCount === 5) hasJackpotWinner = true;
    const user = await User.findById(winner.userId);
    if (user) {
      user.totalWinnings += winner.prizeAmount;
      await user.save();
    }
  }

  if (!hasJackpotWinner) {
    draw.jackpotRolledOver = draw.prizePool.fiveMatch;
    const [year, month] = draw.month.split('-').map(Number);
    const nextMonthDate = new Date(year, month, 1);
    const nextMonth = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, '0')}`;
    await Draw.findOneAndUpdate(
      { month: nextMonth },
      { $inc: { jackpotRolledOver: draw.prizePool.fiveMatch } },
      { upsert: true, new: true }
    );
  } else {
    draw.jackpotRolledOver = 0;
  }

  await draw.save();
  sendApiResponse(res, 200, draw, 'Draw published successfully', { legacy: true });
});

export const getPublishedDraws = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  const skip = (page - 1) * limit;

  const filter = { status: 'published' };
  const [draws, total] = await Promise.all([
    Draw.find(filter)
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit),
    Draw.countDocuments(filter),
  ]);

  sendApiResponse(res, 200, {
    draws,
    page,
    limit,
    total,
    pages: Math.ceil(total / limit) || 1,
  }, 'Draw history loaded successfully', {
    collectionKey: 'draws',
    legacy: true,
  });
});

export const getCurrentDraw = asyncHandler(async (req, res) => {
  const draw = await findLatestUnpublishedDraw(Draw);
  if (!draw) throw new ApiError(404, 'No active draw found');

  const user = await User.findById(req.user._id);
  sendApiResponse(
    res,
    200,
    {
      ...draw.toObject(),
      userParticipationStatus: buildParticipationStatus(user),
    },
    'Current draw loaded successfully',
    { legacy: true }
  );
});

export const uploadWinnerProof = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No file uploaded');

  const { id } = req.params;
  const draw = await findByIdOrThrow(Draw, id, 'Draw not found');

  const winnerIndex = draw.winners.findIndex(
    (w) => w.userId.toString() === req.user._id.toString()
  );
  if (winnerIndex === -1) {
    throw new ApiError(403, 'You are not a winner of this draw');
  }

  draw.winners[winnerIndex].proofUrl = `/uploads/proofs/${req.file.filename}`;
  await draw.save();

  sendApiResponse(res, 200, draw.winners[winnerIndex], 'Winner proof uploaded successfully', {
    legacy: true,
  });
});
