"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { startTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { BasicSection } from "@/components/citizens/form/sections/basic-section";
import { ChildrenSection } from "@/components/citizens/form/sections/children-section";
import { ForeignPassportSection } from "@/components/citizens/form/sections/foreign-passport-section";
import { HistorySection } from "@/components/citizens/form/sections/history-section";
import { MarriageSection } from "@/components/citizens/form/sections/marriage-section";
import { MilitarySection } from "@/components/citizens/form/sections/military-section";
import { NameChangeSection } from "@/components/citizens/form/sections/name-change-section";
import { RegistrationSection } from "@/components/citizens/form/sections/registration-section";
import { CitizenFormTabs, type CitizenFormTab } from "@/components/citizens/form/citizen-form-tabs";
import { Button } from "@/components/ui/button";
import {
  citizenFormDefaultValues,
  citizenFormSchema,
  type CitizenFormValues
} from "@/lib/validation/citizen";

type CitizenFormProps = {
  onCancel: () => void;
  onSubmitSuccess: (values: CitizenFormValues) => void;
};

export function CitizenForm({ onCancel, onSubmitSuccess }: CitizenFormProps) {
  const [activeTab, setActiveTab] = useState<CitizenFormTab>("basic");
  const {
    register,
    control,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<CitizenFormValues>({
    resolver: zodResolver(citizenFormSchema),
    defaultValues: citizenFormDefaultValues
  });

  const onSubmit = (values: CitizenFormValues) => {
    startTransition(() => {
      onSubmitSuccess(values);
      reset(citizenFormDefaultValues);
      setActiveTab("basic");
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="px-7 pb-7">
      <CitizenFormTabs activeTab={activeTab} onChange={setActiveTab} />

      <div className="mt-5 max-h-[68vh] overflow-y-auto pr-2">
        {activeTab === "basic" ? (
          <BasicSection errors={errors} register={register} setValue={setValue} />
        ) : null}
        {activeTab === "registration" ? (
          <RegistrationSection control={control} errors={errors} register={register} />
        ) : null}
        {activeTab === "children" ? (
          <ChildrenSection control={control} errors={errors} register={register} />
        ) : null}
        {activeTab === "marriage" ? (
          <MarriageSection control={control} errors={errors} register={register} />
        ) : null}
        {activeTab === "military" ? (
          <MilitarySection control={control} errors={errors} register={register} />
        ) : null}
        {activeTab === "foreign-passport" ? (
          <ForeignPassportSection control={control} errors={errors} register={register} />
        ) : null}
        {activeTab === "name-change" ? (
          <NameChangeSection control={control} errors={errors} register={register} />
        ) : null}
        {activeTab === "history" ? (
          <HistorySection control={control} errors={errors} register={register} />
        ) : null}
      </div>

      <div className="mt-6 flex items-center justify-end gap-3 border-t border-border pt-5">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Отмена
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          Добавить
        </Button>
      </div>
    </form>
  );
}
