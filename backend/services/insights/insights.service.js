// backend/services/insights/insights.service.js
const User = require("../../models/User");
const statsService = require("../stats.service");
const httpError = require("../../utils/httpError");


const { calcHandicapScore } = require("./insights.calc");

async function getMyInsights(userId, opt) {
  // 1) 기간/최근N/전체 통계(이미 구현됨)에서 avg, winRate 가져오기
  const stats = await statsService.getMyStats(userId, opt);

  // 게임이 0판이면 인사이트 계산 의미가 없음(정책 선택)
  if (!stats || stats.gamesCount === 0) {
    return {
      window: { mode: opt.mode, range: opt.range, limit: opt.limit },
      stats,
      handicapScore: null,
      note: "not enough games",
    };
  }

  // 2) 유저 핸디캡 가져오기 (User 스키마에 handicap 필드가 있어야 함)
  const user = await User.findById(userId).select("handicap").lean();
  if (!user) throw httpError(404, "user not found");

  const handicap = user.handicap;
  if (handicap === undefined || handicap === null || !Number.isFinite(Number(handicap))) {
    throw httpError(400, "user handicap is missing");
  }

  // 3) calc로 점수/판정 생성
  const handicapScore = calcHandicapScore({
    handicap: Number(handicap),
    avg: stats.avg,
    winRate: stats.winRate,
  });

  return {
    window: { mode: opt.mode, range: opt.range, limit: opt.limit },
    stats,
    handicapScore,
  };
}

module.exports = {
  getMyInsights,
};