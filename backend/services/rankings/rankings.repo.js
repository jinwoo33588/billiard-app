// backend/services/rankings/rankings.repo.js

const Game = require('../../models/Game');

function buildMonthRange(year, month) {
  const y = Number(year);
  const m = Number(month);
  const start = new Date(y, m - 1, 1);
  const end = new Date(y, m, 1); // 다음달 1일(exclusive)
  return { start, end };
}

async function aggregateRanking({ hasMonthFilter, year, month }) {
  const match = {};
  if (hasMonthFilter) {
    const { start, end } = buildMonthRange(year, month);
    match.gameDate = { $gte: start, $lt: end };
  }

  const pipeline = [
    { $match: match },
    {
      $group: {
        _id: '$userId',
        totalGames: { $sum: 1 },
        wins: { $sum: { $cond: [{ $eq: ['$result', 'WIN'] }, 1, 0] } },
        draws: { $sum: { $cond: [{ $eq: ['$result', 'DRAW'] }, 1, 0] } },
        losses: { $sum: { $cond: [{ $eq: ['$result', 'LOSE'] }, 1, 0] } },
        totalScore: { $sum: '$score' },
        totalInnings: { $sum: '$inning' },
      },
    },
    {
      $addFields: {
        average: {
          $cond: [{ $gt: ['$totalInnings', 0] }, { $divide: ['$totalScore', '$totalInnings'] }, 0],
        },
        winRate: {
          $let: {
            vars: { denom: { $add: ['$wins', '$losses'] } }, // ✅ DRAW/UNKNOWN 제외
            in: {
              $cond: [
                { $gt: ['$$denom', 0] },
                { $multiply: [{ $divide: ['$wins', '$$denom'] }, 100] },
                0,
              ],
            },
          },
        },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: '$user' },
    {
      $project: {
        _id: 0,
        userId: '$_id',
        nickname: '$user.nickname',
        handicap: '$user.handicap',
        totalGames: 1,
        wins: 1,
        draws: 1,
        losses: 1,
        average: 1,
        winRate: 1,
      },
    },
  ];

  return Game.aggregate(pipeline);
}

module.exports = { aggregateRanking };