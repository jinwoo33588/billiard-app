// backend/services/stats/stats.selectors.js
function toDate(v) {
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

function inRange(date, start, end) {
  const t = date.getTime();
  return t >= start.getTime() && t <= end.getTime();
}

/**
 * ✅ 최근 N판 (이미 최신순이면 slice(0, n))
 * - 정렬은 repo/service에서 보장하는 게 깔끔 (gameDate desc)
 */
function selectLastN(games, n) {
  const k = Math.max(0, Math.min(Number(n) || 0, 500)); // 안전 상한
  if (!Array.isArray(games) || k <= 0) return [];
  return games.slice(0, k);
}

/**
 * ✅ 기간 선택 [from, to] (inclusive)
 * from/to는 Date or date-string
 */
function selectByRange(games, { from, to }) {
  if (!Array.isArray(games)) return [];
  const f = toDate(from);
  const t = toDate(to);

  // 둘 다 없으면 전체
  if (!f && !t) return games;

  const start = f ?? new Date(0);
  const end = t ?? new Date(); // to 없으면 현재까지
  end.setHours(23, 59, 59, 999);

  return games.filter((g) => {
    const d = toDate(g.gameDate);
    if (!d) return false;
    return inRange(d, start, end);
  });
}

/**
 * ✅ 이번달 (로컬 기준)
 */
function selectThisMonth(games, now = new Date()) {
  if (!Array.isArray(games)) return [];
  const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  return games.filter((g) => {
    const d = toDate(g.gameDate);
    if (!d) return false;
    return inRange(d, start, end);
  });
}

/**
 * ✅ 연/월 선택 (month: 1~12)
 */
function selectYearMonth(games, { year, month }) {
  if (!Array.isArray(games)) return [];
  const y = Number(year);
  const m = Number(month);
  if (!Number.isInteger(y) || !Number.isInteger(m) || m < 1 || m > 12) return [];

  const start = new Date(y, m - 1, 1, 0, 0, 0, 0);
  const end = new Date(y, m, 0, 23, 59, 59, 999);

  return games.filter((g) => {
    const d = toDate(g.gameDate);
    if (!d) return false;
    return inRange(d, start, end);
  });
}

/**
 * ✅ “전체” selector (의미상 명시용)
 */
function selectAll(games) {
  return Array.isArray(games) ? games : [];
}

module.exports = {
  selectAll,
  selectLastN,
  selectByRange,
  selectThisMonth,
  selectYearMonth,
};