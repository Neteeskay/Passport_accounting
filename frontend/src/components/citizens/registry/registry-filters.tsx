"use client";

import { Search } from "lucide-react";
import { FilterField } from "@/components/citizens/filters/filter-field";
import {
  formatBirthDateFilterInput,
  formatPassportFilterInput,
  getBirthDateFilterError
} from "@/lib/utils/filter-validation";

export type RegistryFilters = {
  query: string;
  gender: "all" | "male" | "female";
  birthDate: string;
  passport: string;
  address: string;
};

type RegistryFiltersProps = {
  filters: RegistryFilters;
  onChange: (filters: RegistryFilters) => void;
};

export function RegistryFilters({ filters, onChange }: RegistryFiltersProps) {
  const birthDateError = getBirthDateFilterError(filters.birthDate);
  const updateFilter = (name: keyof RegistryFilters, value: string) => {
    onChange({ ...filters, [name]: value });
  };

  return (
    <div className="rounded-[14px] border border-border bg-card p-4">
      <div className="grid grid-cols-[minmax(190px,1fr)_104px_132px_150px_170px] items-center gap-2">
        <label className="relative min-w-0">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            className="h-11 w-full rounded-[22px] border border-border bg-background pl-11 pr-4 text-[13px] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/45 focus:ring-2 focus:ring-primary/15"
            value={filters.query}
            onChange={(event) => updateFilter("query", event.target.value)}
            placeholder="Поиск по ФИО..."
            type="search"
          />
        </label>

        <select
          className="h-9 w-full rounded-[18px] border border-border bg-background px-3 text-[13px] text-foreground outline-none focus:border-primary/45 focus:ring-2 focus:ring-primary/15"
          value={filters.gender}
          onChange={(event) => updateFilter("gender", event.target.value)}
          aria-label="Пол"
        >
          <option value="all">Все</option>
          <option value="male">Мужчины</option>
          <option value="female">Женщины</option>
        </select>

        <FilterField className="space-y-1" label="Дата рождения" error={birthDateError}>
          <input
            className="h-9 w-full rounded-[18px] border border-border bg-background px-3 text-[13px] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/45 focus:ring-2 focus:ring-primary/15 aria-[invalid=true]:border-destructive/60 aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-destructive/10"
            aria-invalid={Boolean(birthDateError)}
            value={filters.birthDate}
            onChange={(event) => updateFilter("birthDate", formatBirthDateFilterInput(event.target.value))}
            placeholder="дд.мм.гггг"
          />
        </FilterField>
        <input
          className="h-9 w-full rounded-[18px] border border-border bg-background px-3 text-[13px] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/45 focus:ring-2 focus:ring-primary/15"
          value={filters.passport}
          onChange={(event) => updateFilter("passport", formatPassportFilterInput(event.target.value))}
          inputMode="numeric"
          placeholder="1111 111111"
        />
        <input
          className="h-9 w-full rounded-[18px] border border-border bg-background px-3 text-[13px] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/45 focus:ring-2 focus:ring-primary/15"
          value={filters.address}
          onChange={(event) => updateFilter("address", event.target.value)}
          placeholder="Адрес регистрации"
        />
      </div>
    </div>
  );
}
