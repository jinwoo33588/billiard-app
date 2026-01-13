// backend/services/insights/insights.form.js
const { round, num } = require("./insights.utils");

/**
 * FormCard가 필요로 하는 최소 구조를 만든다.
 * - statsRead.getLastNStats() 결과를 recent로 받는다고 가정
 * - expectedAvg(benchmark.expected)로 delta 계산
 */
function buildFormAll({ benchmark, recentStats, minGames = 5 }) {
  const expected = num(benchmark?.expected, 0);

  // recentStats.stats: { average, winRate, volatility, totalGames ... }
  const r = recentStats?.stats;
  const sampleN = num(recentStats?.sampleN ?? r?.totalGames, 0);

  if (!r || sampleN < minGames) {
    return {
      benchmark,
      stats: null,
      reasons: ["데이터가 부족합니다. (최소 5판)"],
    };
  }

  const recentAvg = num(r.average, 0);       // ✅ 평균 에버(총점/총이닝 기반이어야 함)
  const winRate = num(r.winRate, 0);
  const volatility = num(r.volatility, 0);
  const delta = recentAvg - expected;

  return {
    
    benchmark,
    stats: {
      recentAvg: round(recentAvg, 3),
      delta: round(delta, 3),
      winRate: round(winRate, 1),
      volatility: round(volatility, 3),
      sampleN,
    },
    
  };
}

module.exports = { buildFormAll };