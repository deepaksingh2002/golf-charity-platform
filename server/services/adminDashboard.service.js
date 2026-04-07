import User from '../models/User.model.js';
import Draw from '../models/Draw.model.js';
import Subscription from '../models/Subscription.model.js';
import Charity from '../models/Charity.model.js';

const buildDashboardPipelines = {
  totalUsers: [{ $count: 'totalUsers' }],
  activeSubscribers: [{ $match: { status: 'active' } }, { $count: 'activeSubscribers' }],
  activeUsersFallback: [{ $match: { subscriptionStatus: 'active' } }, { $count: 'activeSubscribers' }],
  subscriptionSummary: [
    {
      $group: {
        _id: null,
        totalSubscriptions: { $sum: 1 },
        activeSubscriptions: {
          $sum: {
            $cond: [{ $eq: ['$status', 'active'] }, 1, 0]
          }
        },
        cancelledSubscriptions: {
          $sum: {
            $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0]
          }
        },
        pastDueSubscriptions: {
          $sum: {
            $cond: [{ $eq: ['$status', 'past_due'] }, 1, 0]
          }
        },
        lapsedSubscriptions: {
          $sum: {
            $cond: [{ $eq: ['$status', 'lapsed'] }, 1, 0]
          }
        },
        monthlySubscriptions: {
          $sum: {
            $cond: [{ $eq: ['$plan', 'monthly'] }, 1, 0]
          }
        },
        yearlySubscriptions: {
          $sum: {
            $cond: [{ $eq: ['$plan', 'yearly'] }, 1, 0]
          }
        }
      }
    }
  ],
  activeRevenue: [
    { $match: { status: 'active' } },
    {
      $group: {
        _id: null,
        currentMonthRevenue: {
          $sum: {
            $switch: {
              branches: [
                { case: { $eq: ['$plan', 'monthly'] }, then: 10 },
                { case: { $eq: ['$plan', 'yearly'] }, then: 100 / 12 }
              ],
              default: 0
            }
          }
        }
      }
    }
  ],
  draws: [
    {
      $group: {
        _id: null,
        totalDraws: { $sum: 1 },
        totalPrizePool: { $sum: { $ifNull: ['$prizePool.total', 0] } },
        winnersPaid: {
          $sum: {
            $size: {
              $filter: {
                input: { $ifNull: ['$winners', []] },
                as: 'winner',
                cond: { $eq: ['$$winner.paymentStatus', 'paid'] }
              }
            }
          }
        }
      }
    }
  ],
  charities: [
    {
      $group: {
        _id: null,
        totalCharities: { $sum: 1 },
        totalCharityDistributed: { $sum: { $ifNull: ['$totalReceived', 0] } }
      }
    }
  ]
};

const getFirstValue = (rows, key) => rows[0]?.[key] || 0;

export const getAdminDashboardStats = async () => {
  const [
    totalUsersAgg,
    activeSubscribersAgg,
    activeUsersFallbackAgg,
    subscriptionSummaryAgg,
    revenueAgg,
    drawAgg,
    charityAgg
  ] = await Promise.all([
    User.aggregate(buildDashboardPipelines.totalUsers),
    Subscription.aggregate(buildDashboardPipelines.activeSubscribers),
    User.aggregate(buildDashboardPipelines.activeUsersFallback),
    Subscription.aggregate(buildDashboardPipelines.subscriptionSummary),
    Subscription.aggregate(buildDashboardPipelines.activeRevenue),
    Draw.aggregate(buildDashboardPipelines.draws),
    Charity.aggregate(buildDashboardPipelines.charities)
  ]);

  const totalUsers = getFirstValue(totalUsersAgg, 'totalUsers');
  const activeSubscribers = getFirstValue(activeSubscribersAgg, 'activeSubscribers') || getFirstValue(activeUsersFallbackAgg, 'activeSubscribers');
  const subscriptionSummary = {
    totalSubscriptions: getFirstValue(subscriptionSummaryAgg, 'totalSubscriptions'),
    activeSubscriptions: getFirstValue(subscriptionSummaryAgg, 'activeSubscriptions'),
    cancelledSubscriptions: getFirstValue(subscriptionSummaryAgg, 'cancelledSubscriptions'),
    pastDueSubscriptions: getFirstValue(subscriptionSummaryAgg, 'pastDueSubscriptions'),
    lapsedSubscriptions: getFirstValue(subscriptionSummaryAgg, 'lapsedSubscriptions'),
    monthlySubscriptions: getFirstValue(subscriptionSummaryAgg, 'monthlySubscriptions'),
    yearlySubscriptions: getFirstValue(subscriptionSummaryAgg, 'yearlySubscriptions')
  };
  const currentMonthRevenue = getFirstValue(revenueAgg, 'currentMonthRevenue');
  const totalDraws = getFirstValue(drawAgg, 'totalDraws');
  const totalPrizePool = getFirstValue(drawAgg, 'totalPrizePool');
  const winnersPaid = getFirstValue(drawAgg, 'winnersPaid');
  const totalCharities = getFirstValue(charityAgg, 'totalCharities');
  const totalCharityDistributed = getFirstValue(charityAgg, 'totalCharityDistributed');

  return {
    totalUsers,
    activeSubscribers,
    activeSubscriptions: activeSubscribers,
    totalCharities,
    totalDraws,
    totalPrizePool,
    totalCharityDistributed,
    totalDonated: totalCharityDistributed,
    currentMonthRevenue,
    monthlyPool: currentMonthRevenue,
    subscriptionSummary,
    drawStats: {
      totalDraws,
      winnersPaid
    }
  };
};
