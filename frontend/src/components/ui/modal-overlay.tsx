import { cn } from "@/lib/utils/cn";

type ModalOverlayProps = {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
};

export function ModalOverlay({ children, className, contentClassName }: ModalOverlayProps) {
  return (
    <div className={cn("fixed inset-0 z-50 flex", className)}>
      <div className="absolute inset-0 bg-black/65 backdrop-brightness-50" aria-hidden="true" />
      <div className={cn("relative z-10", contentClassName)}>{children}</div>
    </div>
  );
}
