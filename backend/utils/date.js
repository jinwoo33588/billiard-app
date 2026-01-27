/**
 * utils/date.js
 * - YYYY-MM-DD 형태의 날짜 문자열을 다룰 때 쓰는 유틸
 * - 기간(from/to) 필터에서 "하루의 시작/끝"을 만들거나
 *   날짜 형식 검증에 재사용한다.
 */

function isYmd(s) {
  return typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

function startOfDay(ymd) {
  const d = new Date(ymd);
  if (Number.isNaN(d.getTime())) return null;
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(ymd) {
  const d = new Date(ymd);
  if (Number.isNaN(d.getTime())) return null;
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * from/to를 받아 MongoDB range query용 객체를 만든다.
 * - 둘 다 없으면 null 반환 (필터 없음)
 * - 유효하지 않으면 null 반환 (validator에서 먼저 걸러주는 걸 권장)
 */
function buildDateRange(from, to) {
  if (!from && !to) return null;

  const range = {};
  if (from) range.$gte = startOfDay(from);
  if (to) range.$lte = endOfDay(to);

  // startOfDay/endOfDay가 null이면 잘못된 날짜 → range 쓸 수 없음
  if ((from && !range.$gte) || (to && !range.$lte)) return null;

  return range;
}

module.exports = {
  isYmd,
  startOfDay,
  endOfDay,
  buildDateRange,
};