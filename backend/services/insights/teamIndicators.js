// backend/services/insights/teamIndicators.js

const { getBenchmark } = require('../../constants/handicapBenchmarks');

function num(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function round(n, d) {
  const x = num(n, 0);
  const p = 10 ** d;
  return Math.round(x * p) / p;
}

// 팀전 판별(너 gameType enum 기준)
function isTeamGame(gameType) {
  return ['2v2', '2v2v2', '3v3', '3v3v3'].includes(String(gameType || ''));
}

function safeAvg(g) {
  const inning = num(g?.inning, 0);
  const score = num(g?.score, 0);
  if (inning <= 0) return null;
  return score / inning;
}

function clamp01(x) {
  const v = num(x, 0);
  return Math.max(0, Math.min(100, v));
}

/**
 * diff를 강도 점수(0~100)로 변환하는 기본 룰
 * - abs(diff)가 0.10이면 100점(최대)
 * - 필요하면 여기만 튜닝하면 됨
 */
function diffToScore(diff) {
  const d = Math.abs(num(diff, 0));
  return clamp01((d / 0.10) * 100);
}

function pickBestCarry(gamesWithDiff) {
  // bestCarry: diff가 가장 큰 "WIN"
  let best = null;
  for (const it of gamesWithDiff) {
    if (it.result !== 'WIN') continue;
    if (best === null || it.diff > best.diff) best = it;
  }
  return best
    ? { gameId: String(best._id), date: new Date(best.gameDate).toISOString(), diff: round(best.diff, 3), result: '승' }
    : null;
}

function pickBiggestBus(gamesWithDiff) {
  // biggestBus: diff가 가장 작은(가장 음수) "WIN" = 덜치고 이긴 정도가 큰 판
  let best = null;
  for (const it of gamesWithDiff) {
    if (it.result !== 'WIN') continue;
    if (best === null || it.diff < best.diff) best = it;
  }
  return best
    ? { gameId: String(best._id), date: new Date(best.gameDate).toISOString(), diff: round(best.diff, 3), result: '승' }
    : null;
}

function buildHeadline(rates, weighted, sampleN) {
  if (sampleN < 5) return '팀전 표본이 부족해요.';

  const badW = num(weighted.luckBadScore, 0);
  const busW = num(weighted.carryScore, 0);

  if (rates.teamLuckBadRate >= 25 && badW >= busW * 1.1) return '할만패 비중이 높아요 → 팀/매칭 영향 가능';
  if (rates.teamCarryRate >= 25 && busW >= badW * 1.1) return '덜승 비중이 높아요 → 버스/캐리 구간 가능';
  return '팀전 결과가 비교적 균형적이에요';
}

/**
 * ✅ 팀전 지표 생성
 * - 무/UNKNOWN 제외 승패 기준(표본 sampleN)
 */
function buildTeamIndicators(teamGames, handicap) {
  const bench = getBenchmark(handicap);
  const expected = num(bench.expected, 0);

  // inning=0 방어 + diff 계산
  const enriched = (Array.isArray(teamGames) ? teamGames : [])
    .map((g) => {
      const avg = safeAvg(g);
      const diff = avg === null ? null : avg - expected;
      return { ...g.toObject?.() ? g.toObject() : g, avg, diff };
    })
    .filter((g) => g.avg !== null && g.diff !== null);

  // 승/패만 (DRAW/UNKNOWN 제외)
  const decided = enriched.filter((g) => g.result === 'WIN' || g.result === 'LOSE');

  const sampleN = decided.length;

  const counts = {
    TEAM_LUCK_BAD: 0,
    TEAM_CARRY: 0,
    NEED_IMPROVE: 0,
    TEAM_SYNERGY_GOOD: 0,
  };

  const sumAbs = {
    TEAM_LUCK_BAD: 0,
    TEAM_CARRY: 0,
    NEED_IMPROVE: 0,
    TEAM_SYNERGY_GOOD: 0,
  };

  let overN = 0, underN = 0;
  let sumOver = 0, sumUnder = 0;
  let sumDiff = 0;

  for (const g of decided) {
    const diff = num(g.diff, 0);
    sumDiff += diff;

    if (diff >= 0) {
      overN += 1;
      sumOver += diff;
    } else {
      underN += 1;
      sumUnder += diff;
    }

    // 4분류
    if (diff >= 0 && g.result === 'LOSE') {
      counts.TEAM_LUCK_BAD += 1;
      sumAbs.TEAM_LUCK_BAD += diffToScore(diff);
    } else if (diff < 0 && g.result === 'WIN') {
      counts.TEAM_CARRY += 1;
      sumAbs.TEAM_CARRY += diffToScore(diff);
    } else if (diff < 0 && g.result === 'LOSE') {
      counts.NEED_IMPROVE += 1;
      sumAbs.NEED_IMPROVE += diffToScore(diff);
    } else if (diff >= 0 && g.result === 'WIN') {
      counts.TEAM_SYNERGY_GOOD += 1;
      sumAbs.TEAM_SYNERGY_GOOD += diffToScore(diff);
    }
  }

  const rates = {
    teamLuckBadRate: sampleN ? (counts.TEAM_LUCK_BAD / sampleN) * 100 : 0,
    teamCarryRate: sampleN ? (counts.TEAM_CARRY / sampleN) * 100 : 0,
    needImproveRate: sampleN ? (counts.NEED_IMPROVE / sampleN) * 100 : 0,
    synergyWinRate: sampleN ? (counts.TEAM_SYNERGY_GOOD / sampleN) * 100 : 0,
  };

  // weighted는 “평균 강도(0~100)”로 만들기
  const weighted = {
    luckBadScore: counts.TEAM_LUCK_BAD ? sumAbs.TEAM_LUCK_BAD / counts.TEAM_LUCK_BAD : 0,
    carryScore: counts.TEAM_CARRY ? sumAbs.TEAM_CARRY / counts.TEAM_CARRY : 0,
    needImproveScore: counts.NEED_IMPROVE ? sumAbs.NEED_IMPROVE / counts.NEED_IMPROVE : 0,
    synergyScore: counts.TEAM_SYNERGY_GOOD ? sumAbs.TEAM_SYNERGY_GOOD / counts.TEAM_SYNERGY_GOOD : 0,
  };

  const diffSummary = {
    avgDiff: sampleN ? round(sumDiff / sampleN, 3) : 0,
    overRate: sampleN ? round((overN / sampleN) * 100, 1) : 0,
    underRate: sampleN ? round((underN / sampleN) * 100, 1) : 0,
    meanOver: overN ? round(sumOver / overN, 3) : 0,
    meanUnder: underN ? round(sumUnder / underN, 3) : 0, // 음수
  };

  const extremes = {
    bestCarry: pickBestCarry(decided),
    biggestBus: pickBiggestBus(decided),
  };

  const headline = buildHeadline(rates, weighted, sampleN);

  return {
    sampleN,
    counts,
    rates: {
      ...rates,
      // 신버전 키도 같이 제공(프론트가 BUS/CARRY/SELF_ISSUE 쓰고 싶을 때)
      busRate: rates.teamCarryRate,
      carryRate: rates.synergyWinRate,
      selfIssueRate: rates.needImproveRate,
    },
    weighted: {
      ...weighted,
      busScore: weighted.carryScore,
      selfIssueScore: weighted.needImproveScore,
    },
    diffSummary,
    extremes,
    headline,
    note: sampleN < 5 ? '팀전 표본(승/패)이 5판 미만이면 판단 정확도가 낮습니다.' : undefined,
  };
}

module.exports = {
  isTeamGame,
  buildTeamIndicators,
};