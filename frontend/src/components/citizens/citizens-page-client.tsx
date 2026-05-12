"use client";

import { Download, UsersRound } from "lucide-react";
import { useState } from "react";
import { useAuthSession } from "@/components/auth/use-auth-session";
import { CitizenCard } from "@/components/citizens/citizen-card";
import { CitizenDetailModal } from "@/components/citizens/detail/citizen-detail-modal";
import { CitizenFormModal } from "@/components/citizens/form/citizen-form-modal";
import { CitizensRegistryModal } from "@/components/citizens/registry/citizens-registry-modal";
import { CitizensToolbar } from "@/components/citizens/citizens-toolbar";
import { StatCard } from "@/components/citizens/stat-card";
import { useCitizens } from "@/components/citizens/use-citizens";
import { AppShell } from "@/components/layout/app-shell";
import type { CitizenFormValues } from "@/lib/validation/citizen";
import type { Citizen } from "@/types/citizen";

export function CitizensPageClient() {
  const { endSession, token, user: currentUser } = useAuthSession({ redirectOnUnauthorized: true });
  const {
    actionError,
    citizens,
    createCitizenCard,
    deleteCitizenCard,
    filters,
    hasLoadedCitizens,
    isLoadingCitizens,
    isRefreshingCitizens,
    loadCitizenDetails,
    setFilters,
    stats,
    updateCitizenCard,
    uploadPhoto
  } = useCitizens(token);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isRegistryOpen, setIsRegistryOpen] = useState(false);
  const [selectedCitizen, setSelectedCitizen] = useState<Citizen | null>(null);
  const [editingCitizen, setEditingCitizen] = useState<Citizen | null>(null);

  const isAdmin = currentUser?.role === "admin";
  const roleLabel = currentUser?.role === "operator" ? "Оператор" : "Администратор";

  const handleCreateCitizen = async (values: CitizenFormValues) => {
    await createCitizenCard(values);
    setIsCreateOpen(false);
  };

  const handleUpdateCitizen = async (values: CitizenFormValues) => {
    if (!editingCitizen) {
      return;
    }

    await updateCitizenCard(editingCitizen.id, values);
    setEditingCitizen(null);
  };

  const handleViewCitizen = async (citizen: Citizen) => {
    setSelectedCitizen(citizen);
    setSelectedCitizen(await loadCitizenDetails(citizen));
  };

  const handleEditCitizen = async (citizen: Citizen) => {
    setEditingCitizen(citizen);
    setEditingCitizen(await loadCitizenDetails(citizen));
  };

  return (
    <>
      <AppShell
        onAddCitizen={() => setIsCreateOpen(true)}
        onLogout={() => void endSession()}
        showAdminLink={isAdmin}
        userName={currentUser?.fullName ?? "Пользователь"}
        userRole={roleLabel}
      >
        <main>
          <section className="grid grid-cols-4 gap-3">
            <StatCard icon={UsersRound} label="Всего записей" value={stats.totalCount} loading={!hasLoadedCitizens && isLoadingCitizens} />
            <StatCard icon={UsersRound} label="Мужчины" value={stats.maleCount} accent loading={!hasLoadedCitizens && isLoadingCitizens} />
            <StatCard icon={UsersRound} label="Женщины" value={stats.femaleCount} accent loading={!hasLoadedCitizens && isLoadingCitizens} />
            <button
              className="flex h-[92px] flex-col items-center justify-center rounded-[16px] border border-border bg-card text-[13px] shadow-soft transition hover:bg-muted"
              type="button"
              onClick={() => setIsRegistryOpen(true)}
            >
              <Download className="mb-3 h-5 w-5" />
              Скачать реестр
            </button>
          </section>

          <CitizensToolbar filters={filters} onChange={setFilters} />

          {actionError ? (
            <div className="mt-4 rounded-[14px] border border-destructive/30 bg-destructive/10 px-4 py-3 text-[14px] text-destructive">
              {actionError}
            </div>
          ) : null}

          <section className="relative mt-6 min-h-[180px]">
            <div
              className={[
                "pointer-events-none absolute right-0 top-0 z-10 rounded-full border border-border bg-card/95 px-3 py-1.5 text-[12px] text-muted-foreground shadow-soft transition-opacity duration-200",
                isRefreshingCitizens ? "opacity-100" : "opacity-0"
              ].join(" ")}
            >
              Обновляем...
            </div>

            <div
              className={[
                "flex min-h-[180px] flex-col gap-4 transition-opacity duration-200",
                isRefreshingCitizens ? "opacity-70" : "opacity-100"
              ].join(" ")}
            >
              {citizens.length > 0 ? (
                citizens.map((citizen) => (
                  <CitizenCard
                    citizen={citizen}
                    key={citizen.id}
                    onDelete={isAdmin ? deleteCitizenCard : undefined}
                    onEdit={(citizen) => void handleEditCitizen(citizen)}
                    onView={(citizen) => void handleViewCitizen(citizen)}
                  />
                ))
              ) : (
                <div className="flex min-h-[180px] items-center justify-center rounded-[14px] border border-dashed border-border bg-card px-4 text-[14px] text-muted-foreground">
                  {isLoadingCitizens ? "Загружаем граждан..." : "Граждане не найдены"}
                </div>
              )}
            </div>
          </section>
        </main>
      </AppShell>

      <CitizenFormModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreateCitizen}
        onPhotoUpload={uploadPhoto}
      />
      <CitizenFormModal
        citizen={editingCitizen}
        mode="edit"
        open={Boolean(editingCitizen)}
        onClose={() => setEditingCitizen(null)}
        onCreate={handleCreateCitizen}
        onPhotoUpload={uploadPhoto}
        onUpdate={handleUpdateCitizen}
      />
      <CitizenDetailModal
        citizen={selectedCitizen}
        open={Boolean(selectedCitizen)}
        onClose={() => setSelectedCitizen(null)}
      />
      <CitizensRegistryModal
        citizens={citizens}
        initialFilters={filters}
        open={isRegistryOpen}
        onClose={() => setIsRegistryOpen(false)}
      />
    </>
  );
}
