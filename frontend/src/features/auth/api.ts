import axiosInstance from "../../shared/api/axiosInstance";
import { EP } from "../../shared/api/endpoints";
import type { LoginResponse, User } from "./types";

export async function loginApi(email: string, password: string) {
  const res = await axiosInstance.post<LoginResponse>(EP.auth.login, {
    email,
    password,
  });
  return res.data;
}

export async function registerApi(payload: {
  email: string;
  password: string;
  nickname: string;
  handicap: number;
}) {
  const res = await axiosInstance.post(EP.auth.register, payload);
  return res.data;
}

export async function getMeApi() {
  const res = await axiosInstance.get<User>(EP.me.root);
  return res.data;
}

export async function updateMeApi(payload: Partial<Pick<User, "nickname" | "handicap">>) {
  const res = await axiosInstance.put<User>(EP.me.root, payload);
  return res.data;
}