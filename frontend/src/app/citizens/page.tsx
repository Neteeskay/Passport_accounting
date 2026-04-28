import { Download, UsersRound } from "lucide-react";
import { CitizensToolbar } from "@/components/citizens/citizens-toolbar";
import { StatCard } from "@/components/citizens/stat-card";
import { AppShell } from "@/components/layout/app-shell";
import { mockCitizens } from "@/lib/mock-data/citizens";

export default function CitizensPage() {
  const totalCount = mockCitizens.length;
  const maleCount = mockCitizens.filter((citizen) => citizen.gender === "male").length;
  const femaleCount = mockCitizens.filter((citizen) => citizen.gender === "female").length;

  return (
    <AppShell>
      <main>
        <section className="grid grid-cols-4 gap-3">
          <StatCard icon={UsersRound} label="Всего записей" value={totalCount} />
          <StatCard icon={UsersRound} label="Мужчины" value={maleCount} accent />
          <StatCard icon={UsersRound} label="Женщины" value={femaleCount} accent />
          <button
            className="flex h-[92px] flex-col items-center justify-center rounded-[16px] border border-border bg-card text-[13px] shadow-soft transition hover:bg-muted"
            type="button"
          >
            <Download className="mb-3 h-5 w-5" />
            Скачать реестр
          </button>
        </section>

        <CitizensToolbar />
      </main>
    </AppShell>
  );
}
