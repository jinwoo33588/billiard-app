export type UserPublic = {
  id: string;
  email: string;
  nickname: string;
  handicap: number;
  createdAt?: string;
  updatedAt?: string;
};

export type AuthResponse = {
  token: string;
  user: UserPublic;
};

export type RegisterPayload = {
  email: string;
  password: string;
  nickname: string;
  handicap: number;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type AuthContextValue = {
  user: UserPublic | null;
  loading: boolean;
  isGuest: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  guestLogin: (userId: string) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
};