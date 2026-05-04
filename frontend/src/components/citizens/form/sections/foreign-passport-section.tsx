import { Trash2 } from "lucide-react";
import { useFieldArray, type Control, type FieldErrors, type UseFormRegister } from "react-hook-form";
import { ArraySectionToolbar } from "@/components/citizens/form/array-section-toolbar";
import { FormField } from "@/components/citizens/form/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { CitizenFormValues } from "@/lib/validation/citizen";

type ForeignPassportSectionProps = {
  control: Control<CitizenFormValues>;
  register: UseFormRegister<CitizenFormValues>;
  errors: FieldErrors<CitizenFormValues>;
};

export function ForeignPassportSection({
  control,
  register,
  errors
}: ForeignPassportSectionProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "foreignPassports"
  });

  return (
    <section className="space-y-5">
      <ArraySectionToolbar
        title="Сведения о загранпаспорте"
        actionLabel="Добавить"
        onAdd={() =>
          append({
            id: `foreign-${Math.random().toString(36).slice(2, 10)}`,
            issueDate: "",
            series: "",
            number: "",
            authority: "",
            note: ""
          })
        }
      />
      <div className="space-y-5">
        {fields.length === 0 ? (
          <div className="rounded-[18px] border border-dashed border-border bg-background px-4 py-6 text-[14px] text-muted-foreground">
            Записи о загранпаспортах ещё не добавлены.
          </div>
        ) : null}

        {fields.map((field, index) => (
          <div key={field.id} className="rounded-[22px] border border-border bg-background p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="inline-flex rounded-full bg-primary px-4 py-1.5 text-[13px] font-medium text-primary-foreground">
                Загранпаспорт {index + 1}
              </span>
              <button
                type="button"
                onClick={() => remove(index)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
                aria-label="Удалить загранпаспорт"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <FormField label="Дата получения" error={errors.foreignPassports?.[index]?.issueDate?.message}>
                <Input placeholder="18.03.2024" {...register(`foreignPassports.${index}.issueDate`)} />
              </FormField>
              <FormField label="Серия" error={errors.foreignPassports?.[index]?.series?.message}>
                <Input placeholder="72" {...register(`foreignPassports.${index}.series`)} />
              </FormField>
              <FormField label="Номер" error={errors.foreignPassports?.[index]?.number?.message}>
                <Input placeholder="1234567" {...register(`foreignPassports.${index}.number`)} />
              </FormField>
              <FormField label="Орган выдачи" error={errors.foreignPassports?.[index]?.authority?.message}>
                <Input placeholder="МВД России" {...register(`foreignPassports.${index}.authority`)} />
              </FormField>
            </div>

            <div className="mt-4">
              <FormField label="Примечание" error={errors.foreignPassports?.[index]?.note?.message}>
                <Textarea
                  className="min-h-[84px]"
                  placeholder="Дополнительная информация о выдаче загранпаспорта"
                  {...register(`foreignPassports.${index}.note`)}
                />
              </FormField>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
