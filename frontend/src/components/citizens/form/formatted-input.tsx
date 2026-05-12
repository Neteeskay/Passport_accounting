"use client";

import type { ChangeEvent } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { Input, type InputProps } from "@/components/ui/input";

type FormattedInputProps = Omit<InputProps, "name" | "onBlur" | "onChange" | "ref"> & {
  formatter: (value: string) => string;
  registration: UseFormRegisterReturn;
};

export function FormattedInput({ formatter, registration, ...props }: FormattedInputProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    event.currentTarget.value = formatter(event.currentTarget.value);
    registration.onChange(event);
  };

  return <Input {...props} {...registration} onChange={handleChange} />;
}
