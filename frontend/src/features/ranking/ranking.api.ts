import axiosInstance from "../../api/axiosInstance";
import { EP } from "../../api/endpoints";
import type { RankingMode, RankingMetric, RankingResponse } from "./types";

export async function getRankingApi(params?: {
  mode?: RankingMode;
  metric?: RankingMetric;
  limit?: number;
}): Promise<RankingResponse> {
  const res = await axiosInstance.get<RankingResponse>(EP.ranking, { params });
  return res.data;
}