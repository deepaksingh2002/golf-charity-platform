import 'dotenv/config';
import mongoose from 'mongoose';
import Draw from '../models/Draw.model.js';
import User from '../models/User.model.js';

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const user = await User.findOne();
    const winners = user ? [{
      userId: user._id,
      matchCount: 3,
      prizeAmount: 500,
      paymentStatus: 'pending',
      proofUrl: null
    }] : [];

    await Draw.create({
      month: '2026-02',
      drawnNumbers: [8, 15, 23, 31, 42],
      drawType: 'random',
      status: 'published',
      prizePool: { total: 5000, fiveMatch: 2000, fourMatch: 1750, threeMatch: 1250 },
      jackpotRolledOver: 0,
      participantCount: 47,
      publishedAt: new Date('2026-02-01'),
      winners
    });

    console.log('Draw seeded');
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

run();
