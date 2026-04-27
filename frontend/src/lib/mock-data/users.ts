import type { User } from "@/types/user";

export const mockUsers: User[] = [
  {
    id: "user-admin",
    login: "admin",
    password: "admin",
    role: "admin",
    fullName: "Администратор системы",
    createdAt: "2026-04-27T00:00:00.000Z"
  },
  {
    id: "user-operator",
    login: "operator",
    password: "operator",
    role: "operator",
    fullName: "Оператор паспортного стола",
    createdAt: "2026-04-27T00:00:00.000Z"
  }
];
