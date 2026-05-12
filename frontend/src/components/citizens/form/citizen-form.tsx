"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm, type FieldErrors } from "react-hook-form";
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
  defaultValues?: CitizenFormValues;
  onCancel: () => void;
  onPhotoUpload?: (file: File) => Promise<string>;
  onSubmitSuccess: (values: CitizenFormValues) => void | Promise<void>;
  submitLabel?: string;
};

export function CitizenForm({
  defaultValues = citizenFormDefaultValues,
  onCancel,
  onPhotoUpload,
  onSubmitSuccess,
  submitLabel = "Добавить"
}: CitizenFormProps) {
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
    defaultValues
  });

  useEffect(() => {
    reset(defaultValues);
    setActiveTab("basic");
  }, [defaultValues, reset]);

  const onSubmit = async (values: CitizenFormValues) => {
    await onSubmitSuccess(values);
    reset(defaultValues);
    setActiveTab("basic");
  };

  const onInvalidSubmit = (formErrors: FieldErrors<CitizenFormValues>) => {
    if (
      formErrors.photoUrl ||
      formErrors.lastName ||
      formErrors.firstName ||
      formErrors.birthDate ||
      formErrors.birthPlace ||
      formErrors.passportSeries ||
      formErrors.passportNumber ||
      formErrors.passportIssuedBy ||
      formErrors.passportIssuedDate ||
      formErrors.departmentCode
    ) {
      setActiveTab("basic");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalidSubmit)} className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 px-7">
        <CitizenFormTabs activeTab={activeTab} onChange={setActiveTab} />
      </div>

      <div className="mt-5 min-h-0 flex-1 overflow-y-auto px-7 pr-9">
        {activeTab === "basic" ? (
          <BasicSection
            control={control}
            errors={errors}
            onPhotoUpload={onPhotoUpload}
            register={register}
            setValue={setValue}
          />
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

      <div className="shrink-0 flex items-center justify-end gap-3 border-t border-border bg-card px-7 py-5">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Отмена
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
