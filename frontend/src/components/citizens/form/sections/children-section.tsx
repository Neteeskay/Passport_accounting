import { Trash2 } from "lucide-react";
import { useFieldArray, useWatch, type Control, type FieldErrors, type UseFormRegister } from "react-hook-form";
import { ArraySectionToolbar } from "@/components/citizens/form/array-section-toolbar";
import { FormField } from "@/components/citizens/form/form-field";
import { Input } from "@/components/ui/input";
import type { CitizenFormValues } from "@/lib/validation/citizen";

type ChildrenSectionProps = {
  control: Control<CitizenFormValues>;
  register: UseFormRegister<CitizenFormValues>;
  errors: FieldErrors<CitizenFormValues>;
};

export function ChildrenSection({ control, register, errors }: ChildrenSectionProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "children"
  });
  const childrenValues = useWatch({
    control,
    name: "children"
  });

  return (
    <section>
      <ArraySectionToolbar
        title="Дети"
        actionLabel="Добавить"
        onAdd={() =>
          append({
            id: `child-${Math.random().toString(36).slice(2, 10)}`,
            lastName: "",
            firstName: "",
            middleName: "",
            gender: "male",
            birthDate: "",
            personalMark: ""
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
              <span className="inline-flex h-10 min-w-10 items-center justify-center rounded-full border border-border px-4 text-[15px]">
                {childrenValues?.[index]?.gender === "female" ? "Ж" : "М"}
              </span>
              <button
                type="button"
                onClick={() => remove(index)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
                aria-label="Удалить запись о ребёнке"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField label="Фамилия" error={errors.children?.[index]?.lastName?.message}>
                <Input placeholder="Иванов" {...register(`children.${index}.lastName`)} />
              </FormField>
              <FormField label="Имя" error={errors.children?.[index]?.firstName?.message}>
                <Input placeholder="Мария" {...register(`children.${index}.firstName`)} />
              </FormField>
              <FormField label="Отчество" error={errors.children?.[index]?.middleName?.message}>
                <Input placeholder="Ивановна" {...register(`children.${index}.middleName`)} />
              </FormField>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-4">
              <FormField label="Пол" error={errors.children?.[index]?.gender?.message}>
                <select
                  className="h-11 w-full rounded-[18px] border border-border bg-card px-4 text-[14px] outline-none focus:border-primary/45 focus:ring-2 focus:ring-primary/15"
                  {...register(`children.${index}.gender`)}
                >
                  <option value="male">Мужской</option>
                  <option value="female">Женский</option>
                </select>
              </FormField>
              <FormField label="Дата рождения" error={errors.children?.[index]?.birthDate?.message}>
                <Input placeholder="дд.мм.гггг" {...register(`children.${index}.birthDate`)} />
              </FormField>
              <FormField label="Личный код" error={errors.children?.[index]?.personalMark?.message}>
                <Input placeholder="Подпись/штамп" {...register(`children.${index}.personalMark`)} />
              </FormField>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
