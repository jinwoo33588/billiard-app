// frontend/src/features/games/utils/ratingBadge.ts
import type { Game } from "../types";

export type RatingBadgeKey = "CARRY" | "BUS" | "UNLUCKY" | "MY_ISSUE" | "NORMAL";

export type RatingBadge = {
  key: RatingBadgeKey;
  label: string;
  color: string; // Mantine Badge color
};

/**
 * ✅ 분류 기준(여기만 튜닝하면 전체 UI가 바뀜)
 * - 너가 말한대로 rating + result만 사용
 */
export function badgeFromRatingAndResult(rating: number | null | undefined, result: Game["result"]): RatingBadge {
  const r = typeof rating === "number" && Number.isFinite(rating) ? rating : null;

  // rating 없으면 분류 불가
  if (r === null) {
    return { key: "NORMAL", label: "보통", color: "gray" };
  }

  // 예시 기준(너가 원하는대로 바꾸면 됨)
  // - 고평점 승리: 캐리
  // - 저평점 승리: 버스
  // - 고평점 패배: 억울
  // - 저평점 패배: 내이슈
  // - 무/기타: 보통(또는 rating 기준으로만 분기해도 됨)
  if (result === "WIN") {
    if (r >= 60) return { key: "CARRY", label: "캐리", color: "green" };
    if (r <= 40) return { key: "BUS", label: "버스", color: "gray" };
    return { key: "NORMAL", label: "보통", color: "blue" };
  }

  if (result === "LOSE") {
    if (r >= 60) return { key: "UNLUCKY", label: "억울", color: "yellow" };
    if (r <= 40) return { key: "MY_ISSUE", label: "내이슈", color: "red" };
    return { key: "NORMAL", label: "보통", color: "blue" };
  }

  // DRAW/UNKNOWN
  return { key: "NORMAL", label: "보통", color: "blue" };
}