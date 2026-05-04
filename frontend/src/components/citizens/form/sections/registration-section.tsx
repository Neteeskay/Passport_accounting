import { Trash2 } from "lucide-react";
import { useFieldArray, useWatch, type Control, type FieldErrors, type UseFormRegister } from "react-hook-form";
import { ArraySectionToolbar } from "@/components/citizens/form/array-section-toolbar";
import { FormField } from "@/components/citizens/form/form-field";
import { Input } from "@/components/ui/input";
import type { CitizenFormValues } from "@/lib/validation/citizen";

type RegistrationSectionProps = {
  control: Control<CitizenFormValues>;
  register: UseFormRegister<CitizenFormValues>;
  errors: FieldErrors<CitizenFormValues>;
};

export function RegistrationSection({ control, register, errors }: RegistrationSectionProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "registrationStamps"
  });
  const stampValues = useWatch({
    control,
    name: "registrationStamps"
  });

  return (
    <section className="space-y-5">
      <ArraySectionToolbar
        title="Штампы регистрации"
        actionLabel="Добавить"
        onAdd={() =>
          append({
            id: `registration-${Math.random().toString(36).slice(2, 10)}`,
            type: "deregistration",
            date: "",
            region: "",
            district: "",
            locality: "",
            settlement: "",
            street: "",
            house: "",
            apartment: "",
            authority: "",
            departmentCode: "",
            certifier: ""
          })
        }
      />
      <div className="space-y-5">
        {fields.length === 0 ? (
          <div className="rounded-[22px] border border-dashed border-border bg-background px-5 py-8 text-[14px] text-muted-foreground">
            Записи ещё не добавлены.
          </div>
        ) : null}
        {fields.map((field, index) => (
          <div key={field.id} className="rounded-[22px] border border-border bg-background p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="inline-flex items-center gap-2">
                <span className="inline-flex rounded-full bg-primary px-4 py-1.5 text-[13px] font-medium text-primary-foreground">
                  {stampValues?.[index]?.type === "deregistration" ? "Снят с учёта" : "Регистрация"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => remove(index)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
                aria-label="Удалить штамп регистрации"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Тип штампа">
                <select
                  className="h-11 w-full rounded-[18px] border border-border bg-card px-4 text-[14px] outline-none focus:border-primary/45 focus:ring-2 focus:ring-primary/15"
                  {...register(`registrationStamps.${index}.type`)}
                >
                  <option value="registration">Зарегистрирован</option>
                  <option value="deregistration">Снят с регистрационного учёта</option>
                </select>
              </FormField>
              <FormField label="Дата" error={errors.registrationStamps?.[index]?.date?.message}>
                <Input placeholder="28.03.2026" {...register(`registrationStamps.${index}.date`)} />
              </FormField>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-4">
              <FormField label="Регион" error={errors.registrationStamps?.[index]?.region?.message}>
                <Input placeholder="Ростовская область" {...register(`registrationStamps.${index}.region`)} />
              </FormField>
              <FormField label="Район">
                <Input placeholder="Октябрьский район" {...register(`registrationStamps.${index}.district`)} />
              </FormField>
              <FormField label="Населённый пункт" error={errors.registrationStamps?.[index]?.locality?.message}>
                <Input placeholder="г. Донецк" {...register(`registrationStamps.${index}.locality`)} />
              </FormField>
            </div>

            <div className="mt-4 grid grid-cols-4 gap-4">
              <FormField label="Посёлок / р.п.">
                <Input placeholder="р.п. Шолоховский" {...register(`registrationStamps.${index}.settlement`)} />
              </FormField>
              <FormField label="Улица" error={errors.registrationStamps?.[index]?.street?.message}>
                <Input placeholder="ул. Пушкина" {...register(`registrationStamps.${index}.street`)} />
              </FormField>
              <FormField label="Дом" error={errors.registrationStamps?.[index]?.house?.message}>
                <Input placeholder="30" {...register(`registrationStamps.${index}.house`)} />
              </FormField>
              <FormField label="Квартира">
                <Input placeholder="30" {...register(`registrationStamps.${index}.apartment`)} />
              </FormField>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-4">
              <FormField label="Подразделение по вопросам миграции" error={errors.registrationStamps?.[index]?.authority?.message}>
                <Input
                  placeholder="Отдел по вопросам миграции МВД России"
                  {...register(`registrationStamps.${index}.authority`)}
                />
              </FormField>
              <FormField label="Код подразделения" error={errors.registrationStamps?.[index]?.departmentCode?.message}>
                <Input placeholder="460-026" {...register(`registrationStamps.${index}.departmentCode`)} />
              </FormField>
              <FormField label="Заверил" error={errors.registrationStamps?.[index]?.certifier?.message}>
                <Input placeholder="Подпись / должность" {...register(`registrationStamps.${index}.certifier`)} />
              </FormField>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
