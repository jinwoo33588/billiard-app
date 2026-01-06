// src/features/users/types.ts
import type { Game } from "../games/types";

export type PublicUser = {
  _id: string;
  nickname: string;
  handicap?: number;
};

export type PublicUserProfileResponse = PublicUser;
export type PublicUserGamesResponse = Game[];