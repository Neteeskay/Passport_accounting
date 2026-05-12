import { Trash2 } from "lucide-react";
import { useFieldArray, useWatch, type Control, type FieldErrors, type UseFormRegister } from "react-hook-form";
import { ArraySectionToolbar } from "@/components/citizens/form/array-section-toolbar";
import { FormField } from "@/components/citizens/form/form-field";
import { Input } from "@/components/ui/input";
import type { CitizenFormValues } from "@/lib/validation/citizen";

const passportHistoryOptions = [
  "Первичный (14 лет)",
  "Замена (20 лет)",
  "Замена (45 лет)",
  "Утерян",
  "Испорчен",
  "Иное"
] as const;

type HistorySectionProps = {
  control: Control<CitizenFormValues>;
  register: UseFormRegister<CitizenFormValues>;
  errors: FieldErrors<CitizenFormValues>;
};

export function HistorySection({ control, register, errors }: HistorySectionProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "historyRecords"
  });
  const historyValues = useWatch({
    control,
    name: "historyRecords"
  });

  return (
    <section className="space-y-7">
      <ArraySectionToolbar
        title="История"
        actionLabel="Добавить"
        onAdd={() =>
          append({
            id: `history-${Math.random().toString(36).slice(2, 10)}`,
            event: "Первичный (14 лет)",
            isCurrent: false,
            series: "",
            number: "",
            departmentCode: "",
            issueDate: "",
            authority: "",
            note: ""
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
              <span className="inline-flex rounded-full bg-primary px-4 py-1.5 text-[13px] font-medium text-primary-foreground">
                {historyValues?.[index]?.event || field.event || "Иное"}
              </span>
              <button
                type="button"
                onClick={() => remove(index)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
                aria-label="Удалить запись истории"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-[minmax(0,1fr)_280px] items-end gap-5">
              <FormField label="Тип" error={errors.historyRecords?.[index]?.event?.message}>
                <select
                  className="h-11 w-full rounded-[18px] border border-border bg-card px-4 text-[14px] outline-none focus:border-primary/45 focus:ring-2 focus:ring-primary/15"
                  {...register(`historyRecords.${index}.event`)}
                >
                  {passportHistoryOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </FormField>

              <div className="space-y-2">
                <span className="text-[14px] text-foreground">Активный</span>
                <label className="inline-flex h-11 w-full items-center gap-3 rounded-[18px] border border-border bg-card px-4 text-[14px] leading-none">
                  <input
                    type="checkbox"
                    className="h-5 w-5 shrink-0 rounded-[6px] border-border"
                    {...register(`historyRecords.${index}.isCurrent`)}
                  />
                  Текущий паспорт
                </label>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-4">
              <FormField label="Серия" error={errors.historyRecords?.[index]?.series?.message}>
                <Input placeholder="4510" {...register(`historyRecords.${index}.series`)} />
              </FormField>
              <FormField label="Номер" error={errors.historyRecords?.[index]?.number?.message}>
                <Input placeholder="123456" {...register(`historyRecords.${index}.number`)} />
              </FormField>
              <FormField label="Код подразделения" error={errors.historyRecords?.[index]?.departmentCode?.message}>
                <Input placeholder="770-001" {...register(`historyRecords.${index}.departmentCode`)} />
              </FormField>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <FormField label="Дата выдачи" error={errors.historyRecords?.[index]?.issueDate?.message}>
                <Input placeholder="дд.мм.гггг" {...register(`historyRecords.${index}.issueDate`)} />
              </FormField>
              <FormField label="Кем выдан" error={errors.historyRecords?.[index]?.authority?.message}>
                <Input placeholder="ОВД района..." {...register(`historyRecords.${index}.authority`)} />
              </FormField>
            </div>

            <div className="mt-4">
              <FormField label="Причина / примечание" error={errors.historyRecords?.[index]?.note?.message}>
                <Input placeholder="Описание причины" {...register(`historyRecords.${index}.note`)} />
              </FormField>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
