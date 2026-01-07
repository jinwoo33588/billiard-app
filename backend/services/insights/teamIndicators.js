// backend/services/insights/teamIndicators.simple.js
const { getBenchmark } = require('../../constants/handicapBenchmarks');

function num(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}
function round(n, d = 3) {
  const x = num(n, 0);
  const p = 10 ** d;
  return Math.round(x * p) / p;
}

function isTeamGame(gameType) {
  return ['2v2', '2v2v2', '3v3', '3v3v3'].includes(String(gameType || ''));
}

function safeAvg(g) {
  const inning = num(g?.inning, 0);
  const score = num(g?.score, 0);
  if (inning <= 0) return null;
  return score / inning;
}

function quantile(arr, p) {
  const xs = (arr || []).filter(Number.isFinite).slice().sort((a, b) => a - b);
  if (xs.length === 0) return 0;
  if (xs.length === 1) return xs[0];
  const idx = (xs.length - 1) * p;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return xs[lo];
  const w = idx - lo;
  return xs[lo] * (1 - w) + xs[hi] * w;
}

function clamp01_100(x) {
  const v = num(x, 0);
  return Math.max(0, Math.min(100, v));
}

function toScore01(x, lo, hi) {
  const a = num(lo, 0);
  const b = num(hi, 1);
  const v = num(x, 0);
  if (b <= a) return 50;
  return clamp01_100(((v - a) / (b - a)) * 100);
}

function classify(gps, result) {
  const good = gps >= 60;
  const bad = gps <= 40;

  if (result === 'WIN' && bad) return 'BUS';
  if (result === 'LOSE' && good) return 'LUCK_BAD';
  if (result === 'WIN' && good) return 'CARRY';
  if (result === 'LOSE' && bad) return 'SELF_ISSUE';
  return 'NEUTRAL';
}

function buildTeamIndicators(games, handicap, opts = {}) {
  const bench = getBenchmark(handicap);
  const E = num(bench.expected, 0);

  const minInning = num(opts.minInning, 1);
  const includeNeutralInSample = opts.includeNeutralInSample ?? true;

  const teamGames = (Array.isArray(games) ? games : []).filter((g) => isTeamGame(g?.gameType));

  const enriched = teamGames
    .map((g) => {
      const inning = num(g?.inning, 0);
      if (inning < minInning) return null;

      const score = num(g?.score, 0);
      const avg = safeAvg(g);
      if (avg === null) return null;

      const eff = avg - E;
      const expectedScore = E * inning;
      const vol = score - expectedScore;

      return { ...g, avg, eff, expectedScore, vol };
    })
    .filter(Boolean);

  const decided = enriched.filter((g) => g.result === 'WIN' || g.result === 'LOSE');
  const sampleN = decided.length;

  if (sampleN === 0) {
    return {
      sampleN: 0,
      benchmark: { handicap: Math.round(num(handicap, 0)), expected: E },
      cuts: null,
      counts: { LUCK_BAD: 0, BUS: 0, SELF_ISSUE: 0, CARRY: 0, NEUTRAL: 0 },
      rates: { luckBadRate: 0, busRate: 0, selfIssueRate: 0, carryRate: 0, neutralRate: 0 },
      headline: '팀전 결정판 표본이 없습니다.',
      note: '팀전 결정판(WIN/LOSE) 표본이 없습니다.',
      games: [],
    };
  }

  const effArr = decided.map((g) => num(g.eff, 0));
  const volArr = decided.map((g) => num(g.vol, 0));

  const effLo = quantile(effArr, 0.05);
  const effHi = quantile(effArr, 0.95);
  const volLo = quantile(volArr, 0.05);
  const volHi = quantile(volArr, 0.95);

  const rows = decided.map((g) => {
    const effScore = toScore01(g.eff, effLo, effHi);
    const volScore = toScore01(g.vol, volLo, volHi);
    const gps = round(0.6 * effScore + 0.4 * volScore, 1);

    const label = classify(gps, g.result);

    return {
      gameId: String(g._id),
      date: g.gameDate ? new Date(g.gameDate).toISOString() : null,
      result: g.result,
      gameType: g.gameType,

      score: num(g.score, 0),
      inning: num(g.inning, 0),

      avg: round(g.avg, 3),
      eff: round(g.eff, 3),
      expectedScore: round(g.expectedScore, 2),
      vol: round(g.vol, 2),

      effScore: round(effScore, 1),
      volScore: round(volScore, 1),
      gps,

      label,
    };
  });

  const counts = { LUCK_BAD: 0, BUS: 0, SELF_ISSUE: 0, CARRY: 0, NEUTRAL: 0 };
  for (const r of rows) counts[r.label] += 1;

  const denom = includeNeutralInSample ? sampleN : (sampleN - counts.NEUTRAL);
  const d = denom > 0 ? denom : sampleN;

  const rates = {
    luckBadRate: d ? round((counts.LUCK_BAD / d) * 100, 1) : 0,
    busRate: d ? round((counts.BUS / d) * 100, 1) : 0,
    selfIssueRate: d ? round((counts.SELF_ISSUE / d) * 100, 1) : 0,
    carryRate: d ? round((counts.CARRY / d) * 100, 1) : 0,
    neutralRate: d ? round((counts.NEUTRAL / d) * 100, 1) : 0,
  };

  let headline = '팀전 결과가 비교적 균형적이에요';
  if (sampleN < 5) headline = '팀전 표본이 부족해요.';
  else {
    const top = Object.entries({
      LUCK_BAD: rates.luckBadRate,
      BUS: rates.busRate,
      SELF_ISSUE: rates.selfIssueRate,
      CARRY: rates.carryRate,
    }).sort((a, b) => b[1] - a[1])[0];

    if (top && top[1] >= 25) {
      headline =
        top[0] === 'LUCK_BAD' ? '할만패 비중이 높아요(억울)' :
        top[0] === 'BUS' ? '버스 비중이 높아요' :
        top[0] === 'SELF_ISSUE' ? '내 이슈 비중이 높아요' :
        '캐리 비중이 높아요';
    }
  }

  return {
    sampleN,
    benchmark: { handicap: Math.round(num(handicap, 0)), expected: E },
    cuts: {
      eff: { p05: round(effLo, 3), p95: round(effHi, 3) },
      vol: { p05: round(volLo, 2), p95: round(volHi, 2) },
    },
    counts,
    rates,
    headline,
    note: sampleN < 5 ? '팀전 결정판 표본이 5판 미만이면 판단 정확도가 낮습니다.' : undefined,
    games: rows,
  };
}

module.exports = { isTeamGame, buildTeamIndicators };