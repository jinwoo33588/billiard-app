// frontend/src/features/users/users.api.ts
import axiosInstance from "../../api/axiosInstance";
import { EP } from "../../api/endpoints";
import type { UserDashboardResponse } from "./types";

export async function getUserDashboardApi(userId: string, params?: { recent?: number }) {
  const res = await axiosInstance.get<UserDashboardResponse>(`${EP.users}/${userId}/dashboard`, {
    params,
  });
  return res.data;
}