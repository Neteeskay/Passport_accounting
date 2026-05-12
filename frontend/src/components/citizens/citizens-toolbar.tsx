import { Search } from "lucide-react";
import { FilterField } from "@/components/citizens/filters/filter-field";
import {
  formatBirthDateFilterInput,
  formatPassportFilterInput,
  getBirthDateFilterError
} from "@/lib/utils/filter-validation";

export type CitizensListFilters = {
  search: string;
  birthDate: string;
  registrationAddress: string;
  passport: string;
  sortBy: "full_name" | "birth_date" | "created_at" | "updated_at" | "passport_series";
  sortOrder: "asc" | "desc";
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
        <span className="rounded-full border border-border bg-background px-3 py-1 text-[12px] text-muted-foreground">
          {filters.sortOrder === "asc" ? "По возрастанию" : "По убыванию"}
        </span>
      </div>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-muted-foreground" />
        <input
          className="h-11 w-full rounded-[22px] border border-border bg-background pl-12 pr-5 text-[14px] outline-none placeholder:text-muted-foreground focus:border-primary/45 focus:ring-2 focus:ring-primary/15"
          placeholder="Поиск по ФИО, серии или номеру паспорта"
          type="search"
          value={filters.search}
          onChange={(event) => updateFilter("search", event.target.value)}
        />
      </div>

      <div className="mt-3 grid grid-cols-[150px_190px_minmax(190px,1fr)_175px_135px] items-end gap-2">
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
            value={filters.registrationAddress}
            onChange={(event) => updateFilter("registrationAddress", event.target.value)}
          />
        </FilterField>
        <FilterField label="Сортировать по">
          <select
            className="h-10 w-full rounded-[18px] border border-border bg-background px-4 text-[13px] outline-none focus:border-primary/45 focus:ring-2 focus:ring-primary/15"
            value={filters.sortBy}
            onChange={(event) => updateFilter("sortBy", event.target.value)}
            aria-label="Сортировка"
          >
            <option value="full_name">ФИО</option>
            <option value="birth_date">Дата рождения</option>
            <option value="created_at">Дата создания</option>
            <option value="updated_at">Дата обновления</option>
            <option value="passport_series">Серия паспорта</option>
          </select>
        </FilterField>
        <FilterField label="Порядок">
          <select
            className="h-10 w-full rounded-[18px] border border-border bg-background px-4 text-[13px] outline-none focus:border-primary/45 focus:ring-2 focus:ring-primary/15"
            value={filters.sortOrder}
            onChange={(event) => updateFilter("sortOrder", event.target.value)}
            aria-label="Порядок сортировки"
          >
            <option value="asc">По возр.</option>
            <option value="desc">По убыв.</option>
          </select>
        </FilterField>
      </div>
    </section>
  );
}
