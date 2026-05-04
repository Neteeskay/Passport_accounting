import { cn } from "@/lib/utils/cn";

type FormFieldProps = {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
};

export function FormField({ label, error, className, children }: FormFieldProps) {
  return (
    <label className={cn("block space-y-2", className)}>
      <span className="text-[14px] text-foreground">{label}</span>
      {children}
      {error ? <span className="block text-xs text-destructive">{error}</span> : null}
    </label>
  );
}
