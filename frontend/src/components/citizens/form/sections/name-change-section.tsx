import { Trash2 } from "lucide-react";
import { useFieldArray, type Control, type FieldErrors, type UseFormRegister } from "react-hook-form";
import { ArraySectionToolbar } from "@/components/citizens/form/array-section-toolbar";
import { FormField } from "@/components/citizens/form/form-field";
import { Input } from "@/components/ui/input";
import type { CitizenFormValues } from "@/lib/validation/citizen";

type NameChangeSectionProps = {
  control: Control<CitizenFormValues>;
  register: UseFormRegister<CitizenFormValues>;
  errors: FieldErrors<CitizenFormValues>;
};

export function NameChangeSection({ control, register, errors }: NameChangeSectionProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "nameChanges"
  });

  return (
    <section>
      <ArraySectionToolbar
        title="Смена ФИО"
        actionLabel="Добавить"
        onAdd={() =>
          append({
            id: `name-change-${Math.random().toString(36).slice(2, 10)}`,
            reason: "",
            documentNumber: "",
            previousLastName: "",
            previousFirstName: "",
            previousMiddleName: "",
            newLastName: "",
            newFirstName: "",
            newMiddleName: "",
            date: "",
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
                Смена ФИО
              </span>
              <button
                type="button"
                onClick={() => remove(index)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
                aria-label="Удалить запись о смене ФИО"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Дата" error={errors.nameChanges?.[index]?.date?.message}>
                <Input placeholder="дд.мм.гггг" {...register(`nameChanges.${index}.date`)} />
              </FormField>
              <FormField label="Причина" error={errors.nameChanges?.[index]?.reason?.message}>
                <Input placeholder="Вступление в брак" {...register(`nameChanges.${index}.reason`)} />
              </FormField>
            </div>

            <div className="mt-5">
              <p className="mb-3 text-[15px] text-foreground">Прежние данные</p>
              <div className="grid grid-cols-3 gap-4">
                <FormField label="Фамилия" error={errors.nameChanges?.[index]?.previousLastName?.message}>
                  <Input {...register(`nameChanges.${index}.previousLastName`)} />
                </FormField>
                <FormField label="Имя" error={errors.nameChanges?.[index]?.previousFirstName?.message}>
                  <Input {...register(`nameChanges.${index}.previousFirstName`)} />
                </FormField>
                <FormField label="Отчество" error={errors.nameChanges?.[index]?.previousMiddleName?.message}>
                  <Input {...register(`nameChanges.${index}.previousMiddleName`)} />
                </FormField>
              </div>
            </div>

            <div className="mt-5">
              <p className="mb-3 text-[15px] text-foreground">Новые данные</p>
              <div className="grid grid-cols-3 gap-4">
                <FormField label="Фамилия" error={errors.nameChanges?.[index]?.newLastName?.message}>
                  <Input {...register(`nameChanges.${index}.newLastName`)} />
                </FormField>
                <FormField label="Имя" error={errors.nameChanges?.[index]?.newFirstName?.message}>
                  <Input {...register(`nameChanges.${index}.newFirstName`)} />
                </FormField>
                <FormField label="Отчество" error={errors.nameChanges?.[index]?.newMiddleName?.message}>
                  <Input {...register(`nameChanges.${index}.newMiddleName`)} />
                </FormField>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <FormField label="Орган" error={errors.nameChanges?.[index]?.authority?.message}>
                <Input placeholder="Отдел ЗАГС..." {...register(`nameChanges.${index}.authority`)} />
              </FormField>
              <FormField label="Номер документа" error={errors.nameChanges?.[index]?.documentNumber?.message}>
                <Input {...register(`nameChanges.${index}.documentNumber`)} />
              </FormField>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
