"use client";

import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CitizenPassportPreview } from "@/components/citizens/detail/citizen-passport-preview";
import { ModalOverlay } from "@/components/ui/modal-overlay";
import type { Citizen } from "@/types/citizen";

type CitizenDetailModalProps = {
  citizen: Citizen | null;
  open: boolean;
  onClose: () => void;
};

export function CitizenDetailModal({ citizen, open, onClose }: CitizenDetailModalProps) {
  if (!open || !citizen) {
    return null;
  }

  const handleDownload = () => {
    window.print();
  };

  return (
    <ModalOverlay className="items-start justify-center px-4 py-10" contentClassName="w-full max-w-[1040px]">
      <div className="flex h-[86vh] w-full flex-col rounded-[22px] bg-card shadow-[0_30px_80px_rgba(0,0,0,0.22)]">
        <div className="flex items-center justify-between px-7 pb-4 pt-6">
          <h2 className="text-[20px] font-semibold text-card-foreground">Карточка гражданина</h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
            aria-label="Закрыть"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mx-7 min-h-0 flex-1 overflow-hidden rounded-[18px] border border-border bg-background">
          <div className="h-full overflow-y-auto px-8 py-6">
            <CitizenPassportPreview citizen={citizen} />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end gap-3 border-t border-border px-7 py-5">
          <Button type="button" variant="secondary" className="h-11 rounded-[18px] px-5" onClick={onClose}>
            <X className="h-4 w-4" />
            Закрыть
          </Button>
          <Button type="button" className="h-11 rounded-[18px] px-5" onClick={handleDownload}>
            <Download className="h-4 w-4" />
            Скачать PDF
          </Button>
        </div>
      </div>
    </ModalOverlay>
  );
}
