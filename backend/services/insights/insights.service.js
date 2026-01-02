// backend/services/insights/insights.service.js

const User = require('../../models/User');
const Game = require('../../models/Game');

const { analyzeForm } = require('./formAnalysis');
const { isTeamGame, buildTeamIndicators } = require('./teamIndicators');

/**
 * ✅ 최근 N판 인사이트 조립 (폼 + 팀지표)
 * - DB: 최근 N판만 조회해서 성능 확보
 */
async function getInsightsForUser(userId, windowSize = 10) {
  const user = await User.findById(userId).select('handicap nickname');
  if (!user) {
    const e = new Error('사용자를 찾을 수 없습니다.');
    e.status = 404;
    throw e;
  }

  const handicap = Number(user.handicap) || 0;
  const limit = Math.max(1, Math.min(Number(windowSize) || 10, 50));

  // ✅ 최근 N판만 조회
  const windowGames = await Game.find({ userId })
    .sort({ gameDate: -1 })
    .limit(limit);

  // ✅ 전체 흐름(팀/개인 섞어서)
  const allAnalysis = analyzeForm(windowGames, handicap);

  // ✅ 팀전만 분리
  const teamWindow = windowGames.filter((g) => isTeamGame(g.gameType));
  const teamIndicators = buildTeamIndicators(teamWindow, handicap);

  return {
    window: limit,
    handicap,
    updatedAt: new Date().toISOString(),
    all: {
      gameType: 'ALL',
      sampleN: windowGames.length,
      ...allAnalysis,
    },
    teamIndicators,
  };
}

module.exports = { getInsightsForUser };