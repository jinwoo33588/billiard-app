/**
 * utils/parse.js
 * - req.query / req.params 값 파싱 유틸
 * - 숫자 파싱, 범위 체크 등에 재사용
 */

function parseNumber(v) {
  if (v === undefined || v === null || v === "") return undefined;
  const n = Number(v);
  if (!Number.isFinite(n)) return null; // 파싱 실패
  return n;
}

/**
 * limit 파싱 (기본: 1~200 권장)
 */
function parseLimit(v, { min = 1, max = 200 } = {}) {
  const n = parseNumber(v);
  if (n === undefined) return undefined;
  if (n === null) return null;
  if (n < min || n > max) return null;
  return Math.floor(n);
}

module.exports = {
  parseNumber,
  parseLimit,
};