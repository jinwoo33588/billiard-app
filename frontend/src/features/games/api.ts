//frontend/src/features/games/api.ts

import axiosInstance from "../../shared/api/axiosInstance";
import { EP } from "../../shared/api/endpoints";
import type { Game } from "./types";

export async function listMyGamesApi(params?: { limit?: number }) {
  const res = await axiosInstance.get<Game[]>(EP.me.games, {
    params,
  });
  return res.data;
}

export async function createMyGameApi(payload: Partial<Game>) {
  const res = await axiosInstance.post<Game>(EP.me.games, payload);
  return res.data;
}

export async function updateMyGameApi(gameId: string, payload: Partial<Game>) {
  const res = await axiosInstance.put<Game>(`${EP.me.games}/${gameId}`, payload);
  return res.data;
}

export async function deleteMyGameApi(gameId: string) {
  const res = await axiosInstance.delete(`${EP.me.games}/${gameId}`);
  return res.data;
}