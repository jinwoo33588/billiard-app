import axiosInstance from "../../api/axiosInstance";
import { EP } from "../../api/endpoints";
import type { InsightsResponse } from "./types";

export async function fetchMyInsights(windowSize: number): Promise<InsightsResponse> {
  const res = await axiosInstance.get<InsightsResponse>(EP.me.insights, {
    params: { window: windowSize },
  });
  return res.data;
}