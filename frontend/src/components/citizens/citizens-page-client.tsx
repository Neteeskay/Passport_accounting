"use client";

import { Download, UsersRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CitizenCard } from "@/components/citizens/citizen-card";
import { CitizenDetailModal } from "@/components/citizens/detail/citizen-detail-modal";
import { CitizenFormModal } from "@/components/citizens/form/citizen-form-modal";
import { CitizensToolbar } from "@/components/citizens/citizens-toolbar";
import { StatCard } from "@/components/citizens/stat-card";
import { AppShell } from "@/components/layout/app-shell";
import { mockCitizens } from "@/lib/mock-data/citizens";
import { buildCitizenFromForm } from "@/lib/utils/citizen-form";
import { useAuthStore } from "@/store/auth-store";
import type { CitizenFormValues } from "@/lib/validation/citizen";
import type { Citizen } from "@/types/citizen";

export function CitizensPageClient() {
  const router = useRouter();
  const currentUser = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [citizens, setCitizens] = useState<Citizen[]>(mockCitizens);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedCitizen, setSelectedCitizen] = useState<Citizen | null>(null);

  const totalCount = citizens.length;
  const maleCount = citizens.filter((citizen) => citizen.gender === "male").length;
  const femaleCount = citizens.filter((citizen) => citizen.gender === "female").length;

  const handleCreateCitizen = (values: CitizenFormValues) => {
    const nextCitizen = buildCitizenFromForm(values);

    setCitizens((current) => [nextCitizen, ...current]);
    setIsCreateOpen(false);
  };

  const handleDeleteCitizen = (citizen: Citizen) => {
    const fullName = [citizen.lastName, citizen.firstName, citizen.middleName].filter(Boolean).join(" ");

    if (window.confirm(`Удалить запись гражданина ${fullName}?`)) {
      setCitizens((current) => current.filter((item) => item.id !== citizen.id));
    }
  };

  const isAdmin = currentUser?.role === "admin" || !currentUser;
  const roleLabel = currentUser?.role === "operator" ? "Оператор" : "Администратор";

  return (
    <>
      <AppShell
        onAddCitizen={() => setIsCreateOpen(true)}
        onLogout={() => {
          logout();
          router.push("/login");
        }}
        showAdminLink={isAdmin}
        userName={currentUser?.fullName ?? "Администратор"}
        userRole={roleLabel}
      >
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
                <CitizenCard
                  citizen={citizen}
                  key={citizen.id}
                  onDelete={isAdmin ? handleDeleteCitizen : undefined}
                  onView={setSelectedCitizen}
                />
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
      <CitizenDetailModal
        citizen={selectedCitizen}
        open={Boolean(selectedCitizen)}
        onClose={() => setSelectedCitizen(null)}
      />
    </>
  );
}
