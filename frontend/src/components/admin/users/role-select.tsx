"use client";

import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { UserRole } from "@/types/user";

type RoleSelectProps = {
  "aria-label": string;
  className?: string;
  value: UserRole;
  onChange: (role: UserRole) => void;
};

export function RoleSelect({ "aria-label": ariaLabel, className, value, onChange }: RoleSelectProps) {
  return (
    <div className={cn("relative", className)}>
      <select
        className="h-9 w-full appearance-none rounded-full border border-border bg-background py-0 pl-4 pr-10 text-[13px] text-foreground outline-none transition focus:border-primary/45 focus:ring-2 focus:ring-primary/15"
        value={value}
        onChange={(event) => onChange(event.target.value as UserRole)}
        aria-label={ariaLabel}
      >
        <option value="admin">Администратор</option>
        <option value="operator">Оператор</option>
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}
