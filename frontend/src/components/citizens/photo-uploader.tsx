"use client";

import { ImagePlus, X } from "lucide-react";
import { useId, useState } from "react";

type PhotoUploaderProps = {
  value?: string;
  onChange: (value: string) => void;
};

const allowedTypes = ["image/jpeg", "image/png"];

export function PhotoUploader({ value, onChange }: PhotoUploaderProps) {
  const inputId = useId();
  const [error, setError] = useState("");

  const handleFileChange = (file?: File) => {
    setError("");

    if (!file) {
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      setError("Можно загрузить только JPG или PNG");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      onChange(typeof reader.result === "string" ? reader.result : "");
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      <label
        className="group flex h-[140px] w-[112px] cursor-pointer items-center justify-center overflow-hidden rounded-[22px] border border-border bg-background transition hover:border-primary/45 hover:ring-2 hover:ring-primary/15"
        htmlFor={inputId}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img alt="Фото гражданина" className="h-full w-full object-cover" src={value} />
        ) : (
          <span className="flex flex-col items-center gap-2 text-muted-foreground transition group-hover:text-primary">
            <ImagePlus className="h-7 w-7" />
            <span className="text-[12px] font-medium">Фото 3x4</span>
          </span>
        )}
      </label>

      <input
        id={inputId}
        className="sr-only"
        type="file"
        accept="image/jpeg,image/png,.jpg,.jpeg,.png"
        onChange={(event) => handleFileChange(event.target.files?.[0])}
      />

      <div className="flex w-[112px] flex-col items-center gap-1">
        <label className="cursor-pointer text-center text-[12px] font-medium text-primary hover:text-primary/80" htmlFor={inputId}>
          {value ? "Заменить фото" : "Загрузить фото"}
        </label>
        {value ? (
          <button
            className="inline-flex items-center gap-1 text-[12px] text-muted-foreground transition hover:text-destructive"
            type="button"
            onClick={() => onChange("")}
          >
            <X className="h-3 w-3" />
            Удалить
          </button>
        ) : (
          <span className="text-center text-[11px] leading-4 text-muted-foreground">JPG, PNG</span>
        )}
        {error ? <span className="text-center text-[11px] leading-4 text-destructive">{error}</span> : null}
      </div>
    </div>
  );
}
