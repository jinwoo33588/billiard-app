/**
 * date.ts
 * - 앱 전역에서 날짜/시간을 일관된 형식으로 표시하기 위한 유틸 모음
 * - "로직용 키"와 "표시용 포맷"을 분리해서 관리한다.
 *
 * 기준:
 * - 입력은 ISO 문자열(예: "2025-10-01T08:13:30.997Z") 또는 Date
 * - 출력은 UI 표시용 문자열
 */

type DateInput = string | Date;

const KOR_DOW = ["일", "월", "화", "수", "목", "금", "토"] as const;

function toDate(input: DateInput): Date | null {
  const d = input instanceof Date ? input : new Date(input);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** ✅ 로직용: 로컬 기준 YYYY-MM-DD (그룹핑/필터/정렬에 유리) */
export function dayKeyLocal(input: DateInput): string {
  const d = toDate(input);
  if (!d) return typeof input === "string" ? input.slice(0, 10) : "";

  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

/** ✅ 표시용: YY.MM.DD */
export function fmtYYMMDD(input: DateInput): string {
  const d = toDate(input);
  if (!d) return String(input);

  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yy}.${mm}.${dd}`;
}

/** ✅ 표시용: YY.MM.DD (요일) */
export function fmtYYMMDD_DOW(input: DateInput): string {
  const d = toDate(input);
  if (!d) return String(input);

  const base = fmtYYMMDD(d);
  const dow = KOR_DOW[d.getDay()];
  return `${base} (${dow})`;
}

/** ✅ 표시용(섹션 헤더): YYYY.MM.DD */
export function fmtYYYYMMDD(input: DateInput): string {
  const d = toDate(input);
  if (!d) return String(input);

  const y = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}.${mm}.${dd}`;
}

/** ✅ 표시용(섹션 헤더): YYYY.MM.DD (요일) */
export function fmtYYYYMMDD_DOW(input: DateInput): string {
  const d = toDate(input);
  if (!d) return String(input);

  const base = fmtYYYYMMDD(d);
  const dow = KOR_DOW[d.getDay()];
  return `${base} (${dow})`;
}

/** ✅ 표시용(시간): HH:mm */
export function fmtHHmm(input: DateInput): string {
  const d = toDate(input);
  if (!d) return String(input);

  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

/** ✅ 표시용: YY.MM.DD HH:mm */
export function fmtYYMMDD_HHmm(input: DateInput): string {
  const d = toDate(input);
  if (!d) return String(input);

  return `${fmtYYMMDD(d)} ${fmtHHmm(d)}`;
}

export function monthKeyLocal(iso: string) {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`; // 예: 2026-01
}


/**
 * ✅ 표시용: "2026년 1월"
 * - input이 "2026-01" 같은 monthKey여도 되고,
 * - ISO/Date여도 됨.
 */
export function fmtMonthLabel(input: DateInput): string {
  // 1) "YYYY-MM" 형태면 직접 파싱
  if (typeof input === "string" && /^\d{4}-\d{2}$/.test(input)) {
    const [y, m] = input.split("-");
    return `${y}년 ${Number(m)}월`;
  }

  // 2) ISO/Date면 Date로 변환 후 처리
  const d = toDate(input);
  if (!d) return String(input);

  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  return `${y}년 ${m}월`;
}