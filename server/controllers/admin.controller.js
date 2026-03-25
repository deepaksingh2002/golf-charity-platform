const User = require('../models/User.model');
const Draw = require('../models/Draw.model');
const Subscription = require('../models/Subscription.model');
const Charity = require('../models/Charity.model');

const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeSubscribers = await Subscription.countDocuments({ status: 'active' });
    
    // Total Prize Pool (all time) from draws
    const allDraws = await Draw.find();
    const totalPrizePool = allDraws.reduce((sum, draw) => sum + (draw.prizePool ? draw.prizePool.total : 0), 0);
    
    // Total Charity Distributed
    const charities = await Charity.find();
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
      totalPrizePool,
      totalCharityDistributed,
      currentMonthRevenue,
      drawStats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllUsers = async (req, res) => {
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

    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(limit);

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserDetail = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const subscriptions = await Subscription.find({ userId: user._id });
    const draws = await Draw.find({ 'winners.userId': user._id });
    
    const userDraws = draws.map(d => {
      const winnerData = d.winners.find(w => w.userId.toString() === user._id.toString());
      return { drawId: d._id, month: d.month, ...winnerData.toObject() };
    });

    res.json({ user, subscriptions, drawWins: userDraws });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const editUserScore = async (req, res) => {
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

const manageSubscription = async (req, res) => {
  try {
    const { userId } = req.params;
    const { action } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (action === 'cancel') {
      user.subscriptionStatus = 'cancelled';
    } else if (action === 'activate') {
      user.subscriptionStatus = 'active';
    }

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getWinnersList = async (req, res) => {
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
            winner: w
          });
        }
      });
    });

    res.json(allWinners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyWinner = async (req, res) => {
  try {
    const { drawId, winnerId } = req.params;

    const draw = await Draw.findById(drawId);
    if (!draw) return res.status(404).json({ message: 'Draw not found' });

    const winner = draw.winners.id(winnerId);
    if (!winner) return res.status(404).json({ message: 'Winner entry not found' });

    if (!winner.proofUrl) return res.status(400).json({ message: 'Proof not uploaded yet' });

    winner.paymentStatus = 'paid';
    await draw.save();

    res.json(winner);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCharityReport = async (req, res) => {
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

module.exports = {
  getDashboardStats, getAllUsers, getUserDetail, editUserScore,
  manageSubscription, getWinnersList, verifyWinner, getCharityReport
};
