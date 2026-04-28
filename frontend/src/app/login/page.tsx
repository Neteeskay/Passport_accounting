import { AppMark } from "@/components/layout/app-mark";
import { PublicShell } from "@/components/layout/public-shell";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <PublicShell>
      <main className="flex min-h-svh flex-col items-center justify-start px-5 pb-16 pt-[19vh] text-center sm:pt-[20vh]">
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
          <LoginForm />
        </section>
      </main>
    </PublicShell>
  );
}
