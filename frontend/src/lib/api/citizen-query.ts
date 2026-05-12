import { toApiDateFilter } from "@/lib/utils/filter-validation";

export type CitizenFilters = {
  address: string;
  birthDate: string;
  gender: "all" | "male" | "female";
  passport: string;
  query: string;
};

export function citizenFiltersToApiParams(filters: CitizenFilters) {
  return {
    query: filters.query.trim() || undefined,
    gender: filters.gender !== "all" ? filters.gender : undefined,
    birthDateFrom: toApiDateFilter(filters.birthDate),
    passport: filters.passport.replace(/\D/g, "") || undefined,
    address: filters.address.trim() || undefined
  };
}

