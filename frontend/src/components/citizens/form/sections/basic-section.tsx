import type { Control, FieldErrors, UseFormRegister, UseFormSetValue } from "react-hook-form";
import { useWatch } from "react-hook-form";
import { FormattedInput } from "@/components/citizens/form/formatted-input";
import { FormField } from "@/components/citizens/form/form-field";
import { FormSection } from "@/components/citizens/form/form-section";
import { PhotoUploader } from "@/components/citizens/photo-uploader";
import { Input } from "@/components/ui/input";
import { digitsOnly, formatDateInput, formatDepartmentCode } from "@/lib/utils/input-format";
import type { CitizenFormValues } from "@/lib/validation/citizen";

type BasicSectionProps = {
  control: Control<CitizenFormValues>;
  register: UseFormRegister<CitizenFormValues>;
  errors: FieldErrors<CitizenFormValues>;
  setValue: UseFormSetValue<CitizenFormValues>;
};

export function BasicSection({ control, register, errors, setValue }: BasicSectionProps) {
  const photoUrl = useWatch({ control, name: "photoUrl" });

  return (
    <FormSection title="Основная информация">
      <div className="grid grid-cols-[112px_1fr] gap-6">
        <PhotoUploader
          value={photoUrl}
          onChange={(value) => setValue("photoUrl", value, { shouldDirty: true, shouldValidate: true })}
        />

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
              <FormattedInput formatter={formatDateInput} inputMode="numeric" placeholder="13.03.1990" registration={register("birthDate")} />
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
            <FormattedInput formatter={(value) => digitsOnly(value, 4)} inputMode="numeric" placeholder="2232" registration={register("passportSeries")} />
          </FormField>
          <FormField label="Номер" error={errors.passportNumber?.message}>
            <FormattedInput formatter={(value) => digitsOnly(value, 6)} inputMode="numeric" placeholder="323232" registration={register("passportNumber")} />
          </FormField>
          <FormField label="Код подразделения" error={errors.departmentCode?.message}>
            <FormattedInput formatter={formatDepartmentCode} inputMode="numeric" placeholder="323-232" registration={register("departmentCode")} />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Дата выдачи" error={errors.passportIssuedDate?.message}>
            <FormattedInput formatter={formatDateInput} inputMode="numeric" placeholder="18.03.2015" registration={register("passportIssuedDate")} />
          </FormField>
          <FormField label="Кем выдан" error={errors.passportIssuedBy?.message}>
            <Input placeholder="ГУ МВД России по Ростовской области" {...register("passportIssuedBy")} />
          </FormField>
        </div>

      </FormSection>
    </FormSection>
  );
}
