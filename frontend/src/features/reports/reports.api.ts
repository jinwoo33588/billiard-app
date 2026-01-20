import axiosInstance from "../../shared/api/axiosInstance";
import type { DashboardQuery, DashboardReport } from "./dashboard.types";

export async function fetchDashboard(query: DashboardQuery = {}): Promise<DashboardReport> {
  const {
    recent = 10,
    months = 6,
    includeRecentGames = true,
    includeGps = true,
  } = query;

  const res = await axiosInstance.get<DashboardReport>("/me/reports/dashboard", {
    params: {
      recent,
      months,
      includeRecentGames: includeRecentGames ? 1 : 0,
      includeGps: includeGps ? 1 : 0,
    },
  });

  return res.data;
}
