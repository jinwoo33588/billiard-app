import axiosInstance from "../../api/axiosInstance";
import { EP } from "../../api/endpoints";
import type {
  AuthResponse,
  RegisterPayload,
  LoginPayload,
  UserPublic,
} from "./types";

export async function registerApi(
  payload: RegisterPayload,
): Promise<AuthResponse> {
  const res = await axiosInstance.post<AuthResponse>(EP.register, payload);
  return res.data;
}

export async function loginApi(payload: LoginPayload): Promise<AuthResponse> {
  const res = await axiosInstance.post<AuthResponse>(EP.login, payload);
  return res.data;
}

export async function guestLoginApi(userId: string): Promise<AuthResponse> {
  const res = await axiosInstance.post<AuthResponse>(
    `${EP.guest}/${userId}`,
    {},
  );
  return res.data;
}

export async function getMeApi(): Promise<UserPublic> {
  const res = await axiosInstance.get<UserPublic>(EP.me);
  return res.data;
}
