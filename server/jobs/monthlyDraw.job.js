const cron = require('node-cron');
const Draw = require('../models/Draw.model');
const Subscription = require('../models/Subscription.model');
const { calculatePrizePool } = require('../utils/prizePool.util');

const startMonthlyDrawJob = () => {
  // 0 9 1 * * => 9am on 1st of every month
  cron.schedule('0 9 1 * *', async () => {
    try {
      console.log('Running monthly draw auto-creation job...');

      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      const monthStr = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}`;

      const activeSubs = await Subscription.find({ status: 'active' });
      const participantCount = activeSubs.length;

      let monthlyRevenue = 0;
      let yearlyRevenue = 0;
      
      activeSubs.forEach(sub => {
        if (sub.plan === 'monthly') monthlyRevenue += 10;
        if (sub.plan === 'yearly') yearlyRevenue += 100 / 12;
      });

      const lastDraw = await Draw.findOne().sort({ createdAt: -1 });
      const rolledOverJackpot = lastDraw ? lastDraw.jackpotRolledOver : 0;

      const prizePool = calculatePrizePool(participantCount, monthlyRevenue, yearlyRevenue, rolledOverJackpot);

      const draw = await Draw.create({
        month: monthStr,
        drawType: 'algorithmic',
        status: 'draft',
        prizePool,
        participantCount
      });

      console.log(`Created auto draw for ${monthStr}:`, draw._id);
    } catch (error) {
      console.error('Error creating monthly draw:', error);
    }
  });
};

module.exports = startMonthlyDrawJob;
