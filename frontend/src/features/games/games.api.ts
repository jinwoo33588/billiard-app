// frontend/src/features/games/games.api.ts
import axiosInstance from "../../api/axiosInstance";
import { EP } from "../../api/endpoints";
import type { Game, CreateGamePayload, UpdateGamePayload } from "./types";

export type ListMyGamesParams = {
  limit?: number;
  from?: string; // YYYY-MM-DD
  to?: string;   // YYYY-MM-DD
};

export async function listMyGamesApi(params?: ListMyGamesParams): Promise<Game[]> {
  const res = await axiosInstance.get<Game[]>(EP.games, { params });
  return res.data;
}

export async function getMyGameApi(id: string): Promise<Game> {
  const res = await axiosInstance.get<Game>(`${EP.games}/${id}`);
  return res.data;
}

export async function createMyGameApi(payload: CreateGamePayload): Promise<Game> {
  const res = await axiosInstance.post<Game>(EP.games, payload);
  return res.data;
}

export async function updateMyGameApi(id: string, patch: UpdateGamePayload): Promise<Game> {
  const res = await axiosInstance.patch<Game>(`${EP.games}/${id}`, patch);
  return res.data;
}

export async function deleteMyGameApi(id: string): Promise<{ ok: true; id: string }> {
  const res = await axiosInstance.delete<{ ok: true; id: string }>(`${EP.games}/${id}`);
  return res.data;
}