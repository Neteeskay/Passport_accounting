import Link from "next/link";
import { LogIn } from "lucide-react";
import { AppMark } from "@/components/layout/app-mark";
import { PublicShell } from "@/components/layout/public-shell";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <PublicShell>
      <main className="flex min-h-svh flex-col items-center justify-center px-5 pb-14 pt-10 text-center">
        <section className="mx-auto flex w-full max-w-[620px] flex-col items-center">
          <AppMark className="mb-7" />
          <h1 className="text-[34px] font-bold leading-tight tracking-normal text-foreground sm:text-[42px]">
            Система паспортного учёта
          </h1>
          <p className="mt-4 max-w-[520px] text-[18px] leading-8 text-foreground sm:text-[20px]">
            Единая система регистрации и учёта граждан
            <br />
            Российской Федерации
          </p>
          <Button asChild className="mt-9 h-12 w-full max-w-[360px] text-[15px]">
            <Link href="/login">
              <LogIn className="h-4 w-4" />
              Войти в систему
            </Link>
          </Button>
          <p className="mt-4 text-[13px] text-muted-foreground">
            Для работы необходима учётная запись оператора или администратора
          </p>
        </section>
      </main>
    </PublicShell>
  );
}
