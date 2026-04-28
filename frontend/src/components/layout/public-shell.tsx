type PublicShellProps = {
  children: React.ReactNode;
};

export function PublicShell({ children }: PublicShellProps) {
  return (
    <div className="relative min-h-svh overflow-hidden bg-background text-foreground">
      {children}
      <footer className="absolute inset-x-0 bottom-5 text-center text-[13px] text-muted-foreground">
        © 2026 Система паспортного учёта
      </footer>
    </div>
  );
}
