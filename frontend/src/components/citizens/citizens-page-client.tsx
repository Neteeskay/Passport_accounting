"use client";

import { Download, UsersRound } from "lucide-react";
import { useState } from "react";
import { CitizenCard } from "@/components/citizens/citizen-card";
import { CitizenFormModal } from "@/components/citizens/form/citizen-form-modal";
import { CitizensToolbar } from "@/components/citizens/citizens-toolbar";
import { StatCard } from "@/components/citizens/stat-card";
import { AppShell } from "@/components/layout/app-shell";
import { mockCitizens } from "@/lib/mock-data/citizens";
import { buildCitizenFromForm } from "@/lib/utils/citizen-form";
import type { CitizenFormValues } from "@/lib/validation/citizen";
import type { Citizen } from "@/types/citizen";

export function CitizensPageClient() {
  const [citizens, setCitizens] = useState<Citizen[]>(mockCitizens);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const totalCount = citizens.length;
  const maleCount = citizens.filter((citizen) => citizen.gender === "male").length;
  const femaleCount = citizens.filter((citizen) => citizen.gender === "female").length;

  const handleCreateCitizen = (values: CitizenFormValues) => {
    const nextCitizen = buildCitizenFromForm(values);

    setCitizens((current) => [nextCitizen, ...current]);
    setIsCreateOpen(false);
  };

  return (
    <>
      <AppShell onAddCitizen={() => setIsCreateOpen(true)}>
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

          <section className="mt-6">
            <div className="flex flex-col gap-4">
              {citizens.map((citizen) => (
                <CitizenCard citizen={citizen} key={citizen.id} />
              ))}
            </div>
          </section>
        </main>
      </AppShell>

      <CitizenFormModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreateCitizen}
      />
    </>
  );
}
