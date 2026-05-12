import { cn } from "@/lib/utils/cn";

type FilterFieldProps = {
  children: React.ReactNode;
  className?: string;
  error?: string;
  label: string;
};

export function FilterField({ children, className, error, label }: FilterFieldProps) {
  return (
    <label className={cn("block min-w-0 space-y-1.5", className)}>
      <span className="block text-[12px] font-medium text-muted-foreground">{label}</span>
      {children}
      {error ? <span className="block text-[11px] leading-4 text-destructive">{error}</span> : null}
    </label>
  );
}
