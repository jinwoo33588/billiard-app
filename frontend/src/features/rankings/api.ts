import axiosInstance from "../../api/axiosInstance";
import { EP } from "../../api/endpoints";
import type { RankingRow } from "./types";

export type GetRankingsParams =
  | { hasMonthFilter?: false }
  | { hasMonthFilter: true; year: number; month: number };

export async function getRankings(params?: GetRankingsParams) {
  const res = await axiosInstance.get<RankingRow[]>(EP.rankings, { params });
  return res.data;
}