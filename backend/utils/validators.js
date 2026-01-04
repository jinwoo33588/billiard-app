const mongoose = require('mongoose');

const GAME_RESULTS = ['WIN', 'DRAW', 'LOSE', 'UNKNOWN'];
const GAME_TYPES = ['UNKNOWN', '1v1', '2v2', '2v2v2', '3v3', '3v3v3'];

function isObjectId(value) {
  return mongoose.Types.ObjectId.isValid(String(value));
}

function toInt(value, def = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : def;
}

function toNumber(value, def = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : def;
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function toDate(value) {
  if (value === null || value === undefined || value === '') return null;

  // 숫자면 timestamp 가능성 처리(초 → 밀리초)
  if (typeof value === 'number') {
    const ms = value < 10_000_000_000 ? value * 1000 : value;
    const d = new Date(ms);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function normalizeResult(v) {
  if (!v) return 'UNKNOWN';
  const s = String(v).trim();

  // 한글 흡수
  if (s === '승') return 'WIN';
  if (s === '무') return 'DRAW';
  if (s === '패') return 'LOSE';

  const u = s.toUpperCase();
  if (u === 'W') return 'WIN';
  if (u === 'D') return 'DRAW';
  if (u === 'L') return 'LOSE';

  if (GAME_RESULTS.includes(u)) return u;
  return 'UNKNOWN';
}

function normalizeGameType(v) {
  if (!v) return 'UNKNOWN';
  const s = String(v).trim();

  // vs, VS, V 등 모두 'v'로 통일 + 공백 제거
  const normalized = s
    .replace(/\s+/g, '')
    .replace(/vs/gi, 'v')
    .replace(/V/g, 'v');

  if (GAME_TYPES.includes(normalized)) return normalized;
  return 'UNKNOWN';
}

function requireFields(obj, fields) {
  for (const f of fields) {
    if (obj[f] === undefined || obj[f] === null || obj[f] === '') {
      const e = new Error(`필수 값 누락: ${f}`);
      e.status = 400;
      throw e;
    }
  }
}

function validateWindow(window) {
  const w = clamp(toInt(window, 10), 1, 50);
  return w;
}

function validateGameCreate(body) {
  requireFields(body, ['score', 'inning', 'gameDate']);

  const score = toNumber(body.score, NaN);
  const inning = toNumber(body.inning, NaN);
  const gameDate = toDate(body.gameDate);

  if (!Number.isFinite(score) || score < 0) {
    const e = new Error('score는 0 이상의 숫자여야 합니다.');
    e.status = 400;
    throw e;
  }

  if (!Number.isFinite(inning) || inning < 1) {
    const e = new Error('inning은 1 이상의 숫자여야 합니다.');
    e.status = 400;
    throw e;
  }

  if (!gameDate) {
    const e = new Error('gameDate가 올바르지 않습니다.');
    e.status = 400;
    throw e;
  }

  return {
    score,
    inning,
    result: normalizeResult(body.result),
    gameType: normalizeGameType(body.gameType),
    gameDate,
    memo: body.memo ? String(body.memo) : '',
  };
}

function validateGameUpdate(body) {
  // 부분 업데이트도 가능하게(원하면 필수로 바꿔도 됨)
  const out = {};
  if (body.score !== undefined) {
    const score = toNumber(body.score, NaN);
    if (!Number.isFinite(score) || score < 0) {
      const e = new Error('score는 0 이상의 숫자여야 합니다.');
      e.status = 400;
      throw e;
    }
    out.score = score;
  }

  if (body.inning !== undefined) {
    const inning = toNumber(body.inning, NaN);
    if (!Number.isFinite(inning) || inning < 1) {
      const e = new Error('inning은 1 이상의 숫자여야 합니다.');
      e.status = 400;
      throw e;
    }
    out.inning = inning;
  }

  if (body.result !== undefined) out.result = normalizeResult(body.result);
  if (body.gameType !== undefined) out.gameType = normalizeGameType(body.gameType);

  if (body.gameDate !== undefined) {
    const gameDate = toDate(body.gameDate);
    if (!gameDate) {
      const e = new Error('gameDate가 올바르지 않습니다.');
      e.status = 400;
      throw e;
    }
    out.gameDate = gameDate;
  }

  if (body.memo !== undefined) out.memo = String(body.memo).trim();

  if (Object.keys(out).length === 0) {
    const e = new Error('수정할 필드가 없습니다.');
    e.status = 400;
    throw e;
  }

  return out;
}

function validateUpdateMe(body) {
  const out = {};
  if (body.nickname !== undefined) out.nickname = String(body.nickname).trim();
  if (body.handicap !== undefined) out.handicap = toNumber(body.handicap, 0);

  if (out.nickname !== undefined && out.nickname.length < 1) {
    const e = new Error('nickname이 올바르지 않습니다.');
    e.status = 400;
    throw e;
  }

  if (out.handicap !== undefined && !Number.isFinite(out.handicap)) {
    const e = new Error('handicap이 올바르지 않습니다.');
    e.status = 400;
    throw e;
  }

  if (Object.keys(out).length === 0) {
    const e = new Error('수정할 필드가 없습니다.');
    e.status = 400;
    throw e;
  }

  return out;
}

function validateRankingQuery(query) {
  const year = query.year !== undefined ? toInt(query.year, NaN) : NaN;
  const month = query.month !== undefined ? toInt(query.month, NaN) : NaN;

  const hasMonthFilter =
    Number.isInteger(year) &&
    Number.isInteger(month) &&
    month >= 1 &&
    month <= 12;

  return { hasMonthFilter, year, month };
}

/**
 * ✅ /api/me/stats 용 쿼리 검증/파싱
 *
 * 지원:
 * - selector=all
 * - selector=lastN&n=20
 * - selector=thisMonth&now=ISO(optional)
 * - selector=yearMonth&year=2026&month=1
 * - selector=range&from=ISO&to=ISO
 *
 * pick:
 * - pick=counts,avg,winRate   (없으면 null => FULL 반환)
 */
function validateStatsQuery(query) {
  const selector = String(query.selector || 'all').trim();

  // pick=counts,avg,winRate
  const pick =
    query.pick === undefined || query.pick === null || String(query.pick).trim() === ''
      ? null
      : String(query.pick)
          .split(',')
          .map((x) => x.trim())
          .filter(Boolean);

  if (selector === 'lastN') {
    const n = clamp(toInt(query.n, 20), 1, 200);
    return { pick, selector: { type: 'lastN', n } };
  }

  if (selector === 'thisMonth') {
    const now = query.now ? toDate(query.now) : null;
    return {
      pick,
      selector: {
        type: 'thisMonth',
        ...(now ? { now: now.toISOString() } : {}),
      },
    };
  }

  if (selector === 'yearMonth') {
    const year = toInt(query.year, NaN);
    const month = toInt(query.month, NaN);

    if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
      const e = new Error('yearMonth는 year(YYYY), month(1~12)가 필요합니다.');
      e.status = 400;
      throw e;
    }

    return { pick, selector: { type: 'yearMonth', year, month } };
  }

  if (selector === 'range') {
    const from = toDate(query.from);
    const to = toDate(query.to);

    if (!from || !to) {
      const e = new Error('range는 from/to(ISO date)가 필요합니다.');
      e.status = 400;
      throw e;
    }
    if (from.getTime() > to.getTime()) {
      const e = new Error('range는 from <= to 이어야 합니다.');
      e.status = 400;
      throw e;
    }

    return { pick, selector: { type: 'range', from: from.toISOString(), to: to.toISOString() } };
  }

  // 기본 all
  return { pick, selector: { type: 'all' } };
}

module.exports = {
  isObjectId,
  validateWindow,
  validateGameCreate,
  validateGameUpdate,
  validateUpdateMe,
  validateRankingQuery,
  validateStatsQuery, // ✅ 추가
  normalizeResult,
  normalizeGameType,
  clamp,
  toInt,
  toNumber,
  toDate,
};