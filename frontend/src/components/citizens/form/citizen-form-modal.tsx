"use client";

import { X } from "lucide-react";
import { CitizenForm } from "@/components/citizens/form/citizen-form";
import type { CitizenFormValues } from "@/lib/validation/citizen";

type CitizenFormModalProps = {
  open: boolean;
  onClose: () => void;
  onCreate: (values: CitizenFormValues) => void;
};

export function CitizenFormModal({ open, onClose, onCreate }: CitizenFormModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/55 px-4 py-10">
      <div className="w-full max-w-[980px] rounded-[22px] bg-card shadow-[0_30px_80px_rgba(0,0,0,0.18)]">
        <div className="flex items-center justify-between px-7 pb-4 pt-6">
          <h2 className="text-[18px] font-semibold text-foreground">Новая запись гражданина</h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
            aria-label="Закрыть"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <CitizenForm onCancel={onClose} onSubmitSuccess={onCreate} />
      </div>
    </div>
  );
}
