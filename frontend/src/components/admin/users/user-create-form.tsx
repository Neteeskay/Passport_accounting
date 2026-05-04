"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { User, UserRole } from "@/types/user";
import { RoleSelect } from "./role-select";

type UserCreateFormProps = {
  onCancel: () => void;
  onCreate: (user: User) => void;
};

export function UserCreateForm({ onCancel, onCreate }: UserCreateFormProps) {
  const [login, setLogin] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("operator");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    onCreate({
      id: `user-${crypto.randomUUID()}`,
      login: login.trim(),
      password,
      role,
      fullName: fullName.trim(),
      createdAt: new Date().toISOString()
    });

    setLogin("");
    setFullName("");
    setPassword("");
    setRole("operator");
  };

  return (
    <form className="rounded-[18px] border border-border bg-card p-4" onSubmit={handleSubmit}>
      <h2 className="text-[15px] font-semibold text-foreground">Новый пользователь</h2>

      <div className="mt-4 space-y-3">
        <Input
          value={login}
          onChange={(event) => setLogin(event.target.value)}
          placeholder="Логин"
          required
        />
        <Input
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          placeholder="Отображаемое имя"
          required
        />
        <Input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Пароль"
          type="password"
          required
        />
        <RoleSelect
          className="[&_select]:h-11 [&_select]:rounded-[18px] [&_select]:text-[14px]"
          value={role}
          aria-label="Роль нового пользователя"
          onChange={setRole}
        />
      </div>

      <div className="mt-4 flex items-center gap-6">
        <Button className="h-11 rounded-[16px] px-5" type="submit">
          <Plus className="h-4 w-4" />
          Создать
        </Button>
        <button className="text-[14px] font-medium text-foreground transition hover:text-primary" type="button" onClick={onCancel}>
          Отмена
        </button>
      </div>
    </form>
  );
}
