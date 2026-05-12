import { apiRequest } from "@/lib/api/client";
import {
  apiCitizenToCitizen,
  citizenFormToApiPayload,
  type ApiCitizen
} from "@/lib/api/citizen-mappers";
import type { CitizenFormValues } from "@/lib/validation/citizen";

type CitizensListResponse = ApiCitizen[] | {
  total?: number;
  limit?: number;
  offset?: number;
  items?: ApiCitizen[];
  results?: ApiCitizen[];
  data?: ApiCitizen[];
};

export type CitizensSearchParams = {
  query?: string;
  gender?: "all" | "male" | "female";
  birthDateFrom?: string;
  passport?: string;
  address?: string;
  limit?: number;
  offset?: number;
};

type CitizensStatsResponse = {
  total?: number;
  totalCount?: number;
  total_count?: number;
  male?: number;
  maleCount?: number;
  male_count?: number;
  female?: number;
  femaleCount?: number;
  female_count?: number;
};

export async function getCitizens(token?: string | null, params: CitizensSearchParams = {}) {
  const data = await apiRequest<CitizensListResponse>("/api/v1/citizens", {
    method: "GET",
    token,
    params: {
      query: params.query,
      gender: params.gender && params.gender !== "all" ? params.gender : undefined,
      birthDateFrom: params.birthDateFrom,
      passport: params.passport,
      address: params.address,
      limit: params.limit,
      offset: params.offset
    }
  });

  return {
    total: Array.isArray(data) ? data.length : data.total ?? unwrapCitizens(data).length,
    limit: Array.isArray(data) ? params.limit ?? data.length : data.limit ?? params.limit ?? 50,
    offset: Array.isArray(data) ? params.offset ?? 0 : data.offset ?? params.offset ?? 0,
    items: unwrapCitizens(data).map(apiCitizenToCitizen)
  };
}

export async function getCitizen(citizenId: string, token?: string | null) {
  const data = await apiRequest<ApiCitizen>(`/api/v1/citizens/${citizenId}`, {
    method: "GET",
    token
  });

  return apiCitizenToCitizen(data);
}

export async function getCitizensStats(token?: string | null, params: CitizensSearchParams = {}) {
  const data = await apiRequest<CitizensStatsResponse>("/api/v1/citizens/stats", {
    method: "GET",
    token,
    params: toCitizensApiParams(params)
  });

  return {
    totalCount: data.totalCount ?? data.total_count ?? data.total ?? 0,
    maleCount: data.maleCount ?? data.male_count ?? data.male ?? 0,
    femaleCount: data.femaleCount ?? data.female_count ?? data.female ?? 0
  };
}

export async function exportRegistryPdf(token?: string | null, params: CitizensSearchParams = {}) {
  return apiRequest<Blob>("/api/v1/citizens/registry/pdf", {
    method: "GET",
    token,
    params: toCitizensApiParams(params),
    responseType: "blob"
  });
}

export async function exportCitizenPdf(citizenId: string, token?: string | null) {
  return apiRequest<Blob>(`/api/v1/citizens/${citizenId}/pdf`, {
    method: "GET",
    token,
    responseType: "blob"
  });
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

export async function deleteCitizen(citizenId: string, token?: string | null) {
  await apiRequest<void>(`/api/v1/citizens/${citizenId}`, {
    method: "DELETE",
    token
  });
}

export async function uploadCitizenPhoto(file: File, token?: string | null) {
  const formData = new FormData();
  formData.append("file", file);

  return apiRequest<{ fileName: string; photoUrl: string }>("/api/v1/citizens/photo", {
    method: "POST",
    token,
    data: formData
  });
}

function unwrapCitizens(data: CitizensListResponse) {
  if (Array.isArray(data)) {
    return data;
  }

  return data.items ?? data.results ?? data.data ?? [];
}

function toCitizensApiParams(params: CitizensSearchParams) {
  return {
    query: params.query,
    gender: params.gender && params.gender !== "all" ? params.gender : undefined,
    birthDateFrom: params.birthDateFrom,
    passport: params.passport,
    address: params.address,
    limit: params.limit,
    offset: params.offset
  };
}
