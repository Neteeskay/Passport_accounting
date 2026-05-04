"use client";

import { Download, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ModalOverlay } from "@/components/ui/modal-overlay";
import type { Citizen } from "@/types/citizen";
import { RegistryFilters, type RegistryFilters as RegistryFiltersState } from "./registry-filters";
import { RegistryTable } from "./registry-table";

const emptyFilters: RegistryFiltersState = {
  query: "",
  gender: "all",
  birthDateFrom: "",
  birthDateTo: "",
  passport: "",
  address: ""
};

type CitizensRegistryModalProps = {
  citizens: Citizen[];
  open: boolean;
  onClose: () => void;
};

export function CitizensRegistryModal({ citizens, open, onClose }: CitizensRegistryModalProps) {
  const [filters, setFilters] = useState<RegistryFiltersState>(emptyFilters);

  const filteredCitizens = useMemo(
    () => citizens.filter((citizen) => matchesFilters(citizen, filters)),
    [citizens, filters]
  );

  if (!open) {
    return null;
  }

  return (
    <ModalOverlay className="items-center justify-center px-5 py-6" contentClassName="w-full max-w-[1240px]">
      <section className="flex max-h-[92vh] w-full flex-col rounded-[22px] border border-border bg-background text-foreground shadow-modal">
        <header className="flex items-center justify-between px-8 pb-5 pt-7">
          <h1 className="text-[22px] font-bold leading-7">Реестр граждан</h1>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
            type="button"
            onClick={onClose}
            aria-label="Закрыть реестр"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="mx-8 min-h-0 flex-1 overflow-y-auto rounded-[18px] border border-border bg-card p-7">
          <h2 className="text-[19px] font-bold leading-6">Все граждане ({filteredCitizens.length})</h2>
          <div className="mt-5">
            <RegistryFilters filters={filters} onChange={setFilters} />
          </div>
          <div className="mt-5">
            <RegistryTable citizens={filteredCitizens} />
          </div>
        </div>

        <footer className="flex items-center justify-end gap-3 px-8 py-6">
          <Button className="h-11 rounded-[18px] border border-border px-5" type="button" variant="ghost" onClick={onClose}>
            <X className="h-4 w-4" />
            Закрыть
          </Button>
          <Button className="h-11 rounded-[18px] px-5" type="button" onClick={() => window.print()}>
            <Download className="h-4 w-4" />
            Скачать PDF
          </Button>
        </footer>
      </section>
    </ModalOverlay>
  );
}

function matchesFilters(citizen: Citizen, filters: RegistryFiltersState) {
  const query = normalize(filters.query);
  const passport = normalize(filters.passport);
  const address = normalize(filters.address);
  const fullName = normalize([citizen.lastName, citizen.firstName, citizen.middleName].filter(Boolean).join(" "));
  const citizenPassport = normalize(`${citizen.passportSeries} ${citizen.passportNumber}`);
  const citizenAddress = normalize(citizen.registrationAddress);

  if (query && !fullName.includes(query)) {
    return false;
  }

  if (filters.gender !== "all" && citizen.gender !== filters.gender) {
    return false;
  }

  if (passport && !citizenPassport.includes(passport)) {
    return false;
  }

  if (address && !citizenAddress.includes(address)) {
    return false;
  }

  return isInsideDateRange(citizen.birthDate, filters.birthDateFrom, filters.birthDateTo);
}

function normalize(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function isInsideDateRange(value: string, from: string, to: string) {
  const date = parseDate(value);
  const start = parseDate(from);
  const end = parseDate(to);

  if (!date) {
    return true;
  }

  if (start && date < start) {
    return false;
  }

  if (end && date > end) {
    return false;
  }

  return true;
}

function parseDate(value: string) {
  if (!value.trim()) {
    return null;
  }

  const isoDate = new Date(value);

  if (!Number.isNaN(isoDate.getTime())) {
    return isoDate;
  }

  const match = value.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);

  if (!match) {
    return null;
  }

  return new Date(`${match[3]}-${match[2]}-${match[1]}T00:00:00`);
}
