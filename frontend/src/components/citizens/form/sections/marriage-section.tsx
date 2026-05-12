import { Trash2 } from "lucide-react";
import { useFieldArray, useWatch, type Control, type FieldErrors, type UseFormRegister } from "react-hook-form";
import { ArraySectionToolbar } from "@/components/citizens/form/array-section-toolbar";
import { FormField } from "@/components/citizens/form/form-field";
import { Input } from "@/components/ui/input";
import type { CitizenFormValues } from "@/lib/validation/citizen";

type MarriageSectionProps = {
  control: Control<CitizenFormValues>;
  register: UseFormRegister<CitizenFormValues>;
  errors: FieldErrors<CitizenFormValues>;
};

export function MarriageSection({ control, register, errors }: MarriageSectionProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "marriageRecords"
  });
  const marriageValues = useWatch({
    control,
    name: "marriageRecords"
  });

  return (
    <section>
      <ArraySectionToolbar
        title="Семейное положение"
        actionLabel="Добавить"
        onAdd={() =>
          append({
            id: `marriage-${Math.random().toString(36).slice(2, 10)}`,
            status: "registered",
            date: "",
            spouseLastName: "",
            spouseFirstName: "",
            spouseMiddleName: "",
            spouseBirthDate: "",
            authority: "",
            actRecordNumber: "",
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
            <div className="mb-6 flex items-start justify-between">
              <span className="inline-flex rounded-full bg-primary px-5 py-2 text-[15px] font-medium text-primary-foreground">
                {marriageValues?.[index]?.status === "dissolved" ? "Брак расторгнут" : "Брак зарегистрирован"}
              </span>
              <button
                type="button"
                onClick={() => remove(index)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
                aria-label="Удалить запись о браке"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Тип">
                <select
                  className="h-11 w-full rounded-[18px] border border-border bg-card px-4 text-[14px] outline-none focus:border-primary/45 focus:ring-2 focus:ring-primary/15"
                  {...register(`marriageRecords.${index}.status`)}
                >
                  <option value="registered">Зарегистрирован брак</option>
                  <option value="dissolved">Брак расторгнут</option>
                </select>
              </FormField>
              <FormField label="Дата" error={errors.marriageRecords?.[index]?.date?.message}>
                <Input placeholder="дд.мм.гггг" {...register(`marriageRecords.${index}.date`)} />
              </FormField>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-4">
              <FormField label="Фамилия супруга(и)" error={errors.marriageRecords?.[index]?.spouseLastName?.message}>
                <Input placeholder="Петрова" {...register(`marriageRecords.${index}.spouseLastName`)} />
              </FormField>
              <FormField label="Имя" error={errors.marriageRecords?.[index]?.spouseFirstName?.message}>
                <Input {...register(`marriageRecords.${index}.spouseFirstName`)} />
              </FormField>
              <FormField label="Отчество" error={errors.marriageRecords?.[index]?.spouseMiddleName?.message}>
                <Input {...register(`marriageRecords.${index}.spouseMiddleName`)} />
              </FormField>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              {marriageValues?.[index]?.status !== "dissolved" ? (
                <FormField label="Дата рождения супруга(и)" error={errors.marriageRecords?.[index]?.spouseBirthDate?.message}>
                  <Input placeholder="дд.мм.гггг" {...register(`marriageRecords.${index}.spouseBirthDate`)} />
                </FormField>
              ) : (
                <div />
              )}
              {marriageValues?.[index]?.status !== "dissolved" ? (
                <FormField label="№ записи акта" error={errors.marriageRecords?.[index]?.actRecordNumber?.message}>
                  <Input placeholder="№740 240-019" {...register(`marriageRecords.${index}.actRecordNumber`)} />
                </FormField>
              ) : null}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <FormField label="Наименование органа" error={errors.marriageRecords?.[index]?.authority?.message}>
                <Input
                  placeholder="Отдел ЗАГС Октябрьского района..."
                  {...register(`marriageRecords.${index}.authority`)}
                />
              </FormField>
              {marriageValues?.[index]?.status !== "dissolved" ? (
                <FormField label="Заверил" error={errors.marriageRecords?.[index]?.certifier?.message}>
                  <Input {...register(`marriageRecords.${index}.certifier`)} />
                </FormField>
              ) : <div />}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
