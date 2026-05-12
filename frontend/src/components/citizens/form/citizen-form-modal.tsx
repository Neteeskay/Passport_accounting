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
  onCreate: (values: CitizenFormValues) => void | Promise<void>;
  onPhotoUpload?: (file: File) => Promise<string>;
  onUpdate?: (values: CitizenFormValues) => void | Promise<void>;
};

export function CitizenFormModal({
  citizen,
  mode = "create",
  open,
  onClose,
  onCreate,
  onPhotoUpload,
  onUpdate
}: CitizenFormModalProps) {
  const defaultValues = useMemo(() => (citizen ? mapCitizenToFormValues(citizen) : undefined), [citizen]);

  if (!open) {
    return null;
  }

  const isEdit = mode === "edit";

  return (
    <ModalOverlay className="items-start justify-center overflow-y-auto px-4 py-6" contentClassName="w-full max-w-[980px]">
      <div className="flex max-h-[calc(100vh-48px)] w-full flex-col rounded-[22px] bg-card shadow-[0_30px_80px_rgba(0,0,0,0.18)]">
        <div className="shrink-0 flex items-center justify-between px-7 pb-4 pt-6">
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

        <div className="min-h-0 flex-1">
          <CitizenForm
            defaultValues={defaultValues}
            onCancel={onClose}
            onPhotoUpload={onPhotoUpload}
            onSubmitSuccess={isEdit && onUpdate ? onUpdate : onCreate}
            submitLabel={isEdit ? "Сохранить" : "Добавить"}
          />
        </div>
      </div>
    </ModalOverlay>
  );
}
