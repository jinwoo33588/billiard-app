export type User = {
  _id: string;
  email: string;
  nickname: string;
  handicap: number;
};

export type LoginResponse = {
  message: string;
  user: User;
  token: string;
};