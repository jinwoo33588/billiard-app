// src/features/insights/api.ts
import axiosInstance from "../../api/axiosInstance";
import type { InsightsResponse } from "./types";

export async function fetchInsights(windowSize: number): Promise<InsightsResponse> {
  // ✅ 백엔드 라우트에 맞게 여기만 바꾸면 됨
  // 예: "/me/insights" 또는 "/users/insights"
  const res = await axiosInstance.get<InsightsResponse>("/me/insights", {
    params: { window: windowSize },
  });
  return res.data;
}