import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

type ArraySectionToolbarProps = {
  title: string;
  actionLabel: string;
  onAdd: () => void;
};

export function ArraySectionToolbar({ title, actionLabel, onAdd }: ArraySectionToolbarProps) {
  return (
    <div className="mb-5 flex items-center justify-between gap-4">
      <h3 className="text-[18px] font-semibold text-foreground">{title}</h3>
      <Button
        type="button"
        variant="secondary"
        onClick={onAdd}
        className="h-12 rounded-[24px] border-2 border-primary/90 bg-card px-6 text-[16px] shadow-none hover:bg-muted"
      >
        <Plus className="h-5 w-5" />
        {actionLabel}
      </Button>
    </div>
  );
}
