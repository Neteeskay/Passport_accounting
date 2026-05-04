import { Trash2 } from "lucide-react";
import { useFieldArray, useWatch, type Control, type FieldErrors, type UseFormRegister } from "react-hook-form";
import { ArraySectionToolbar } from "@/components/citizens/form/array-section-toolbar";
import { FormField } from "@/components/citizens/form/form-field";
import { Input } from "@/components/ui/input";
import type { CitizenFormValues } from "@/lib/validation/citizen";

type MilitarySectionProps = {
  control: Control<CitizenFormValues>;
  register: UseFormRegister<CitizenFormValues>;
  errors: FieldErrors<CitizenFormValues>;
};

export function MilitarySection({ control, register, errors }: MilitarySectionProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "militaryRecords"
  });
  const militaryValues = useWatch({
    control,
    name: "militaryRecords"
  });

  return (
    <section className="space-y-5">
      <ArraySectionToolbar
        title="Воинская обязанность"
        actionLabel="Добавить"
        onAdd={() =>
          append({
            id: `military-${Math.random().toString(36).slice(2, 10)}`,
            status: "liable",
            authority: "",
            signedBy: "",
            date: ""
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
              <span className="inline-flex rounded-full bg-primary px-4 py-1.5 text-[13px] font-medium text-primary-foreground">
                {militaryValues?.[index]?.status === "exempt"
                  ? "Освобожден(а) от исполнения"
                  : "Обязан(а) исполнять воинскую обязанность"}
              </span>
              <button
                type="button"
                onClick={() => remove(index)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
                aria-label="Удалить воинскую запись"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField label="Статус">
                <select
                  className="h-11 w-full rounded-[18px] border border-border bg-card px-4 text-[14px] outline-none focus:border-primary/45 focus:ring-2 focus:ring-primary/15"
                  {...register(`militaryRecords.${index}.status`)}
                >
                  <option value="liable">Обязан(а) исполнять воинскую обязанность</option>
                  <option value="exempt">Освобожден(а) от исполнения</option>
                </select>
              </FormField>
              <FormField label="Орган" error={errors.militaryRecords?.[index]?.authority?.message}>
                <Input placeholder="Военный комиссариат г. Донецка" {...register(`militaryRecords.${index}.authority`)} />
              </FormField>
              <FormField label="Дата" error={errors.militaryRecords?.[index]?.date?.message}>
                <Input placeholder="11.02.2022" {...register(`militaryRecords.${index}.date`)} />
              </FormField>
            </div>

            <div className="mt-4">
              <FormField label="Подпись / заверил" error={errors.militaryRecords?.[index]?.signedBy?.message}>
                <Input placeholder="Подпись, ФИО, должность" {...register(`militaryRecords.${index}.signedBy`)} />
              </FormField>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
