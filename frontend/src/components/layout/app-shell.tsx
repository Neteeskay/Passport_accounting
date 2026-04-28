import { LogOut, Moon, Plus, Settings, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
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
              <p className="mt-1 text-[13px] leading-4 text-foreground">
                Администратор • Администратор
              </p>
            </div>
          </div>

          <nav className="flex items-center gap-4" aria-label="Основная навигация">
            <button
              className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted"
              type="button"
              aria-label="Режим отображения"
              title="Режим отображения"
            >
              <Moon className="h-4 w-4" />
            </button>
            <button
              className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted"
              type="button"
              aria-label="Настройки"
              title="Настройки"
            >
              <Settings className="h-4 w-4" />
            </button>
            <button
              className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted"
              type="button"
              aria-label="Выйти"
              title="Выйти"
            >
              <LogOut className="h-4 w-4" />
            </button>
            <Button className="h-10 rounded-[16px] px-5 text-[14px]">
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
