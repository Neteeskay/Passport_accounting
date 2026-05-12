import { apiRequest } from "@/lib/api/client";
import {
  apiCitizenToCitizen,
  apiStampsToStamps,
  citizenFormToApiPayload,
  type ApiCitizen,
  type ApiStamp
} from "@/lib/api/citizen-mappers";
import type { CitizenFormValues } from "@/lib/validation/citizen";
import type { Citizen } from "@/types/citizen";

type CitizensListResponse = ApiCitizen[] | {
  items?: ApiCitizen[];
  results?: ApiCitizen[];
  data?: ApiCitizen[];
};

export type CitizensSearchParams = {
  search?: string;
  birthDate?: string;
  registrationAddress?: string;
  passportSeries?: string;
  passportNumber?: string;
  sortBy?: "full_name" | "birth_date" | "created_at" | "updated_at" | "passport_series";
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
};

export async function getCitizens(token?: string | null, params: CitizensSearchParams = {}) {
  const data = await apiRequest<CitizensListResponse>("/api/v1/citizens", {
    method: "GET",
    token,
    params: {
      search: params.search,
      birth_date: params.birthDate,
      registration_address: params.registrationAddress,
      passport_series: params.passportSeries,
      passport_number: params.passportNumber,
      sort_by: params.sortBy,
      sort_order: params.sortOrder,
      limit: params.limit,
      offset: params.offset
    }
  });

  return unwrapCitizens(data).map(apiCitizenToCitizen);
}

export async function createCitizen(values: CitizenFormValues, token?: string | null) {
  const data = await apiRequest<ApiCitizen>("/api/v1/citizens", {
    method: "POST",
    token,
    data: citizenFormToApiPayload(values)
  });

  return apiCitizenToCitizen(data);
}

export async function updateCitizen(citizenId: string, values: CitizenFormValues, token?: string | null) {
  const data = await apiRequest<ApiCitizen>(`/api/v1/citizens/${citizenId}`, {
    method: "PUT",
    token,
    data: citizenFormToApiPayload(values)
  });

  return apiCitizenToCitizen(data);
}

export async function getCitizenWithStamps(citizen: Citizen, token?: string | null) {
  const stamps = await apiRequest<ApiStamp[]>(`/api/v1/citizens/${citizen.id}/stamps`, {
    method: "GET",
    token
  });

  return {
    ...citizen,
    stamps: apiStampsToStamps(stamps)
  };
}

function unwrapCitizens(data: CitizensListResponse) {
  if (Array.isArray(data)) {
    return data;
  }

  return data.items ?? data.results ?? data.data ?? [];
}
