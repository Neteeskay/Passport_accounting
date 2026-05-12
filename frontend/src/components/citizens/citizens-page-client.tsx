"use client";

import { Download, UsersRound } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useAuthSession } from "@/components/auth/use-auth-session";
import { CitizenCard } from "@/components/citizens/citizen-card";
import { CitizenDetailModal } from "@/components/citizens/detail/citizen-detail-modal";
import { CitizenFormModal } from "@/components/citizens/form/citizen-form-modal";
import { CitizensRegistryModal } from "@/components/citizens/registry/citizens-registry-modal";
import { CitizensToolbar, type CitizensListFilters } from "@/components/citizens/citizens-toolbar";
import { StatCard } from "@/components/citizens/stat-card";
import { AppShell } from "@/components/layout/app-shell";
import { createCitizen, getCitizens, getCitizenWithStamps, updateCitizen } from "@/lib/api/citizens";
import { ApiError } from "@/lib/api/client";
import { mockCitizens } from "@/lib/mock-data/citizens";
import type { CitizenFormValues } from "@/lib/validation/citizen";
import type { Citizen } from "@/types/citizen";

export function CitizensPageClient() {
  const { endSession, token, user: currentUser } = useAuthSession({ redirectOnUnauthorized: true });
  const [citizens, setCitizens] = useState<Citizen[]>(mockCitizens);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isRegistryOpen, setIsRegistryOpen] = useState(false);
  const [selectedCitizen, setSelectedCitizen] = useState<Citizen | null>(null);
  const [editingCitizen, setEditingCitizen] = useState<Citizen | null>(null);
  const [isLoadingCitizens, setIsLoadingCitizens] = useState(false);
  const [actionError, setActionError] = useState("");
  const [totalCitizens, setTotalCitizens] = useState(mockCitizens.length);
  const [filters, setFilters] = useState<CitizensListFilters>({
    search: "",
    birthDate: "",
    registrationAddress: "",
    passport: "",
    sortBy: "full_name",
    sortOrder: "asc"
  });

  const loadCitizens = useCallback(async (nextFilters: CitizensListFilters) => {
    if (!token) {
      return;
    }

    try {
      setIsLoadingCitizens(true);
      setActionError("");
      const passportParts = parsePassportFilter(nextFilters.passport);
      const response = await getCitizens(token, {
        search: nextFilters.search.trim() || undefined,
        birthDate: toApiDate(nextFilters.birthDate),
        registrationAddress: nextFilters.registrationAddress.trim() || undefined,
        passportSeries: passportParts.passportSeries,
        passportNumber: passportParts.passportNumber,
        sortBy: nextFilters.sortBy,
        sortOrder: nextFilters.sortOrder,
        limit: 50,
        offset: 0
      });

      setCitizens(response.items);
      setTotalCitizens(response.total);
    } catch (error) {
      setActionError(getReadableApiError(error, "Не удалось загрузить граждан с backend"));
    } finally {
      setIsLoadingCitizens(false);
    }
  }, [token]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadCitizens(filters);
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [filters, loadCitizens]);

  const totalCount = citizens.length;
  const maleCount = citizens.filter((citizen) => citizen.gender === "male").length;
  const femaleCount = citizens.filter((citizen) => citizen.gender === "female").length;

  const handleCreateCitizen = async (values: CitizenFormValues) => {
    try {
      setActionError("");
      const nextCitizen = await createCitizen(values, token);

      setCitizens((current) => [nextCitizen, ...current]);
      setTotalCitizens((current) => current + 1);
      setIsCreateOpen(false);
    } catch (error) {
      setActionError(getReadableApiError(error, "Не удалось создать карточку гражданина"));
      throw error;
    }
  };

  const handleDeleteCitizen = (citizen: Citizen) => {
    const fullName = [citizen.lastName, citizen.firstName, citizen.middleName].filter(Boolean).join(" ");

    if (window.confirm(`Удалить запись гражданина ${fullName}?`)) {
      setCitizens((current) => current.filter((item) => item.id !== citizen.id));
    }
  };

  const handleUpdateCitizen = async (values: CitizenFormValues) => {
    if (!editingCitizen) {
      return;
    }

    try {
      setActionError("");
      const updatedCitizen = await updateCitizen(editingCitizen.id, values, token);

      setCitizens((current) =>
        current.map((citizen) => (citizen.id === editingCitizen.id ? updatedCitizen : citizen))
      );
      setEditingCitizen(null);
    } catch (error) {
      setActionError(getReadableApiError(error, "Не удалось сохранить изменения"));
      throw error;
    }
  };

  const handleViewCitizen = async (citizen: Citizen) => {
    setSelectedCitizen(citizen);

    try {
      const detailedCitizen = await getCitizenWithStamps(citizen, token);

      setSelectedCitizen(detailedCitizen);
      setCitizens((current) =>
        current.map((item) => (item.id === detailedCitizen.id ? detailedCitizen : item))
      );
    } catch {
      // Просмотр основных данных остаётся доступным, даже если история штампов временно недоступна.
    }
  };

  const isAdmin = currentUser?.role === "admin";
  const roleLabel = currentUser?.role === "operator" ? "Оператор" : "Администратор";

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
            <StatCard icon={UsersRound} label="Всего записей" value={totalCitizens || totalCount} />
            <StatCard icon={UsersRound} label="Мужчины" value={maleCount} accent />
            <StatCard icon={UsersRound} label="Женщины" value={femaleCount} accent />
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

          {isLoadingCitizens ? (
            <div className="mt-4 rounded-[14px] border border-border bg-card px-4 py-3 text-[14px] text-muted-foreground">
              Загружаем граждан из backend...
            </div>
          ) : null}

          <section className="mt-6">
            <div className="flex flex-col gap-4">
              {citizens.map((citizen) => (
                <CitizenCard
                  citizen={citizen}
                  key={citizen.id}
                  onDelete={isAdmin ? handleDeleteCitizen : undefined}
                  onEdit={setEditingCitizen}
                  onView={(citizen) => void handleViewCitizen(citizen)}
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
      <CitizenFormModal
        citizen={editingCitizen}
        mode="edit"
        open={Boolean(editingCitizen)}
        onClose={() => setEditingCitizen(null)}
        onCreate={handleCreateCitizen}
        onUpdate={handleUpdateCitizen}
      />
      <CitizenDetailModal
        citizen={selectedCitizen}
        open={Boolean(selectedCitizen)}
        onClose={() => setSelectedCitizen(null)}
      />
      <CitizensRegistryModal
        citizens={citizens}
        open={isRegistryOpen}
        onClose={() => setIsRegistryOpen(false)}
      />
    </>
  );
}

function getReadableApiError(error: unknown, fallback: string) {
  if (error instanceof ApiError && error.message) {
    return error.message;
  }

  return fallback;
}

function parsePassportFilter(value: string) {
  const digits = value.replace(/\D/g, "");

  if (!digits) {
    return {};
  }

  if (digits.length <= 4) {
    return { passportSeries: digits };
  }

  return {
    passportSeries: digits.slice(0, 4),
    passportNumber: digits.slice(4, 10)
  };
}

function toApiDate(value: string) {
  const match = value.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);

  if (!match) {
    return undefined;
  }

  return `${match[3]}-${match[2]}-${match[1]}`;
}
