import User from '../models/User.model.js';
import Draw from '../models/Draw.model.js';
import { ApiError } from '../utils/apiError.js';

const DRAW_SIZE = 5;
const NUMBER_POOL_SIZE = 45;

export const generateRandomNumbers = () => {
  const numbers = new Set();
  while (numbers.size < DRAW_SIZE) {
    numbers.add(Math.floor(Math.random() * NUMBER_POOL_SIZE) + 1);
  }
  return Array.from(numbers);
};

export const generateAlgorithmicNumbersFromDb = async () => {
  const frequencyRows = await User.aggregate([
    {
      $match: {
        subscriptionStatus: 'active',
        'scores.4': { $exists: true }
      }
    },
    { $project: { scoreValues: '$scores.value' } },
    { $unwind: '$scoreValues' },
    {
      $match: {
        scoreValues: { $gte: 1, $lte: 45 }
      }
    },
    {
      $group: {
        _id: '$scoreValues',
        frequency: { $sum: 1 }
      }
    },
    { $sort: { frequency: 1, _id: 1 } }
  ]);

  const frequencyMap = new Map(frequencyRows.map(row => [row._id, row.frequency]));

  const sortedNumbers = Array.from({ length: NUMBER_POOL_SIZE }, (_, index) => index + 1).sort((a, b) => {
    const aFreq = frequencyMap.get(a) || 0;
    const bFreq = frequencyMap.get(b) || 0;
    if (aFreq !== bFreq) return aFreq - bFreq;
    return a - b;
  });

  return sortedNumbers.slice(0, DRAW_SIZE);
};

export const calculateWinners = async (drawId) => {
  const draw = await Draw.findById(drawId);
  if (!draw) throw new ApiError(404, 'Draw not found');

  const { prizePool, drawnNumbers } = draw;
  if (!drawnNumbers || drawnNumbers.length !== DRAW_SIZE) throw new ApiError(400, 'Drawn numbers not set');

  const winners = await User.aggregate([
    {
      $match: {
        subscriptionStatus: 'active',
        'scores.4': { $exists: true }
      }
    },
    { $project: { scoreValues: '$scores.value' } },
    {
      $addFields: {
        matchCount: {
          $size: {
            $setIntersection: ['$scoreValues', drawnNumbers]
          }
        }
      }
    },
    {
      $match: {
        matchCount: { $gte: 3 }
      }
    },
    {
      $project: {
        userId: '$_id',
        matchCount: 1
      }
    }
  ]);

  const matches = winners.reduce((acc, winner) => {
    acc[winner.matchCount].push(winner.userId);
    return acc;
  }, { 3: [], 4: [], 5: [] });

  const threeMatchPrize = matches[3].length > 0 ? prizePool.threeMatch / matches[3].length : 0;
  const fourMatchPrize = matches[4].length > 0 ? prizePool.fourMatch / matches[4].length : 0;
  const fiveMatchPrize = matches[5].length > 0 ? prizePool.fiveMatch / matches[5].length : 0;

  return [
    ...matches[3].map(userId => ({ userId, matchCount: 3, prizeAmount: threeMatchPrize })),
    ...matches[4].map(userId => ({ userId, matchCount: 4, prizeAmount: fourMatchPrize })),
    ...matches[5].map(userId => ({ userId, matchCount: 5, prizeAmount: fiveMatchPrize }))
  ];
};
