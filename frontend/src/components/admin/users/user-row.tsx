"use client";

import { Save, Shield, Trash2, UserRound } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import type { User, UserRole } from "@/types/user";
import { RoleSelect } from "./role-select";

const roleLabels: Record<UserRole, string> = {
  admin: "Администратор",
  operator: "Оператор"
};

type UserRowProps = {
  user: User;
  onDelete: (userId: string) => void;
  onSave: (userId: string, values: { fullName: string; login: string; role: UserRole }) => void;
};

export function UserRow({ user, onDelete, onSave }: UserRowProps) {
  const [fullName, setFullName] = useState(user.fullName);
  const [login, setLogin] = useState(user.login);
  const [role, setRole] = useState<UserRole>(user.role);
  const isAdmin = user.role === "admin";
  const Icon = isAdmin ? Shield : UserRound;

  return (
    <article className="flex min-h-[72px] items-center justify-between gap-4 rounded-[18px] border border-border bg-card px-4 py-3">
      <div className="flex min-w-0 items-center gap-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-foreground">
          <Icon className={isAdmin ? "h-4 w-4 text-primary" : "h-4 w-4"} />
        </span>
        <div className="grid min-w-0 grid-cols-[minmax(180px,260px)_minmax(140px,220px)] gap-2">
          <Input
            aria-label="Отображаемое имя"
            className="h-9 rounded-full text-[13px]"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder={roleLabels[role]}
          />
          <Input
            aria-label="Логин"
            className="h-9 rounded-full text-[13px]"
            value={login}
            onChange={(event) => setLogin(event.target.value)}
            placeholder="Логин"
          />
        </div>
      </div>

      <div className="flex items-center gap-5">
        <RoleSelect
          className="w-[158px]"
          value={role}
          aria-label={`Роль пользователя ${user.login}`}
          onChange={setRole}
        />
        <button
          className="flex h-9 w-9 items-center justify-center rounded-full text-foreground transition hover:bg-muted hover:text-primary"
          type="button"
          onClick={() => onSave(user.id, { fullName, login, role })}
          aria-label={`Сохранить пользователя ${user.login}`}
        >
          <Save className="h-4 w-4" />
        </button>
        <button
          className="flex h-9 w-9 items-center justify-center rounded-full text-destructive transition hover:bg-destructive/10"
          type="button"
          onClick={() => onDelete(user.id)}
          aria-label={`Удалить пользователя ${user.login}`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}
