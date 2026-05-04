import { cn } from "@/lib/utils/cn";

type ModalOverlayProps = {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
};

export function ModalOverlay({ children, className, contentClassName }: ModalOverlayProps) {
  return (
    <div className={cn("fixed inset-0 z-50 flex bg-black/82 backdrop-blur-[1px]", className)}>
      <div className={cn("relative z-10", contentClassName)}>{children}</div>
    </div>
  );
}
