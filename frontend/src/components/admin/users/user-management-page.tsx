"use client";

import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { mockUsers } from "@/lib/mock-data/users";
import { useAuthStore } from "@/store/auth-store";
import type { User, UserRole } from "@/types/user";
import { UserCreateForm } from "./user-create-form";
import { UserRow } from "./user-row";

export function UserManagementPage() {
  const currentUser = useAuthStore((state) => state.user);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [isCreating, setIsCreating] = useState(false);

  const isAdmin = currentUser?.role === "admin" || !currentUser;

  const handleRoleChange = (userId: string, role: UserRole) => {
    setUsers((current) => current.map((user) => (user.id === userId ? { ...user, role } : user)));
  };

  const handleDelete = (userId: string) => {
    const user = users.find((item) => item.id === userId);

    if (user && window.confirm(`Удалить пользователя @${user.login}?`)) {
      setUsers((current) => current.filter((item) => item.id !== userId));
    }
  };

  const handleCreate = (user: User) => {
    setUsers((current) => [user, ...current]);
    setIsCreating(false);
  };

  if (!isAdmin) {
    return (
      <main className="min-h-svh bg-background px-8 py-7 text-foreground">
        <div className="flex items-start gap-4">
          <Link className="mt-1 flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted" href="/citizens">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-[20px] font-bold leading-6">Управление пользователями</h1>
            <p className="mt-1 text-[13px] text-muted-foreground">Раздел доступен только администратору</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-svh bg-background px-8 py-7 text-foreground">
      <div className="mx-auto max-w-[1210px]">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <Link className="mt-1 flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted" href="/citizens">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-[20px] font-bold leading-6">Управление пользователями</h1>
              <p className="mt-1 text-[13px] text-foreground">Создание учётных записей и назначение ролей</p>
            </div>
          </div>
          <ThemeToggle />
        </div>

        <section className="mt-10">
          <h2 className="text-[15px] font-semibold text-foreground">Пользователи</h2>

          <div className="mt-4 space-y-3">
            {users.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                onDelete={handleDelete}
                onRoleChange={handleRoleChange}
              />
            ))}
          </div>

          <div className="mt-7">
            {isCreating ? (
              <UserCreateForm onCancel={() => setIsCreating(false)} onCreate={handleCreate} />
            ) : (
              <Button
                className="h-11 rounded-[16px] border border-border bg-card px-5 text-foreground hover:bg-muted"
                type="button"
                variant="ghost"
                onClick={() => setIsCreating(true)}
              >
                <Plus className="h-4 w-4" />
                Добавить пользователя
              </Button>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
