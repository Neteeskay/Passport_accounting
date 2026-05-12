"use client";

import { X } from "lucide-react";
import { useMemo } from "react";
import { CitizenForm } from "@/components/citizens/form/citizen-form";
import { ModalOverlay } from "@/components/ui/modal-overlay";
import { mapCitizenToFormValues } from "@/lib/utils/citizen-form";
import type { CitizenFormValues } from "@/lib/validation/citizen";
import type { Citizen } from "@/types/citizen";

type CitizenFormModalProps = {
  citizen?: Citizen | null;
  mode?: "create" | "edit";
  open: boolean;
  onClose: () => void;
  onCreate: (values: CitizenFormValues) => void;
  onUpdate?: (values: CitizenFormValues) => void;
};

export function CitizenFormModal({
  citizen,
  mode = "create",
  open,
  onClose,
  onCreate,
  onUpdate
}: CitizenFormModalProps) {
  const defaultValues = useMemo(() => (citizen ? mapCitizenToFormValues(citizen) : undefined), [citizen]);

  if (!open) {
    return null;
  }

  const isEdit = mode === "edit";

  return (
    <ModalOverlay className="items-start justify-center px-4 py-10" contentClassName="w-full max-w-[980px]">
      <div className="w-full rounded-[22px] bg-card shadow-[0_30px_80px_rgba(0,0,0,0.18)]">
        <div className="flex items-center justify-between px-7 pb-4 pt-6">
          <h2 className="text-[18px] font-semibold text-foreground">
            {isEdit ? "Редактирование записи" : "Новая запись гражданина"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
            aria-label="Закрыть"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <CitizenForm
          defaultValues={defaultValues}
          onCancel={onClose}
          onSubmitSuccess={isEdit && onUpdate ? onUpdate : onCreate}
          submitLabel={isEdit ? "Сохранить" : "Добавить"}
        />
      </div>
    </ModalOverlay>
  );
}
