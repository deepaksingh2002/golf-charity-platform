import User from '../models/User.model.js';
import Subscription from '../models/Subscription.model.js';
import Draw from '../models/Draw.model.js';

const buildUserDrawWinsPipeline = (userId) => [
  { $match: { 'winners.userId': userId } },
  { $unwind: '$winners' },
  { $match: { 'winners.userId': userId } },
  {
    $project: {
      _id: '$winners._id',
      drawId: '$_id',
      month: 1,
      userId: '$winners.userId',
      matchCount: '$winners.matchCount',
      prizeAmount: '$winners.prizeAmount',
      paymentStatus: '$winners.paymentStatus',
      proofUrl: '$winners.proofUrl'
    }
  }
];

export const getAdminUserDetail = async (userId) => {
  const user = await User.findById(userId)
    .select('-password')
    .populate('selectedCharity');

  if (!user) {
    return null;
  }

  const [subscriptions, drawWins] = await Promise.all([
    Subscription.find({ userId: user._id }),
    Draw.aggregate(buildUserDrawWinsPipeline(user._id))
  ]);

  return {
    ...user.toObject(),
    subscriptions,
    drawWins
  };
};
