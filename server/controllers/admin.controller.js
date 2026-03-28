import User from '../models/User.model.js';
import Draw from '../models/Draw.model.js';
import Subscription from '../models/Subscription.model.js';
import Charity from '../models/Charity.model.js';

export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    let activeSubscribers = await Subscription.countDocuments({ status: 'active' });
    if (activeSubscribers === 0) {
      activeSubscribers = await User.countDocuments({ subscriptionStatus: 'active' });
    }
    
    // Total Prize Pool (all time) from draws
    const allDraws = await Draw.find();
    const totalPrizePool = allDraws.reduce((sum, draw) => sum + (draw.prizePool ? draw.prizePool.total : 0), 0);
    
    // Total Charity Distributed
    const charities = await Charity.find();
    const totalCharities = charities.length;
    const totalCharityDistributed = charities.reduce((sum, c) => sum + (c.totalReceived || 0), 0);
    
    // Current Month Revenue (mocked approx: sub * price)
    const subAgg = await Subscription.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$plan', count: { $sum: 1 } } }
    ]);
    let currentMonthRevenue = 0;
    subAgg.forEach(p => {
      if (p._id === 'monthly') currentMonthRevenue += p.count * 10;
      if (p._id === 'yearly') currentMonthRevenue += p.count * (100 / 12);
    });

    const drawStats = {
      totalDraws: allDraws.length,
      winnersPaid: allDraws.reduce((sum, draw) => 
        sum + (draw.winners ? draw.winners.filter(w => w.paymentStatus === 'paid').length : 0), 0)
    };

    res.json({
      totalUsers,
      activeSubscribers,
      totalCharities,
      totalDraws: drawStats.totalDraws,
      totalPrizePool,
      totalCharityDistributed,
      currentMonthRevenue,
      drawStats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.subscriptionStatus) query.subscriptionStatus = req.query.subscriptionStatus;
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      users,
      total,
      pages: Math.ceil(total / limit) || 1,
      page
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserDetail = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password').populate('selectedCharity');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const subscriptions = await Subscription.find({ userId: user._id });
    const draws = await Draw.find({ 'winners.userId': user._id });
    
    const userDraws = draws.map(d => {
      const winnerData = d.winners.find(w => w.userId.toString() === user._id.toString());
      return { drawId: d._id, month: d.month, ...winnerData.toObject() };
    });

    res.json({
      ...user.toObject(),
      subscriptions,
      drawWins: userDraws
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const editUserScore = async (req, res) => {
  try {
    const { userId, scoreId } = req.params;
    const { value, date } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const score = user.scores.id(scoreId);
    if (!score) return res.status(404).json({ message: 'Score not found' });

    if (value !== undefined) score.value = value;
    if (date !== undefined) score.date = date;

    await user.save();
    res.json(user.scores);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const manageSubscription = async (req, res) => {
  try {
    const { userId } = req.params;
    const { action } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (action === 'cancel') {
      user.subscriptionStatus = 'cancelled';
    } else if (action === 'activate') {
      user.subscriptionStatus = 'active';
      if (!user.subscriptionPlan) user.subscriptionPlan = 'monthly';
    }

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getWinnersList = async (req, res) => {
  try {
    const { paymentStatus } = req.query;
    const draws = await Draw.find({ 'winners.0': { $exists: true } }).populate('winners.userId', 'name email');

    let allWinners = [];
    draws.forEach(draw => {
      draw.winners.forEach(w => {
        if (!paymentStatus || w.paymentStatus === paymentStatus) {
          allWinners.push({
            drawId: draw._id,
            month: draw.month,
            winnerId: w._id,
            userId: w.userId?._id || w.userId,
            userName: w.userId?.name,
            userEmail: w.userId?.email,
            matchCount: w.matchCount,
            prizeAmount: w.prizeAmount,
            paymentStatus: w.paymentStatus,
            proofUrl: w.proofUrl
          });
        }
      });
    });

    res.json(allWinners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyWinner = async (req, res) => {
  try {
    const { drawId, winnerId } = req.params;

    const draw = await Draw.findById(drawId);
    if (!draw) return res.status(404).json({ message: 'Draw not found' });

    let winner = draw.winners.id(winnerId);
    if (!winner) {
      winner = draw.winners.find(w => w.userId.toString() === winnerId.toString());
    }
    if (!winner) return res.status(404).json({ message: 'Winner entry not found' });

    if (!winner.proofUrl) return res.status(400).json({ message: 'Proof not uploaded yet' });

    winner.paymentStatus = 'paid';
    await draw.save();

    res.json(winner);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCharityReport = async (req, res) => {
  try {
    const users = await User.find({ subscriptionStatus: 'active' }).populate('selectedCharity');
    
    const charityTotals = {};
    users.forEach(u => {
      if (u.selectedCharity) {
        const cId = u.selectedCharity._id.toString();
        if (!charityTotals[cId]) {
          charityTotals[cId] = {
            charity: u.selectedCharity,
            usersDonating: 0,
            estimatedMonthlySubContribution: 0
          };
        }
        charityTotals[cId].usersDonating += 1;
        
        const planValue = u.subscriptionPlan === 'yearly' ? 100/12 : 10;
        charityTotals[cId].estimatedMonthlySubContribution += planValue * (u.charityPercentage / 100);
      }
    });

    res.json(Object.values(charityTotals));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
