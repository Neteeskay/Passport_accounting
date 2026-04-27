export type UserRole = "operator" | "admin";

export type User = {
  id: string;
  login: string;
  password: string;
  role: UserRole;
  fullName: string;
  createdAt: string;
};
