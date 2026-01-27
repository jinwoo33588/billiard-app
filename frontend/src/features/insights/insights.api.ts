// frontend/src/features/insights/insights.api.ts
import axiosInstance from "../../api/axiosInstance";
import { EP } from "../../api/endpoints";
import type { InsightsResponse, WindowMode } from "./types";

export async function getMyInsightsApi(params: {
  mode?: WindowMode;
  limit?: number;
  from?: string;
  to?: string;
}): Promise<InsightsResponse> {
  // EP.insights = "/api/me/insights" 이런 식으로 잡아두면 깔끔
  const res = await axiosInstance.get<InsightsResponse>(EP.insights, { params });
  return res.data;
}