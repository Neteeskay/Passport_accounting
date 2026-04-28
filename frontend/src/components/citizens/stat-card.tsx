import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  icon: LucideIcon;
  label: string;
  value: number | string;
  accent?: boolean;
};

export function StatCard({ icon: Icon, label, value, accent = false }: StatCardProps) {
  return (
    <article className="flex h-[92px] flex-col justify-center rounded-[16px] border border-border bg-card px-5 shadow-soft">
      <div className="flex items-center gap-3">
        <Icon className={accent ? "h-5 w-5 text-primary" : "h-5 w-5 text-foreground"} />
        <span className="text-[13px] text-foreground">{label}</span>
      </div>
      <strong className="mt-2 text-[27px] leading-7">{value}</strong>
    </article>
  );
}
