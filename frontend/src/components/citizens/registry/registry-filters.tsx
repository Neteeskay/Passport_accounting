"use client";

import { Search } from "lucide-react";

export type RegistryFilters = {
  query: string;
  gender: "all" | "male" | "female";
  birthDateFrom: string;
  birthDateTo: string;
  passport: string;
  address: string;
};

type RegistryFiltersProps = {
  filters: RegistryFilters;
  onChange: (filters: RegistryFilters) => void;
};

export function RegistryFilters({ filters, onChange }: RegistryFiltersProps) {
  const updateFilter = (name: keyof RegistryFilters, value: string) => {
    onChange({ ...filters, [name]: value });
  };

  return (
    <div className="rounded-[14px] border border-border bg-card p-4">
      <div className="grid grid-cols-[minmax(190px,1fr)_104px_70px_116px_14px_116px_150px_170px] items-center gap-2">
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

        <span className="whitespace-nowrap text-[12px] font-medium text-foreground">Дата рожд.:</span>
        <input
          className="h-9 w-full rounded-[18px] border border-border bg-background px-3 text-[13px] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/45 focus:ring-2 focus:ring-primary/15"
          value={filters.birthDateFrom}
          onChange={(event) => updateFilter("birthDateFrom", event.target.value)}
          placeholder="дд.мм.гггг"
        />
        <span className="text-center text-[18px] leading-none text-foreground">—</span>
        <input
          className="h-9 w-full rounded-[18px] border border-border bg-background px-3 text-[13px] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/45 focus:ring-2 focus:ring-primary/15"
          value={filters.birthDateTo}
          onChange={(event) => updateFilter("birthDateTo", event.target.value)}
          placeholder="дд.мм.гггг"
        />
        <input
          className="h-9 w-full rounded-[18px] border border-border bg-background px-3 text-[13px] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/45 focus:ring-2 focus:ring-primary/15"
          value={filters.passport}
          onChange={(event) => updateFilter("passport", event.target.value)}
          placeholder="Серия / номер"
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
