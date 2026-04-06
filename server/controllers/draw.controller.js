import Draw from '../models/Draw.model.js';
import User from '../models/User.model.js';
import Subscription from '../models/Subscription.model.js';
import * as drawService from '../services/draw.service.js';
import { calculatePrizePool } from '../utils/prizePool.util.js';

export const createDraw = async (req, res) => {
  try {
    const { month, drawType, forced } = req.body;
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const drawMonth = month || currentMonth;
    const type = drawType || 'random';

    const existing = await Draw.findOne({ month: drawMonth });
    if (existing && !forced) {
      return res.status(400).json({ message: 'Draw already exists for this month' });
    }
    if (existing && forced) {
      return res.status(200).json(existing);
    }
    
    // Calculate subscribers and prize pool
    const activeSubs = await Subscription.find({ status: 'active' });
    let participantCount = activeSubs.length;

    let monthlyRevenue = 0;
    let yearlyRevenue = 0;
    
    if (activeSubs.length > 0) {
      activeSubs.forEach(sub => {
        // Mocking revenue logic based on plan
        if (sub.plan === 'monthly') monthlyRevenue += 10;
        if (sub.plan === 'yearly') yearlyRevenue += 100 / 12; // amortised
      });
    } else {
      const activeUsers = await User.find({ subscriptionStatus: 'active' });
      participantCount = activeUsers.length;
      activeUsers.forEach(u => {
        if (u.subscriptionPlan === 'yearly') yearlyRevenue += 100 / 12;
        else monthlyRevenue += 10;
      });
    }

    const lastDraw = await Draw.findOne().sort({ createdAt: -1 });
    const rolledOverJackpot = lastDraw ? lastDraw.jackpotRolledOver : 0;

    const prizePool = calculatePrizePool(participantCount, monthlyRevenue, yearlyRevenue, rolledOverJackpot);

    const draw = await Draw.create({
      month: drawMonth,
      drawType: type,
      status: 'draft',
      prizePool,
      participantCount
    });

    res.status(201).json(draw);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const simulateDraw = async (req, res) => {
  try {
    const { id } = req.params;
    const draw = id === 'current'
      ? await Draw.findOne({ status: { $ne: 'published' } }).sort({ createdAt: -1 })
      : await Draw.findById(id);

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

export const publishDraw = async (req, res) => {
  try {
    const { id } = req.params;
    const draw = id === 'current'
      ? await Draw.findOne({ status: { $ne: 'published' } }).sort({ createdAt: -1 })
      : await Draw.findById(id);

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
    res.json(draw);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPublishedDraws = async (req, res) => {
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

export const getCurrentDraw = async (req, res) => {
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

export const uploadWinnerProof = async (req, res) => {
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
