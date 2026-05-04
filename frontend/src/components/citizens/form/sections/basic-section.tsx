import { useEffect, useState } from "react";
import type { FieldErrors, UseFormRegister, UseFormSetValue } from "react-hook-form";
import { FormField } from "@/components/citizens/form/form-field";
import { FormSection } from "@/components/citizens/form/form-section";
import { Input } from "@/components/ui/input";
import type { CitizenFormValues } from "@/lib/validation/citizen";

type BasicSectionProps = {
  register: UseFormRegister<CitizenFormValues>;
  errors: FieldErrors<CitizenFormValues>;
  setValue: UseFormSetValue<CitizenFormValues>;
};

export function BasicSection({ register, errors, setValue }: BasicSectionProps) {
  const [photoPreview, setPhotoPreview] = useState("");

  useEffect(() => {
    return () => {
      if (photoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  return (
    <FormSection title="Основная информация">
      <div className="grid grid-cols-[112px_1fr] gap-6">
        <div className="space-y-2">
          <div className="flex h-[140px] w-[112px] items-center justify-center overflow-hidden rounded-[22px] border border-border bg-background">
            {photoPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img alt="Фото гражданина" className="h-full w-full object-cover" src={photoPreview} />
            ) : (
              <div className="relative flex h-[94px] w-[72px] items-center justify-center rounded-[18px] bg-[linear-gradient(180deg,#fff3ee_0%,#f2f4f8_100%)]">
                <div className="absolute top-[12px] h-7 w-7 rounded-full border-2 border-foreground/90" />
                <div className="absolute bottom-[12px] h-9 w-12 rounded-t-[999px] border-2 border-foreground/70 border-b-0" />
              </div>
            )}
          </div>
          <label className="block text-center text-[13px] text-muted-foreground">
            Фото 3x4
            <input
              className="sr-only"
              type="file"
              accept="image/png,image/jpeg"
              onChange={(event) => {
                const file = event.target.files?.[0];

                if (!file) {
                  return;
                }

                const url = URL.createObjectURL(file);
                setPhotoPreview((previous) => {
                  if (previous.startsWith("blob:")) {
                    URL.revokeObjectURL(previous);
                  }

                  return url;
                });
                setValue("photoUrl", url, { shouldDirty: true });
              }}
            />
          </label>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <FormField label="Фамилия" error={errors.lastName?.message}>
              <Input placeholder="Иванов" {...register("lastName")} />
            </FormField>
            <FormField label="Имя" error={errors.firstName?.message}>
              <Input placeholder="Иван" {...register("firstName")} />
            </FormField>
            <FormField label="Отчество" error={errors.middleName?.message}>
              <Input placeholder="Иванович" {...register("middleName")} />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Дата рождения" error={errors.birthDate?.message}>
              <Input placeholder="13.03.1990" {...register("birthDate")} />
            </FormField>
            <FormField label="Пол" error={errors.gender?.message}>
              <select
                className="h-11 w-full rounded-[18px] border border-border bg-background px-4 text-[14px] outline-none focus:border-primary/45 focus:ring-2 focus:ring-primary/15"
                {...register("gender")}
              >
                <option value="male">Мужской</option>
                <option value="female">Женский</option>
              </select>
            </FormField>
          </div>

          <FormField label="Место рождения" error={errors.birthPlace?.message}>
            <Input placeholder="г. Донецк" {...register("birthPlace")} />
          </FormField>
        </div>
      </div>

      <FormSection title="Паспортные данные">
        <div className="grid grid-cols-3 gap-4">
          <FormField label="Серия" error={errors.passportSeries?.message}>
            <Input placeholder="2232" {...register("passportSeries")} />
          </FormField>
          <FormField label="Номер" error={errors.passportNumber?.message}>
            <Input placeholder="323232" {...register("passportNumber")} />
          </FormField>
          <FormField label="Код подразделения" error={errors.departmentCode?.message}>
            <Input placeholder="323-232" {...register("departmentCode")} />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Дата выдачи" error={errors.passportIssuedDate?.message}>
            <Input placeholder="18.03.2015" {...register("passportIssuedDate")} />
          </FormField>
          <FormField label="Кем выдан" error={errors.passportIssuedBy?.message}>
            <Input placeholder="ГУ МВД России по Ростовской области" {...register("passportIssuedBy")} />
          </FormField>
        </div>

      </FormSection>
    </FormSection>
  );
}
