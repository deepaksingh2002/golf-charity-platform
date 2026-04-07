import User from '../models/User.model.js';
import Draw from '../models/Draw.model.js';
import { ApiError } from '../utils/apiError.js';
import { findByIdOrThrow } from '../utils/dbHelpers.js';

const getPagination = (query, defaultLimit = 20) => {
  const limit = parseInt(query.limit) || defaultLimit;
  const page = parseInt(query.page) || 1;
  const skip = (page - 1) * limit;
  return { limit, page, skip };
};

export const getAdminUsers = async (query) => {
  const { limit, page, skip } = getPagination(query);

  const filter = {};
  if (query.subscriptionStatus) filter.subscriptionStatus = query.subscriptionStatus;
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { email: { $regex: query.search, $options: 'i' } }
    ];
  }

  const total = await User.countDocuments(filter);
  const users = await User.find(filter)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return {
    users,
    total,
    pages: Math.ceil(total / limit) || 1,
    page
  };
};

const buildWinnersPipeline = (paymentStatus) => ([
  { $match: { 'winners.0': { $exists: true } } },
  { $unwind: '$winners' },
  ...(paymentStatus ? [{ $match: { 'winners.paymentStatus': paymentStatus } }] : []),
  {
    $lookup: {
      from: 'users',
      localField: 'winners.userId',
      foreignField: '_id',
      as: 'winnerUser'
    }
  },
  { $unwind: { path: '$winnerUser', preserveNullAndEmptyArrays: true } },
  {
    $project: {
      drawId: '$_id',
      month: 1,
      drawDate: '$publishedAt',
      winnerId: '$winners._id',
      userId: '$winners.userId',
      userName: '$winnerUser.name',
      userEmail: '$winnerUser.email',
      matchCount: '$winners.matchCount',
      prizeAmount: '$winners.prizeAmount',
      paymentStatus: '$winners.paymentStatus',
      proofUrl: '$winners.proofUrl'
    }
  }
]);

export const updateAdminUserScore = async (userId, scoreId, value, date) => {
  const user = await findByIdOrThrow(User, userId, 'User not found');

  const score = user.scores.id(scoreId);
  if (!score) throw new ApiError(404, 'Score not found');

  if (value !== undefined) score.value = value;
  if (date !== undefined) score.date = date;

  await user.save();
  return user.scores;
};

export const updateAdminSubscription = async (userId, action) => {
  const user = await findByIdOrThrow(User, userId, 'User not found');

  if (action === 'cancel') {
    user.subscriptionStatus = 'cancelled';
  } else if (action === 'activate') {
    user.subscriptionStatus = 'active';
    if (!user.subscriptionPlan) user.subscriptionPlan = 'monthly';
  }

  await user.save();
  return user;
};

export const getAdminWinners = async (paymentStatus) => {
  return Draw.aggregate(buildWinnersPipeline(paymentStatus));
};

export const verifyAdminWinner = async (drawId, winnerId) => {
  const draw = await findByIdOrThrow(Draw, drawId, 'Draw not found');

  let winner = draw.winners.id(winnerId);
  if (!winner) {
    winner = draw.winners.find(w => w.userId.toString() === winnerId.toString());
  }
  if (!winner) throw new ApiError(404, 'Winner entry not found');

  if (!winner.proofUrl) throw new ApiError(400, 'Proof not uploaded yet');

  winner.paymentStatus = 'paid';
  await draw.save();

  return winner;
};

export const getAdminCharityReport = async () => {
  const charityReportPipeline = [
    {
      $match: {
        subscriptionStatus: 'active',
        selectedCharity: { $ne: null }
      }
    },
    {
      $lookup: {
        from: 'charities',
        localField: 'selectedCharity',
        foreignField: '_id',
        as: 'charity'
      }
    },
    { $unwind: '$charity' },
    {
      $group: {
        _id: '$charity._id',
        charity: { $first: '$charity' },
        usersDonating: { $sum: 1 },
        estimatedMonthlySubContribution: {
          $sum: {
            $multiply: [
              {
                $cond: [
                  { $eq: ['$subscriptionPlan', 'yearly'] },
                  100 / 12,
                  10
                ]
              },
              { $divide: ['$charityPercentage', 100] }
            ]
          }
        }
      }
    },
    { $sort: { 'charity.isFeatured': -1, 'charity.createdAt': -1 } }
  ];

  return User.aggregate(charityReportPipeline);
};
