// backend/services/reports/reports.eval.js

const { getBenchmark } = require('../../constants/handicapBenchmarks');
const { gpsFromGame } = require('./reports.gps');

function httpError(status, message) {
  const e = new Error(message);
  e.status = status;
  throw e;
}

/**
 * ✅ 단건 게임 평가
 * game: { score, inning, ... }
 * user: { handicap, ... }
 */
function evaluateGameGps(game, user, { explain = false } = {}) {
  const handicap = Number(user?.handicap);
  if (!Number.isFinite(handicap)) {
    httpError(500, 'user.handicap이 올바르지 않습니다.');
  }

  const bench = getBenchmark(handicap);
  if (!bench) {
    httpError(500, `핸디 ${handicap} 기준표가 없습니다. handicapBenchmarks.js를 확인하세요.`);
  }

  const gps = gpsFromGame(
    { score: game?.score, inning: game?.inning },
    { expected: bench.expected },
    handicap
  );

  return {
    benchmark: {
      handicap: bench.handicap,
      expected: bench.expected,
      // min: bench.min,
      // max: bench.max,
    },
    gps: gps.gps,
  };
}

module.exports = {
  evaluateGameGps,
};
