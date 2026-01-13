import axiosInstance from "../../shared/api/axiosInstance";
import type { MonthlySeriesResponse, StatsResponse } from "./types";

const BASE = "/me"; // 너 백엔드가 /me 라우트로 되어있음

export async function fetchStatsAll(): Promise<StatsResponse> {
  const { data } = await axiosInstance.get(`${BASE}/stats`, {
    params: { type: "all" },
  });
  return data;
}

export async function fetchStatsRange(from: string, to: string): Promise<StatsResponse> {
  const { data } = await axiosInstance.get(`${BASE}/stats`, {
    params: { type: "range", from, to },
  });
  return data;
}

export async function fetchStatsThisMonth(now?: string): Promise<StatsResponse> {
  const { data } = await axiosInstance.get(`${BASE}/stats`, {
    params: { type: "thisMonth", ...(now ? { now } : {}) },
  });
  return data;
}

export async function fetchStatsYearMonth(year: number, month: number): Promise<StatsResponse> {
  const { data } = await axiosInstance.get(`${BASE}/stats`, {
    params: { type: "yearMonth", year, month },
  });
  return data;
}

export async function fetchStatsLastN(n: number): Promise<StatsResponse> {
  const { data } = await axiosInstance.get(`${BASE}/stats`, {
    params: { type: "lastN", n },
  });
  return data;
}

export async function fetchMonthlySeries(params?: {
  fromMonthKey?: string; // "YYYY-MM"
  toMonthKey?: string;   // "YYYY-MM"
}): Promise<MonthlySeriesResponse> {
  const { data } = await axiosInstance.get(`${BASE}/stats/monthly`, {
    params: {
      ...(params?.fromMonthKey ? { fromMonthKey: params.fromMonthKey } : {}),
      ...(params?.toMonthKey ? { toMonthKey: params.toMonthKey } : {}),
    },
  });
  return data;
}