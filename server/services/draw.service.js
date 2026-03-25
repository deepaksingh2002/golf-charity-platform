const User = require('../models/User.model');
const Draw = require('../models/Draw.model');

const generateRandomNumbers = () => {
  const numbers = new Set();
  while (numbers.size < 5) {
    numbers.add(Math.floor(Math.random() * 45) + 1);
  }
  return Array.from(numbers);
};

const generateAlgorithmicNumbers = (allUserScores) => {
  const frequencies = {};
  for (let i = 1; i <= 45; i++) frequencies[i] = 0;

  allUserScores.forEach(scoreVal => {
    if (scoreVal >= 1 && scoreVal <= 45) {
      frequencies[scoreVal]++;
    }
  });

  const sorted = Object.keys(frequencies).sort((a, b) => frequencies[a] - frequencies[b]);
  
  // Pick the 5 least frequent
  return sorted.slice(0, 5).map(Number);
};

const matchUserScores = (drawnNumbers, userScores) => {
  let matchCount = 0;
  userScores.forEach(score => {
    if (drawnNumbers.includes(score)) {
      matchCount++;
    }
  });
  
  return {
    matchCount,
    isWinner: matchCount >= 3
  };
};

const calculateWinners = async (drawId) => {
  const draw = await Draw.findById(drawId);
  if (!draw) throw new Error('Draw not found');

  const { prizePool, drawnNumbers } = draw;
  if (!drawnNumbers || drawnNumbers.length !== 5) throw new Error('Drawn numbers not set');

  // Active subscribers
  const users = await User.find({ subscriptionStatus: 'active' });

  const winnersList = [];
  const matches = { 3: [], 4: [], 5: [] };

  users.forEach(user => {
    if (user.scores && user.scores.length === 5) {
      const scoreValues = user.scores.map(s => s.value);
      const { matchCount, isWinner } = matchUserScores(drawnNumbers, scoreValues);
      
      if (isWinner && (matchCount === 3 || matchCount === 4 || matchCount === 5)) {
        matches[matchCount].push(user._id);
      }
    }
  });

  // Calculate split pool
  const threeMatchPrize = matches[3].length > 0 ? prizePool.threeMatch / matches[3].length : 0;
  const fourMatchPrize = matches[4].length > 0 ? prizePool.fourMatch / matches[4].length : 0;
  const fiveMatchPrize = matches[5].length > 0 ? prizePool.fiveMatch / matches[5].length : 0;

  matches[3].forEach(userId => winnersList.push({ userId, matchCount: 3, prizeAmount: threeMatchPrize }));
  matches[4].forEach(userId => winnersList.push({ userId, matchCount: 4, prizeAmount: fourMatchPrize }));
  matches[5].forEach(userId => winnersList.push({ userId, matchCount: 5, prizeAmount: fiveMatchPrize }));

  return winnersList;
};

module.exports = { generateRandomNumbers, generateAlgorithmicNumbers, matchUserScores, calculateWinners };
