import { Search } from "lucide-react";
import { FilterField } from "@/components/citizens/filters/filter-field";
import {
  formatBirthDateFilterInput,
  formatPassportFilterInput,
  getBirthDateFilterError
} from "@/lib/utils/filter-validation";

export type CitizensListFilters = {
  query: string;
  gender: "all" | "male" | "female";
  birthDate: string;
  passport: string;
  address: string;
};

type CitizensToolbarProps = {
  filters: CitizensListFilters;
  onChange: (filters: CitizensListFilters) => void;
};

export function CitizensToolbar({ filters, onChange }: CitizensToolbarProps) {
  const birthDateError = getBirthDateFilterError(filters.birthDate);
  const updateFilter = (name: keyof CitizensListFilters, value: string) => {
    onChange({ ...filters, [name]: value });
  };

  return (
    <section className="mt-6 rounded-[10px] border border-border bg-card p-4 shadow-soft">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-[15px] font-semibold text-foreground">Фильтры</h2>
        </div>
      </div>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-muted-foreground" />
        <input
          className="h-11 w-full rounded-[22px] border border-border bg-background pl-12 pr-5 text-[14px] outline-none placeholder:text-muted-foreground focus:border-primary/45 focus:ring-2 focus:ring-primary/15"
          placeholder="Поиск по ФИО, паспорту, адресу, месту или дате рождения"
          type="search"
          value={filters.query}
          onChange={(event) => updateFilter("query", event.target.value)}
        />
      </div>

      <div className="mt-3 grid grid-cols-[142px_150px_190px_minmax(190px,1fr)] items-end gap-2">
        <FilterField label="Пол">
          <select
            className="h-10 w-full rounded-[18px] border border-border bg-background px-4 text-[13px] outline-none focus:border-primary/45 focus:ring-2 focus:ring-primary/15"
            value={filters.gender}
            onChange={(event) => updateFilter("gender", event.target.value)}
            aria-label="Пол"
          >
            <option value="all">Все</option>
            <option value="male">Мужчины</option>
            <option value="female">Женщины</option>
          </select>
        </FilterField>
        <FilterField label="Дата рождения" error={birthDateError}>
          <input
            className="h-10 w-full rounded-[18px] border border-border bg-background px-4 text-[13px] outline-none placeholder:text-muted-foreground focus:border-primary/45 focus:ring-2 focus:ring-primary/15 aria-[invalid=true]:border-destructive/60 aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-destructive/10"
            aria-invalid={Boolean(birthDateError)}
            placeholder="дд.мм.гггг"
            value={filters.birthDate}
            onChange={(event) => updateFilter("birthDate", formatBirthDateFilterInput(event.target.value))}
          />
        </FilterField>
        <FilterField label="Паспорт">
          <input
            className="h-10 w-full rounded-[18px] border border-border bg-background px-4 text-[13px] outline-none placeholder:text-muted-foreground focus:border-primary/45 focus:ring-2 focus:ring-primary/15"
            inputMode="numeric"
            placeholder="1111 111111"
            value={filters.passport}
            onChange={(event) => updateFilter("passport", formatPassportFilterInput(event.target.value))}
          />
        </FilterField>
        <FilterField label="Адрес регистрации">
          <input
            className="h-10 w-full rounded-[18px] border border-border bg-background px-4 text-[13px] outline-none placeholder:text-muted-foreground focus:border-primary/45 focus:ring-2 focus:ring-primary/15"
            placeholder="Адрес регистрации"
            value={filters.address}
            onChange={(event) => updateFilter("address", event.target.value)}
          />
        </FilterField>
      </div>
    </section>
  );
}
