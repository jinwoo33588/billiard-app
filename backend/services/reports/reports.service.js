// backend/services/reports/reports.service.js
// 라우트가 요구하는 5개 함수 구현(조립만)
const reportsRepo = require('./reports.repo');
const { summarizeGames, buildMonthlyRows } = require('./reports.calc');
const { evaluateGameGps } = require('./reports.eval');

const User = require('../../models/User');

// validators에서 month range helper를 추가했다는 전제 (없으면 내부 구현으로 바꿔도 됨)
const { monthRangeFromYearMonthKst, validateFromTo } = require('../../utils/validators');

function httpError(status, message) {
  const e = new Error(message);
  e.status = status;
  throw e;
}
function notFound(message) {
  httpError(404, message || '리소스를 찾을 수 없습니다.');
}

function toIso(d) {
  if (!d) return null;
  const x = new Date(d);
  if (Number.isNaN(x.getTime())) return null;
  return x.toISOString();
}

function normalizeLimit(n, { def = 10, min = 1, max = 50 } = {}) {
  const raw = Number(n);
  let x = Number.isFinite(raw) ? raw : def;
  x = Math.max(min, Math.min(max, x));
  return x;
}


// KST 기준 “이번 달” 범위
function currentMonthRangeKst() {
  const now = new Date();

  // now를 KST로 "해석"하기 위해 +9h 후 UTC year/month를 사용
  const kstMs = now.getTime() + 9 * 60 * 60 * 1000;
  const kst = new Date(kstMs);

  const year = kst.getUTCFullYear();
  const month0 = kst.getUTCMonth();

  return monthRangeFromYearMonthKst(year, month0);
}

// (선택) 월 키가 여러 개 들어올 때 범위를 합치는 helper
function rangeFromYM(fromYM, toYM) {
  const from = fromYM ? monthRangeFromYearMonthKst(fromYM.year, fromYM.month0).from : undefined;
  const to = toYM ? monthRangeFromYearMonthKst(toYM.year, toYM.month0).to : undefined;
  if (from && to) validateFromTo(from, to);
  return { from, to };
}

/** ---------------- Range ---------------- */
async function getRangeReport(userId, { from, to }) {
  if (!from || !to) {
    httpError(400, 'from/to가 필요합니다.');
  }
  validateFromTo(from, to);

  const games = await reportsRepo.fetchGamesByUser(userId, {
    from,
    to,
    sort: 'asc',
    fields: 'score inning result gameDate',
  });

  const stats = summarizeGames(games);

  return {
    range: { from: toIso(from), to: toIso(to) },
    ...stats,
  };
}

async function getCurrentMonthReport(userId) {
  const { from, to } = currentMonthRangeKst();
  return getRangeReport(userId, { from, to });
}

async function getMonthlyTimeline(userId, { fromYM, toYM, from, to } = {}) {
  // route에서 {from,to}를 넘길 수도 있고, {fromYM,toYM}를 넘길 수도 있도록 유연하게 처리
  let range = { from, to };

  if (!range.from && !range.to && (fromYM || toYM)) {
    range = rangeFromYM(fromYM, toYM);
  }
  // 둘 다 없으면: 전체를 가져오되, 서비스 보호용으로 "최근 24개월" 디폴트 적용(권장)
  // - 원하면 이 정책을 제거하고 전체를 다 fetch하도록 바꿀 수 있음
  if (!range.from && !range.to) {
    const { from: curFrom, to: curTo } = currentMonthRangeKst();

    // 24개월 전(대략): 현재 월 시작에서 23개월 이전 월로 이동
    const cur = new Date(curFrom);
    const kstMs = cur.getTime() + 9 * 60 * 60 * 1000;
    const kst = new Date(kstMs);
    let y = kst.getUTCFullYear();
    let m0 = kst.getUTCMonth(); // 0~11

    m0 -= 23;
    while (m0 < 0) {
      m0 += 12;
      y -= 1;
    }
    const r = monthRangeFromYearMonthKst(y, m0);
    range = { from: r.from, to: curTo };
  }

  if (range.from && range.to) validateFromTo(range.from, range.to);

  const games = await reportsRepo.fetchGamesByUser(userId, {
    from: range.from,
    to: range.to,
    sort: 'asc',
    fields: 'score inning result gameDate',
  });

  const rows = buildMonthlyRows(games, { sort: 'asc' });

  return {
    range: { from: toIso(range.from), to: toIso(range.to) },
    rows,
  };
}

