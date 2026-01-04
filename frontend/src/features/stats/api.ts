// src/features/stats/api.ts
import axiosInstance from "../../api/axiosInstance";
import { EP } from "../../api/endpoints";
import type { BuildStatsResponse, StatsSelector, MonthlyStatsResponse } from "./types";
import { selectorToQuery } from "./query";

export async function getMyStatsApi(selector: StatsSelector) {
  const res = await axiosInstance.get<BuildStatsResponse>(EP.me.stats, {
    params: selectorToQuery(selector),
  });
  return res.data;
}

export async function getMyMonthlyStatsApi(selector: StatsSelector) {
  const res = await axiosInstance.get<MonthlyStatsResponse>(EP.me.statsMonthly, {
    params: selectorToQuery(selector),
  });
  return res.data;
}

export * from "./types";