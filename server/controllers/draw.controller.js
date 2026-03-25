const Draw = require('../models/Draw.model');
const User = require('../models/User.model');
const Subscription = require('../models/Subscription.model');
const drawService = require('../services/draw.service');
const { calculatePrizePool } = require('../utils/prizePool.util');

const createDraw = async (req, res) => {
  try {
    const { month, drawType } = req.body;
    
    // Calculate subscribers and prize pool
    const activeSubs = await Subscription.find({ status: 'active' });
    const participantCount = activeSubs.length;

    let monthlyRevenue = 0;
    let yearlyRevenue = 0;
    
    activeSubs.forEach(sub => {
      // Mocking revenue logic based on plan
      if (sub.plan === 'monthly') monthlyRevenue += 10;
      if (sub.plan === 'yearly') yearlyRevenue += 100 / 12; // amortised
    });

    const lastDraw = await Draw.findOne().sort({ createdAt: -1 });
    const rolledOverJackpot = lastDraw ? lastDraw.jackpotRolledOver : 0;

    const prizePool = calculatePrizePool(participantCount, monthlyRevenue, yearlyRevenue, rolledOverJackpot);

    const draw = await Draw.create({
      month,
      drawType,
      status: 'draft',
      prizePool,
      participantCount
    });

    res.status(201).json(draw);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const simulateDraw = async (req, res) => {
  try {
    const { id } = req.params;
    const draw = await Draw.findById(id);

    if (!draw) return res.status(404).json({ message: 'Draw not found' });
    if (draw.status === 'published') return res.status(400).json({ message: 'Already published' });

    if (draw.drawType === 'random') {
      draw.drawnNumbers = drawService.generateRandomNumbers();
    } else {
      const activeUsers = await User.find({ subscriptionStatus: 'active' });
      let allScores = [];
      activeUsers.forEach(u => {
        if (u.scores && u.scores.length === 5) {
          allScores = allScores.concat(u.scores.map(s => s.value));
        }
      });
      draw.drawnNumbers = drawService.generateAlgorithmicNumbers(allScores);
    }

    draw.status = 'simulated';
    await draw.save();

    const winners = await drawService.calculateWinners(draw._id);
    draw.winners = winners;
    await draw.save();

    res.json(draw);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const publishDraw = async (req, res) => {
  try {
    const { id } = req.params;
    const draw = await Draw.findById(id);

    if (!draw) return res.status(404).json({ message: 'Draw not found' });
    if (draw.status === 'published') return res.status(400).json({ message: 'Already published' });
    if (draw.status !== 'simulated' || !draw.drawnNumbers) {
       return res.status(400).json({ message: 'Please simulate draw first' });
    }

    draw.status = 'published';
    draw.publishedAt = new Date();

    const winners = await drawService.calculateWinners(draw._id);
    draw.winners = winners;

    let hasJackpotWinner = false;
    
    // Update users
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
    } else {
      draw.jackpotRolledOver = 0;
    }

    await draw.save();
    res.json(draw);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPublishedDraws = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const draws = await Draw.find({ status: 'published' })
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json(draws);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCurrentDraw = async (req, res) => {
  try {
    const draw = await Draw.findOne({ status: { $ne: 'published' } }).sort({ createdAt: -1 });
    if (!draw) return res.status(404).json({ message: 'No active draw found' });

    const user = await User.findById(req.user._id);
    const hasEnoughScores = user.scores && user.scores.length === 5;
    const isSubscribed = user.subscriptionStatus === 'active';

    res.json({
      draw,
      userParticipationStatus: {
        isEligible: hasEnoughScores && isSubscribed,
        hasEnoughScores,
        isSubscribed
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const uploadWinnerProof = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const { id } = req.params;
    const draw = await Draw.findById(id);
    if (!draw) return res.status(404).json({ message: 'Draw not found' });

    const winnerIndex = draw.winners.findIndex(w => w.userId.toString() === req.user._id.toString());
    if (winnerIndex === -1) {
      return res.status(403).json({ message: 'You are not a winner of this draw' });
    }

    draw.winners[winnerIndex].proofUrl = req.file.path;
    await draw.save();

    res.json(draw.winners[winnerIndex]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createDraw, simulateDraw, publishDraw, getPublishedDraws, getCurrentDraw, uploadWinnerProof };
