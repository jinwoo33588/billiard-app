import type { HandicapBenchmarksResponse } from "./types";

import axiosInstance from "../../shared/api/axiosInstance";

export async function getHandicapBenchmarksApi(): Promise<HandicapBenchmarksResponse> {
  const res = await axiosInstance.get("/meta/handicap-benchmarks");
  return res.data;
}