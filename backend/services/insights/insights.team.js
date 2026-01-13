// backend/services/insights/insights.team.js
const Game = require("../../models/Game");
const { num, round } = require("./insights.utils");
const {scoreGame} = require("./insights.scoring");

/**
 * team rule: 팀전 타입만
 */
const TEAM_TYPES = new Set(["2v2", "2v2v2", "3v3", "3v3v3"]);

/** (선택) 팀전 판별 */
function isTeamGame(gameType) {
  return TEAM_TYPES.has(String(gameType || ""));
}

/**
 * 최근 N개의 팀전 게임 조회
 * - 최소 필드만 select
 */
async function fetchTeamGamesLastN(userId, windowN = 60) {
  const k = Math.max(1, Math.min(Number(windowN) || 60, 2000));

  return await Game.find({
    userId,
    gameType: { $in: Array.from(TEAM_TYPES) },
  })
    .sort({ gameDate: -1 })
    .limit(k)
    .select("score inning result gameDate gameType");
}

/**
 * 팀 인사이트(절대평가 gps)
 * - 라벨 없음
 * - cuts 없음
 * - 다른 판 영향 없음
 *
 * input:
 * - games: fetchTeamGamesLastN 결과
 * - benchmark: { handicap, expected } (핵심)
 * - opts: { minInning, decidedOnly }
 */
function buildTeamInsights({ games, benchmark, opts = {} }) {
  const expected = num(benchmark?.expected, 0);
  const handicap = num(benchmark?.handicap, 0);

  const minInning = Math.max(1, num(opts.minInning, 1)); // 기본 1, 필요하면 10~20 추천
  const decidedOnly = opts.decidedOnly ?? true; // 기본 true: WIN/LOSE만

  if (!Array.isArray(games) || games.length === 0) {
    return {
      sampleN: 0,
      benchmark: { handicap, expected },
      meta: { minInning, decidedOnly, excluded: 0 },
      summary: null,
      games: [],
      note: "팀전 기록이 없어요.",
    };
  }

  let excluded = 0;

  // 1) 필터링 + 점수화
  const rows = games
    .filter((g) => isTeamGame(g?.gameType))
    .filter((g) => {
      const inn = num(g?.inning, 0);
      if (inn < minInning) return false;
      if (decidedOnly && !(g?.result === "WIN" || g?.result === "LOSE")) return false;
      return true;
    })
    .map((g) => {
      const score = num(g.score, 0);
      const inning = Math.max(1, num(g.inning, 1));

      const pack = scoreGame({
        score,
        inning,
        expected,
        handicap,
      });

      return {
        gameId: String(g._id),
        date: g.gameDate ? new Date(g.gameDate).toISOString() : null,
        gameType: g.gameType,
        result: g.result,

        score,
        inning,

        // scoring pack
        avg: pack.avg,
        eff: pack.eff,
        vol: pack.vol,
        effScore: pack.effScore,
        volScore: pack.volScore,
        gps: pack.gps,
        weights: pack.weights,
      };
    })
    .filter((r) => {
      // 방어: NaN 제거
      const ok = Number.isFinite(r.gps);
      if (!ok) excluded += 1;
      return ok;
    });

  const sampleN = rows.length;

  if (sampleN === 0) {
    return {
      sampleN: 0,
      benchmark: { handicap, expected },
      meta: { minInning, decidedOnly, excluded },
      summary: null,
      games: [],
      note: "필터 조건을 만족하는 팀전 표본이 없어요.",
    };
  }

  // // 2) 요약(선택): gps 통계
  // const gpsArr = rows.map((r) => num(r.gps, 0));
  // const mean = gpsArr.reduce((a, b) => a + b, 0) / gpsArr.length;
  // const min = Math.min(...gpsArr);
  // const max = Math.max(...gpsArr);

  // // 중앙값(p50)
  // const sorted = [...gpsArr].sort((a, b) => a - b);
  // const p50 =
  //   sorted.length % 2 === 1
  //     ? sorted[(sorted.length - 1) / 2]
  //     : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2;

  // const summary = {
  //   gps: {
  //     mean: round(mean, 1),
  //     p50: round(p50, 1),
  //     min: round(min, 1),
  //     max: round(max, 1),
  //   },
  // };

  // return {
  //   sampleN,
  //   benchmark: { handicap, expected },
  //   meta: { minInning, decidedOnly, excluded },
  //   summary,
  //   games: rows,
  //   note: sampleN < 5 ? "팀전 표본이 5판 미만이면 해석이 불안정할 수 있어요." : undefined,
  // };

  return {
    sampleN,
    benchmark: { handicap, expected },
    meta: { minInning, decidedOnly, excluded },
    games: rows,
    note: sampleN < 5 ? "팀전 표본이 5판 미만이면 해석이 불안정할 수 있어요." : undefined,
  };
}

module.exports = {
  isTeamGame,
  fetchTeamGamesLastN,
  buildTeamInsights,
};