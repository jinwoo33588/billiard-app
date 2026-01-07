// src/features/users/api.ts
import axiosInstance from "../../shared/api/axiosInstance";
import { EP } from "../../shared/api/endpoints";
import type { PublicUserProfileResponse, PublicUserGamesResponse } from "./types";

export async function getUserProfileApi(userId: string) {
  const res = await axiosInstance.get<PublicUserProfileResponse>(EP.users.profile(userId));
  return res.data;
}

export async function listUserGamesApi(userId: string, params?: { limit?: number }) {
  // 백엔드에서 limit 지원하면 params로 바로 먹음 (지원 안하면 무시됨)
  const res = await axiosInstance.get<PublicUserGamesResponse>(EP.users.games(userId), {
    params,
  });
  return res.data;
}

export * from "./types";