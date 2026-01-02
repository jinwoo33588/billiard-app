// backend/services/rankings/rankings.service.js

const rankingsRepo = require('./rankings.repo');

function num(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function round(n, d) {
  const x = num(n, 0);
  const p = 10 ** d;
  return Math.round(x * p) / p;
}

/**
 * ✅ 랭킹 조립
 * - 정렬 룰은 여기서 관리
 */
async function getRanking({ hasMonthFilter, year, month }) {
  const rows = await rankingsRepo.aggregateRanking({ hasMonthFilter, year, month });

  const sorted = [...rows].sort((a, b) => {
    // 1) average desc
    if (num(b.average) !== num(a.average)) return num(b.average) - num(a.average);
    // 2) winRate desc
    if (num(b.winRate) !== num(a.winRate)) return num(b.winRate) - num(a.winRate);
    // 3) handicap asc (원하면 desc로 바꿔도 됨)
    return num(a.handicap, 999) - num(b.handicap, 999);
  });

  return sorted.map((r) => ({
    ...r,
    average: round(r.average, 3),
    winRate: round(r.winRate, 1),
  }));
}

module.exports = { getRanking };