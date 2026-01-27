// backend/services/insights/handicap.lookup.js
// - constants/handicapBenchmarks.js(데이터) 기반으로
//   특정 핸디의 기대값(expected/min/max)을 반환한다.
// - 보간/클램프 로직은 여기서만 처리한다.

const { HANDICAP_BENCHMARKS } = require("../../constants/handicapBenchmarks");
const httpError = require("../../utils/httpError");

// 안전 숫자 변환
function toNumber(v) {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

// 선형 보간
function lerp(a, b, t) {
  return a + (b - a) * t;
}

// 표가 { handicap, expected, min, max } 형태라고 가정
function normalizeTable(table) {
  if (!Array.isArray(table) || table.length === 0) {
    throw httpError(500, "handicap benchmarks is empty");
  }

  // handicap 오름차순 정렬 보장
  const rows = [...table].sort((x, y) => x.handicap - y.handicap);

  // 기본 유효성 체크
  for (const r of rows) {
    if (
      typeof r.handicap !== "number" ||
      !Number.isFinite(r.handicap) ||
      toNumber(r.expected) === null ||
      toNumber(r.min) === null ||
      toNumber(r.max) === null
    ) {
      throw httpError(500, "invalid handicap benchmark row");
    }
  }

  return rows.map((r) => ({
    handicap: r.handicap,
    expected: Number(r.expected),
    min: Number(r.min),
    max: Number(r.max),
  }));
}

const TABLE = normalizeTable(HANDICAP_BENCHMARKS);

/**
 * ✅ 핸디 기준 기대값 조회
 * @param {number} handicap - 사용자의 현재 핸디(정수/실수 허용)
 * @returns {{handicap:number, expected:number, min:number, max:number, mode:'exact'|'interp'|'clamp'}}
 */
function lookupHandicapBenchmark(handicap) {
  const h = toNumber(handicap);
  if (h === null) throw httpError(400, "handicap must be a number");

  // 정확히 일치하는 row가 있으면 그걸 반환
  const exact = TABLE.find((r) => r.handicap === h);
  if (exact) return { ...exact, handicap: h, mode: "exact" };

  const first = TABLE[0];
  const last = TABLE[TABLE.length - 1];

  // 범위 밖이면 클램프
  if (h <= first.handicap) return { ...first, handicap: h, mode: "clamp" };
  if (h >= last.handicap) return { ...last, handicap: h, mode: "clamp" };

  // 사이 구간 찾기: lower < h < upper
  let lower = first;
  let upper = last;

  for (let i = 0; i < TABLE.length - 1; i++) {
    const a = TABLE[i];
    const b = TABLE[i + 1];
    if (a.handicap < h && h < b.handicap) {
      lower = a;
      upper = b;
      break;
    }
  }

  const t = (h - lower.handicap) / (upper.handicap - lower.handicap);

  return {
    handicap: h,
    expected: lerp(lower.expected, upper.expected, t),
    min: lerp(lower.min, upper.min, t),
    max: lerp(lower.max, upper.max, t),
    mode: "interp",
  };
}

module.exports = {
  lookupHandicapBenchmark,
};