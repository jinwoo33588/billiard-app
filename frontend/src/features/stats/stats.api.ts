// frontend/src/features/stats/stats.api.ts

/**
 * stats.api.ts
 * - Stats 관련 API 호출만 담당한다.
 * - HomePage/InsightsPage 등에서 공통으로 사용한다.
 */

import axiosInstance from "../../api/axiosInstance";
import type { StatsSummary } from "./types";

export type GetMyStatsParams = {
  // 기간 모드
  from?: string; // "YYYY-MM-DD"
  to?: string;   // "YYYY-MM-DD"
  // 최근 N판 모드
  limit?: number;
};

export async function getMyStats(params?: GetMyStatsParams): Promise<StatsSummary> {
  // ✅ baseURL에 /api가 포함된 기준
  const res = await axiosInstance.get<StatsSummary>("/me/stats", {
    params,
  });
  return res.data;
}
