// backend/services/insights/insights.service.js
const Game = require('../../models/Game');
const User = require('../../models/User');

const { analyzeForm } = require('./formAnalysis');
const { buildTeamIndicators } = require('./teamIndicators');

async function getInsightsForUser(userId, windowSize = 10) {
  const user = await User.findById(userId).lean();
  if (!user) throw new Error('User not found');

  const limit = Number(windowSize || 10);

  const games = await Game.find({ userId })
    .sort({ gameDate: -1, createdAt: -1 })
    .limit(limit)
    .lean();

  const handicap = Number(user.handicap || 0);

  const all = analyzeForm(games, handicap);

  // ✅ 프론트가 기대하는 team 구조 (team.games 포함)
  const team = buildTeamIndicators(games, handicap, {
    // minInning: 1,
    // includeNeutralInSample: true,
  });

  return { all, team };
}

module.exports = { getInsightsForUser };