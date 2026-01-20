// backend/services/reports/reports.calc.js
// “games 배열”만 받으면 통계가 나오게 만들기
// “games 배열”만 받으면 **wins/draws/losses/unknown, winRate, average(에버)**를 계산
// 월별 타임라인을 만들기 편하게 monthKeyFromDateKst, buildMonthlyRows도 같이 제공합니다(서비스에서 바로 사용 가능)

function round(n, d = 0) {
  const x = Number(n);
  if (!Number.isFinite(x)) return 0;
  const p = 10 ** d;
  return Math.round(x * p) / p;
}

function safeDiv(a, b) {
  const x = Number(a);
  const y = Number(b);
  if (!Number.isFinite(x) || !Number.isFinite(y) || y === 0) return 0;
  return x / y;
}

/**
 * volatility 정의(초기 버전):
 * - perGameAverage = score/inning (inning>0 인 게임만)
 * - volatility = 표준편차(stddev) of perGameAverage
 */
function stddev(values) {
  const arr = (values || []).filter((v) => Number.isFinite(v));
  const n = arr.length;
  if (n < 2) return 0;

  const mean = arr.reduce((s, v) => s + v, 0) / n;
  const varSum = arr.reduce((s, v) => s + (v - mean) ** 2, 0);
  // 모집단 표준편차(division by n). 표본으로 하고 싶으면 (n-1)로 바꾸면 됨.
  return Math.sqrt(varSum / n);
}

/**
 *   게임 배열 -> 통계 요약(네가 원하는 스키마)
 */
function summarizeGames(games) {
  const list = Array.isArray(games) ? games : [];

  let totalGames = 0;
  let wins = 0;
  let draws = 0;
  let losses = 0;

  let totalScore = 0;
  let totalInnings = 0;

  let bestScore = 0;
  let bestAverage = 0;

  const perGameAverages = [];

  for (const g of list) {
    totalGames++;

    const r = g?.result ?? 'UNKNOWN';
    if (r === 'WIN') wins++;
    else if (r === 'DRAW') draws++;
    else if (r === 'LOSE') losses++;

    const score = Number(g?.score);
    const inning = Number(g?.inning);

    if (Number.isFinite(score)) {
      totalScore += score;
      if (score > bestScore) bestScore = score;
    }

    if (Number.isFinite(inning)) {
      totalInnings += inning;
    }

    // 게임별 에버(변동성/베스트 에버 산출용)
    if (Number.isFinite(score) && Number.isFinite(inning) && inning > 0) {
      const avg = score / inning;
      perGameAverages.push(avg);
      if (avg > bestAverage) bestAverage = avg;
    }
  }

  const average = safeDiv(totalScore, totalInnings);            // 전체 에버(합계 기준)
  const winRate = safeDiv(wins * 100, (wins + losses));         // 0~100(승/승+패) 무승부 제외
  const volatility = stddev(perGameAverages);                   // 게임별 에버 표준편차

  return {
    totalGames,
    wins,
    draws,
    losses,

    totalScore,
    totalInnings,

    average: round(average, 3),
    winRate: round(winRate, 1),
    volatility: round(volatility, 3),

    bestScore: bestScore || 0,
    bestAverage: round(bestAverage || 0, 3),
  };
}

/**
 * (선택) 월별 타임라인 만들 때 쓸 monthKey
 * - KST 기준 "YYYY-MM"
 */
function monthKeyFromDateKst(date) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;

  const ms = d.getTime() + 9 * 60 * 60 * 1000; // KST
  const k = new Date(ms);

  const y = k.getUTCFullYear();
  const m = String(k.getUTCMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function labelFromMonthKey(monthKey) {
  return monthKey && /^\d{4}-\d{2}$/.test(monthKey) ? monthKey.replace('-', '.') : monthKey;
}

/**
 * ✅ 월별 row 생성 (summarizeGames 결과를 그대로 row에 포함)
 */
function buildMonthlyRows(games, { sort = 'asc' } = {}) {
  const bucket = new Map(); // monthKey -> games[]
  for (const g of games || []) {
    const mk = monthKeyFromDateKst(g?.gameDate);
    if (!mk) continue;
    if (!bucket.has(mk)) bucket.set(mk, []);
    bucket.get(mk).push(g);
  }

  const keys = Array.from(bucket.keys()).sort();
  if (sort === 'desc') keys.reverse();

  return keys.map((monthKey) => ({
    monthKey,
    label: labelFromMonthKey(monthKey),
    ...summarizeGames(bucket.get(monthKey)),
  }));
}

module.exports = {
  round,
  summarizeGames,
  monthKeyFromDateKst,
  buildMonthlyRows,
};