/** ---------------- Dashboard (고도화) ----------------
 * 추천 쿼리:
 * /me/reports/dashboard?recent=10&months=6&includeRecentGames=1&includeGps=1
 */
async function getDashboardReport(
  userId,
  { recent = 10, includeRecentGames = false, includeGps = false } = {}
) {
  const recentN = normalizeLimit(recent, { def: 10, min: 1, max: 50 });
  // const monthsN = normalizeLimit(months, { def: 6, min: 1, max: 24 });

  // 유저(핸디) — includeGps일 때만 필요
  let user = null;
  if (includeGps) {
    user = await User.findById(userId).select('handicap nickname').lean();
    if (!user) httpError(404, '사용자를 찾을 수 없습니다.');
  }

  // 최근 N판 가져오기
  const recentGames = await reportsRepo.fetchGamesByUser(userId, {
    limit: recentN,
    sort: 'desc',
    fields: 'score inning result gameDate gameType memo',
  });
  // 최근 N판 통계
  const recentSummary = summarizeGames(recentGames);

  // 이번달 통계 가져오기
  const thisMonth = await getCurrentMonthReport(userId);

  // // 월별 트렌드(최근 monthsN개월)
  // const { from: curFrom } = currentMonthRangeKst();
  // const cur = new Date(curFrom.getTime() + 9 * 60 * 60 * 1000);

  // let y = cur.getUTCFullYear();
  // let m0 = cur.getUTCMonth();
  // m0 -= (monthsN - 1);
  // while (m0 < 0) {
  //   m0 += 12;
  //   y -= 1;
  // }

  // const trendFrom = monthRangeFromYearMonthKst(y, m0).from;
  // const trendTo = currentMonthRangeKst().to;

  // // 해당 기간 게임 가져옴
  // const trendGames = await reportsRepo.fetchGamesByUser(userId, {
  //   from: trendFrom,
  //   to: trendTo,
  //   sort: 'asc',
  //   fields: 'score inning result gameDate',
  // });

  // // 가져온 게임들의ㅣ 통계
  // const trend = buildMonthlyRows(trendGames, { sort: 'asc' });

  // recentGames에 gps 붙이기(옵션)
  let recentGamesOut = undefined;
  if (includeRecentGames) {
    if (includeGps) {
      recentGamesOut = recentGames.map((g) => {
        const r = evaluateGameGps(g, user, { explain: false });
        return { ...g, gps: r.gps }; // gps만 붙임(benchmark/raw는 굳이 안 붙임)
      });
    } else {
      recentGamesOut = recentGames;
    }
  }

  return {
    recent: { window: recentN, ...recentSummary },
    thisMonth,
    // trend: { months: monthsN, rows: trend },
    ...(includeRecentGames ? { recentGames: recentGamesOut } : {}),
  };
}

/** ---------------- Game evaluation ---------------- */
async function getGameEvaluation(userId, gameId, { explain = false } = {}) {
  const game = await reportsRepo.fetchGameByIdAndUser(gameId, userId, {
    fields: 'score inning result gameType gameDate memo',
  });

  if (!game) httpError(404, '게임을 찾을 수 없습니다.');

  const user = await User.findById(userId).select('handicap nickname').lean();
  if (!user) httpError(404, '사용자를 찾을 수 없습니다.');

  const rating = evaluateGameGps(game, user, { explain });

  return {
    gameId: String(game._id),
    game,
    ...rating,
  };
}

module.exports = {
  getDashboardReport,
  getRangeReport,
  getCurrentMonthReport,
  getMonthlyTimeline,
  getGameEvaluation,
};





