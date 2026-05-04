import { LogOut, Plus, Settings, Shield } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";

type AppShellProps = {
  children: React.ReactNode;
  onAddCitizen?: () => void;
  onLogout?: () => void;
  showAdminLink?: boolean;
  userName?: string;
  userRole?: string;
};

export function AppShell({
  children,
  onAddCitizen,
  onLogout,
  showAdminLink = false,
  userName = "Администратор",
  userRole = "Администратор"
}: AppShellProps) {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-card">
        <div className="mx-auto flex h-[70px] max-w-[1280px] items-center justify-between px-12">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[16px] bg-primary text-primary-foreground">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[20px] font-bold leading-5">Паспортный учёт</p>
              <p className="mt-1 text-[13px] leading-4 text-foreground">{userName} • {userRole}</p>
            </div>
          </div>

          <nav className="flex items-center gap-4" aria-label="Основная навигация">
            <ThemeToggle />
            {showAdminLink ? (
              <Link
                className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted"
                href="/admin/users"
                aria-label="Управление пользователями"
                title="Управление пользователями"
              >
                <Settings className="h-4 w-4" />
              </Link>
            ) : null}
            <button
              className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted"
              type="button"
              aria-label="Выйти"
              title="Выйти"
              onClick={onLogout}
            >
              <LogOut className="h-4 w-4" />
            </button>
            <Button className="h-10 rounded-[16px] px-5 text-[14px]" onClick={onAddCitizen}>
              <Plus className="h-4 w-4" />
              Добавить
            </Button>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-[1280px] px-12 py-6">{children}</div>
    </div>
  );
}
