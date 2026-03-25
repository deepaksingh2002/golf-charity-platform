const calculatePrizePool = (subscriberCount, monthlyRevenue, yearlyRevenue, rolledOverJackpot = 0) => {
  const totalRevenue = monthlyRevenue + yearlyRevenue;
  const pool = totalRevenue * 0.30;
  return {
    total: pool + rolledOverJackpot,
    fiveMatch: (pool * 0.40) + rolledOverJackpot,
    fourMatch: pool * 0.35,
    threeMatch: pool * 0.25
  };
};

module.exports = { calculatePrizePool };
