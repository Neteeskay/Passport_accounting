"use client";

import { Shield, Trash2, UserRound } from "lucide-react";
import type { User, UserRole } from "@/types/user";
import { RoleSelect } from "./role-select";

const roleLabels: Record<UserRole, string> = {
  admin: "Администратор",
  operator: "Оператор"
};

type UserRowProps = {
  user: User;
  onDelete: (userId: string) => void;
  onRoleChange: (userId: string, role: UserRole) => void;
};

export function UserRow({ user, onDelete, onRoleChange }: UserRowProps) {
  const isAdmin = user.role === "admin";
  const Icon = isAdmin ? Shield : UserRound;
  const displayName = user.fullName || roleLabels[user.role];

  return (
    <article className="flex min-h-[72px] items-center justify-between gap-4 rounded-[18px] border border-border bg-card px-4 py-3">
      <div className="flex min-w-0 items-center gap-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-foreground">
          <Icon className={isAdmin ? "h-4 w-4 text-primary" : "h-4 w-4"} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-[15px] font-semibold leading-5 text-foreground">
            {displayName}
          </p>
          <p className="mt-0.5 truncate text-[13px] leading-4 text-foreground">@{user.login}</p>
        </div>
      </div>

      <div className="flex items-center gap-5">
        <RoleSelect
          className="w-[158px]"
          value={user.role}
          aria-label={`Роль пользователя ${user.login}`}
          onChange={(role) => onRoleChange(user.id, role)}
        />
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
