import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  rightSlot?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, rightSlot, ...props }, ref) => {
    return (
      <div className="relative">
        {icon ? (
          <span className="pointer-events-none absolute left-4 top-1/2 flex -translate-y-1/2 text-muted-foreground">
            {icon}
          </span>
        ) : null}
        <input
          ref={ref}
          className={cn(
            "flex h-11 w-full rounded-[18px] border border-border bg-background px-4 text-[14px] text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary/45 focus:ring-2 focus:ring-primary/15",
            icon && "pl-11",
            rightSlot && "pr-11",
            className
          )}
          {...props}
        />
        {rightSlot ? (
          <span className="absolute right-3 top-1/2 flex -translate-y-1/2">{rightSlot}</span>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
