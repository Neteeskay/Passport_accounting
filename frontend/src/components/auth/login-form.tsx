"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, Lock, LogIn, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mockUsers } from "@/lib/mock-data/users";
import { loginSchema, type LoginFormValues } from "@/lib/validation/auth";
import { useAuthStore } from "@/store/auth-store";

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");
  const login = useAuthStore((state) => state.login);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      login: "admin",
      password: "admin"
    }
  });

  const onSubmit = (values: LoginFormValues) => {
    const user = mockUsers.find(
      (item) => item.login === values.login && item.password === values.password
    );

    if (!user) {
      setAuthError("Неверный логин или пароль");
      return;
    }

    setAuthError("");
    login(user);
    router.push("/citizens");
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mt-9 w-full max-w-[430px] rounded-[8px] border border-border bg-card px-6 pb-7 pt-8 text-left shadow-soft"
    >
      <h2 className="mb-6 text-center text-[19px] font-semibold text-card-foreground">
        Авторизация
      </h2>

      <div className="space-y-4">
        <Input
          icon={<User className="h-4 w-4" />}
          aria-label="Логин"
          autoComplete="username"
          placeholder="Логин"
          {...register("login")}
        />
        {errors.login ? (
          <p className="-mt-2 text-xs text-destructive">{errors.login.message}</p>
        ) : null}

        <Input
          icon={<Lock className="h-4 w-4" />}
          rightSlot={
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="inline-flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
              title={showPassword ? "Скрыть пароль" : "Показать пароль"}
            >
              <Eye className="h-4 w-4" />
            </button>
          }
          aria-label="Пароль"
          autoComplete="current-password"
          placeholder="Пароль"
          type={showPassword ? "text" : "password"}
          {...register("password")}
        />
        {errors.password ? (
          <p className="-mt-2 text-xs text-destructive">{errors.password.message}</p>
        ) : null}
      </div>

      {authError ? (
        <p className="mt-4 rounded-md bg-destructive/10 px-3 py-2 text-center text-sm text-destructive">
          {authError}
        </p>
      ) : null}

      <Button type="submit" className="mt-5 h-12 w-full text-[15px]" disabled={isSubmitting}>
        <LogIn className="h-4 w-4" />
        Войти
      </Button>
    </form>
  );
}
