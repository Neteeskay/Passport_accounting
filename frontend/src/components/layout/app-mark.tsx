import { Shield } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type AppMarkProps = {
  className?: string;
};

export function AppMark({ className }: AppMarkProps) {
  return (
    <div
      className={cn(
        "flex h-[96px] w-[96px] items-center justify-center rounded-[17px] border-2 border-primary/20 bg-primary/5 text-primary shadow-[0_0_0_1px_rgb(79_70_229_/_0.06)]",
        className
      )}
      aria-hidden="true"
    >
      <Shield className="h-12 w-12 stroke-[2.4]" />
    </div>
  );
}
