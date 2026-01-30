import axiosInstance from "../../api/axiosInstance";
import { EP } from "../../api/endpoints";
import type { AdminOverview, AdminUserDashboard, AdminUserSummary, AdminUserWithGames } from "./types";
import type { Game } from "../games/types";

export async function getAdminOverviewApi(): Promise<AdminOverview> {
  const { data } = await axiosInstance.get(`${EP.admin}/overview`);
  return data;
}

export async function listAdminUsersApi(params?: {
  limit?: number;
  q?: string;
  includeGames?: boolean;
  gameLimit?: number;
  mode?: "all" | "month" | "recent";
  recentLimit?: number;
}): Promise<(AdminUserSummary | AdminUserWithGames)[]> {
  const { data } = await axiosInstance.get(`${EP.admin}/users`, { params });
  return data.items ?? [];
}

export async function listAdminUserGamesApi(
  userId: string,
  params?: { limit?: number; from?: string; to?: string }
): Promise<Game[]> {
  const { data } = await axiosInstance.get(`${EP.admin}/users/${userId}/games`, { params });
  return data.items ?? [];
}

export async function getAdminUserDashboardApi(
  userId: string,
  params?: { recent?: number; insightsLimit?: number }
): Promise<AdminUserDashboard> {
  const { data } = await axiosInstance.get(`${EP.admin}/users/${userId}/dashboard`, { params });
  return data;
}
