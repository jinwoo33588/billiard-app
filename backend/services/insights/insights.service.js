// backend/services/insights/insights.service.js

const Game = require('../../models/Game');
const User = require('../../models/User');

const { analyzeForm } = require('./formAnalysis'); // 너가 쓰던 폼 분석(원하면 유지)
const { buildTeamIndicators } = require('./teamIndicators');

async function getInsightsForUser(userId, opts = {}) {
  const user = await User.findById(userId).lean();
  if (!user) throw new Error('User not found');

  // 최근 N판(너 정책대로)
  const limit = Number(opts.limit || 60);

  const games = await Game.find({ userId })
    .sort({ gameDate: -1, createdAt: -1 })
    .limit(limit)
    .lean();

  const handicap = Number(user.handicap || 0);

  // 1) 폼(에버 중심) - 너 기준대로 유지/수정 가능
  const all = analyzeForm(games, handicap);

  // 2) 팀운(단순 gps 버전) - 이번에 새로 연결
  const team = buildTeamIndicators(games, handicap, {
    // minInning: 20,  // 원하면 나중에 켜자(지금은 너가 말한 “그대로”라 기본 1)
  });

  return { all, team };
}

module.exports = { getInsightsForUser };