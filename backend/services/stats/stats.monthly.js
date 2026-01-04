const { fetchMyGamesForStats } = require("./stats.service");
const selectors = require("./stats.selectors");
const { calcStats } = require("./stats.calc");

function pad2(n) {
  return String(n).padStart(2, "0");
}
function toMonthKey(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}`;
}
function toLabel(date) {
  return `${date.getFullYear()}.${pad2(date.getMonth() + 1)}`;
}
function addMonths(date, delta) {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}
function monthStart(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

async function buildMonthlyStatsForUser(userId, options = {}) {
  const games = await fetchMyGamesForStats(userId);

  // 1) selector 적용 (기존과 동일)
  const sel = options.selector || { type: "all" };
  let slice = [];

  switch (sel.type) {
    case "lastN":
      slice = selectors.selectLastN(games, sel.n);
      break;
    case "range":
      slice = selectors.selectByRange(games, { from: sel.from, to: sel.to });
      break;
    case "thisMonth":
      slice = selectors.selectThisMonth(games, sel.now ? new Date(sel.now) : new Date());
      break;
    case "yearMonth":
      slice = selectors.selectYearMonth(games, { year: sel.year, month: sel.month });
      break;
    case "all":
    default:
      slice = selectors.selectAll(games);
      break;
  }

  // ✅ slice가 비면 rows는 빈 배열
  if (!slice.length) {
    return { selector: sel, updatedAt: new Date().toISOString(), rows: [] };
  }

  // 2) 월별로 그룹핑
  const byMonth = new Map(); // key -> games[]
  let minD = null;
  let maxD = null;

  for (const g of slice) {
    const d = new Date(g.gameDate);
    if (Number.isNaN(d.getTime())) continue;

    if (!minD || d < minD) minD = d;
    if (!maxD || d > maxD) maxD = d;

    const key = toMonthKey(d);
    if (!byMonth.has(key)) byMonth.set(key, []);
    byMonth.get(key).push(g);
  }

  if (!minD || !maxD) {
    return { selector: sel, updatedAt: new Date().toISOString(), rows: [] };
  }

  // 3) ✅ 연속 월 채우기(0경기 월 포함)
  const start = monthStart(minD);
  const end = monthStart(maxD);

  const rows = [];
  let cursor = start;

  while (cursor <= end) {
    const key = toMonthKey(cursor);
    const label = toLabel(cursor);

    const gamesInMonth = byMonth.get(key) || [];

    if (!gamesInMonth.length) {
      rows.push({
        monthKey: key,
        label,
        games: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        winRate: null,
        average: null,
      });
    } else {
      const s = calcStats(gamesInMonth);
      rows.push({
        monthKey: key,
        label,
        games: gamesInMonth.length,
        wins: s.wins,
        draws: s.draws,
        losses: s.losses,
        winRate: typeof s.winRate === "number" ? s.winRate : null,
        average: typeof s.average === "number" ? s.average : null,
      });
    }

    cursor = addMonths(cursor, 1);
  }

  return {
    selector: sel,
    updatedAt: new Date().toISOString(),
    rows,
  };
}

module.exports = { buildMonthlyStatsForUser };