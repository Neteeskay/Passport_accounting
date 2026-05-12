import { Search } from "lucide-react";
import { formatDateInput } from "@/lib/utils/input-format";

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
  const updateFilter = (name: keyof CitizensListFilters, value: string) => {
    onChange({ ...filters, [name]: value });
  };

  return (
    <section className="mt-6 rounded-[10px] border border-border bg-card p-4 shadow-soft">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-muted-foreground" />
        <input
          className="h-11 w-full rounded-[22px] border border-border bg-background pl-12 pr-5 text-[14px] outline-none placeholder:text-muted-foreground focus:border-primary/45 focus:ring-2 focus:ring-primary/15"
          placeholder="Поиск по ФИО, паспорту, адресу, дате рождения..."
          type="search"
          value={filters.search}
          onChange={(event) => updateFilter("search", event.target.value)}
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-[13px] font-medium">Дата рожд.:</span>
        <input
          className="h-10 w-[150px] rounded-[18px] border border-border bg-background px-4 text-[13px] outline-none placeholder:text-muted-foreground"
          placeholder="дд.мм.гггг"
          value={filters.birthDate}
          onChange={(event) => updateFilter("birthDate", formatDateInput(event.target.value))}
        />
        <input
          className="h-10 w-[190px] rounded-[18px] border border-border bg-background px-4 text-[13px] outline-none placeholder:text-muted-foreground"
          placeholder="Серия / номер паспорта"
          value={filters.passport}
          onChange={(event) => updateFilter("passport", event.target.value)}
        />
        <input
          className="h-10 w-[215px] rounded-[18px] border border-border bg-background px-4 text-[13px] outline-none placeholder:text-muted-foreground"
          placeholder="Адрес регистрации"
          value={filters.registrationAddress}
          onChange={(event) => updateFilter("registrationAddress", event.target.value)}
        />
        <select
          className="h-10 w-[175px] rounded-[18px] border border-border bg-background px-4 text-[13px] outline-none"
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
        <select
          className="h-10 w-[120px] rounded-[18px] border border-border bg-background px-4 text-[13px] outline-none"
          value={filters.sortOrder}
          onChange={(event) => updateFilter("sortOrder", event.target.value)}
          aria-label="Порядок сортировки"
        >
          <option value="asc">По возр.</option>
          <option value="desc">По убыв.</option>
        </select>
      </div>
    </section>
  );
}
