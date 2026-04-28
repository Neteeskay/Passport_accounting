import { Search } from "lucide-react";

export function CitizensToolbar() {
  return (
    <section className="mt-6 rounded-[10px] border border-border bg-card p-4 shadow-soft">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-muted-foreground" />
        <input
          className="h-11 w-full rounded-[22px] border border-border bg-background pl-12 pr-5 text-[14px] outline-none placeholder:text-muted-foreground focus:border-primary/45 focus:ring-2 focus:ring-primary/15"
          placeholder="Поиск по ФИО, паспорту, адресу, дате рождения..."
          type="search"
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <select className="h-10 w-[142px] rounded-[18px] border border-border bg-background px-4 text-[13px] outline-none">
          <option>Все</option>
          <option>Мужчины</option>
          <option>Женщины</option>
        </select>
        <span className="text-[13px] font-medium">Дата рожд.:</span>
        <input
          className="h-10 w-[150px] rounded-[18px] border border-border bg-background px-4 text-[13px] outline-none placeholder:text-muted-foreground"
          placeholder="28.03.2026"
        />
        <span className="text-[18px] leading-none">—</span>
        <input
          className="h-10 w-[150px] rounded-[18px] border border-border bg-background px-4 text-[13px] outline-none placeholder:text-muted-foreground"
          placeholder="28.03.2026"
        />
        <input
          className="h-10 w-[190px] rounded-[18px] border border-border bg-background px-4 text-[13px] outline-none placeholder:text-muted-foreground"
          placeholder="Серия / номер паспорта"
        />
        <input
          className="h-10 w-[215px] rounded-[18px] border border-border bg-background px-4 text-[13px] outline-none placeholder:text-muted-foreground"
          placeholder="Адрес регистрации"
        />
      </div>
    </section>
  );
}
