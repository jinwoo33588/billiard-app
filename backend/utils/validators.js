// backend/utils/validators.js

function httpError(status, message) {
  const e = new Error(message);
  e.status = status;
  throw e;
}

function badRequest(message) {
  httpError(400, message);
}

function isBlank(v) {
  return v === undefined || v === null || v === '';
}

/** 정수(optional). 없으면 undefined. 숫자/정수 아니면 400 */
function parseOptionalInt(value, fieldName) {
  if (isBlank(value)) return undefined;

  const n = Number(value);
  if (!Number.isFinite(n) || !Number.isInteger(n)) {
    badRequest(`${fieldName}는 정수여야 합니다.`);
  }
  return n;
}

/** 숫자(required). 숫자 아니면 400. min 있으면 min 미만이면 400 */
function parseRequiredNumber(value, fieldName, { min } = {}) {
  if (isBlank(value)) badRequest(`${fieldName}는 필수입니다.`);

  const n = Number(value);
  if (!Number.isFinite(n)) badRequest(`${fieldName}는 숫자여야 합니다.`);
  if (min !== undefined && n < min) badRequest(`${fieldName}는 ${min} 이상이어야 합니다.`);
  return n;
}

/** 문자열(optional). 없으면 undefined. trim/maxLen 적용 */
function parseOptionalString(value, fieldName, { trim = true, maxLen } = {}) {
  if (isBlank(value)) return undefined;

  let s = String(value);
  if (trim) s = s.trim();

  if (maxLen !== undefined && s.length > maxLen) {
    badRequest(`${fieldName}는 최대 ${maxLen}자입니다.`);
  }
  return s;
}

/** enum(optional). 없으면 defaultValue. allowed에 없으면 400 */
function parseEnum(value, fieldName, allowed, defaultValue) {
  if (isBlank(value)) return defaultValue;

  const v = String(value);
  if (!allowed.includes(v)) {
    badRequest(`${fieldName} 값이 올바르지 않습니다.`);
  }
  return v;
}

/**
 * KST 기준 date-only("YYYY-MM-DD")를 Date로 변환.
 * - endOfDay=false : 00:00:00.000 +09:00
 * - endOfDay=true  : 23:59:59.999 +09:00
 */
function parseOptionalDateOnlyKst(value, fieldName, { endOfDay = false } = {}) {
  if (isBlank(value)) return undefined;

  const s = String(value);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    badRequest(`${fieldName} 형식이 올바르지 않습니다. (YYYY-MM-DD)`);
  }

  const time = endOfDay ? '23:59:59.999' : '00:00:00.000';
  const d = new Date(`${s}T${time}+09:00`);

  if (Number.isNaN(d.getTime())) {
    badRequest(`${fieldName}가 올바르지 않습니다.`);
  }
  return d;
}

/**
 * body에서 날짜(required) 파싱.
 * - "YYYY-MM-DD"면 KST 00:00으로 고정
 * - 그 외는 Date 생성자(ISO 등) 허용
 */
function parseRequiredDate(value, fieldName) {
  if (isBlank(value)) badRequest(`${fieldName}는 필수입니다.`);

  const s = String(value);

  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const d = new Date(`${s}T00:00:00.000+09:00`);
    if (Number.isNaN(d.getTime())) badRequest(`${fieldName}가 올바르지 않습니다.`);
    return d;
  }

  const d = new Date(s);
  if (Number.isNaN(d.getTime())) badRequest(`${fieldName}가 올바르지 않습니다.`);
  return d;
}

/** sort 파라미터(optional): asc/desc만 허용. 없으면 undefined */
function parseOptionalSort(value, fieldName = 'sort') {
  if (isBlank(value)) return undefined;
  if (value === 'asc' || value === 'desc') return value;
  badRequest(`${fieldName}는 'asc' 또는 'desc'만 허용됩니다.`);
}

/** from/to 관계 검증(둘 다 있을 때) */
function validateFromTo(from, to, { fromName = 'from', toName = 'to' } = {}) {
  if (from && to && from.getTime() > to.getTime()) {
    badRequest(`${fromName}은(는) ${toName}보다 이후일 수 없습니다.`);
  }
}

//-------------------------------------------------------------------------------------------------------------

/** YYYY-MM (KST) -> { year, month0 } */
function parseOptionalMonthKeyKst(value, fieldName) {
  if (isBlank(value)) return undefined;

  const s = String(value);
  if (!/^\d{4}-\d{2}$/.test(s)) {
    badRequest(`${fieldName} 형식이 올바르지 않습니다. (YYYY-MM)`);
  }

  const [yy, mm] = s.split('-');
  const year = Number(yy);
  const month = Number(mm); // 1~12

  if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) {
    badRequest(`${fieldName} 값이 올바르지 않습니다.`);
  }

  return { year, month0: month - 1 };
}

/** (KST) year/month0 -> { from, to } */
function monthRangeFromYearMonthKst(year, month0) {
  if (!Number.isFinite(year) || !Number.isFinite(month0) || month0 < 0 || month0 > 11) {
    badRequest(`year/month 값이 올바르지 않습니다.`);
  }

  const m = String(month0 + 1).padStart(2, '0');
  const from = new Date(`${year}-${m}-01T00:00:00.000+09:00`);

  // 다음달 1일 00:00 - 1ms = 해당월 말일 23:59:59.999
  const nextMonth0 = month0 === 11 ? 0 : month0 + 1;
  const nextYear = month0 === 11 ? year + 1 : year;
  const nm = String(nextMonth0 + 1).padStart(2, '0');
  const nextFrom = new Date(`${nextYear}-${nm}-01T00:00:00.000+09:00`);
  const to = new Date(nextFrom.getTime() - 1);

  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
    badRequest(`month range 생성에 실패했습니다.`);
  }

  return { from, to };
}


module.exports = {
  httpError,
  badRequest,
  parseOptionalInt,
  parseRequiredNumber,
  parseOptionalString,
  parseEnum,
  parseOptionalDateOnlyKst,
  parseRequiredDate,
  parseOptionalSort,
  validateFromTo,
  parseOptionalMonthKeyKst,
  monthRangeFromYearMonthKst,
};
