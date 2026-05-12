import { apiRequest } from "@/lib/api/client";
import type { ApiCitizenStamp, CitizenStampPayload, StampCategory } from "@/lib/api/stamp-mappers";

type RawApiCitizenStamp = ApiCitizenStamp & {
  stamp_category?: StampCategory;
  stamp_type?: string;
  stamp_placed_at?: string;
  stamp_authority?: string;
  stamp_note?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
};

export async function getCitizenStamps(
  citizenId: string,
  token?: string | null,
  stampCategory?: StampCategory
) {
  const stamps = await apiRequest<RawApiCitizenStamp[]>(`/api/v1/citizens/${citizenId}/stamps`, {
    method: "GET",
    token,
    params: {
      stamp_category: stampCategory
    }
  });

  return stamps.map(normalizeApiStamp);
}

export async function createCitizenStamp(
  citizenId: string,
  payload: CitizenStampPayload,
  token?: string | null
) {
  const stamp = await apiRequest<RawApiCitizenStamp>(`/api/v1/citizens/${citizenId}/stamps`, {
    method: "POST",
    token,
    data: payload
  });

  return normalizeApiStamp(stamp);
}

export async function getCitizenStamp(citizenId: string, stampId: string, token?: string | null) {
  const stamp = await apiRequest<RawApiCitizenStamp>(`/api/v1/citizens/${citizenId}/stamps/${stampId}`, {
    method: "GET",
    token
  });

  return normalizeApiStamp(stamp);
}

export async function updateCitizenStamp(
  citizenId: string,
  stampId: string,
  payload: CitizenStampPayload,
  token?: string | null
) {
  const stamp = await apiRequest<RawApiCitizenStamp>(`/api/v1/citizens/${citizenId}/stamps/${stampId}`, {
    method: "PUT",
    token,
    data: payload
  });

  return normalizeApiStamp(stamp);
}

export async function deleteCitizenStamp(citizenId: string, stampId: string, token?: string | null) {
  await apiRequest<void>(`/api/v1/citizens/${citizenId}/stamps/${stampId}`, {
    method: "DELETE",
    token
  });
}

function normalizeApiStamp(stamp: RawApiCitizenStamp): ApiCitizenStamp {
  return {
    id: stamp.id,
    stampCategory: stamp.stampCategory ?? stamp.stamp_category ?? "history",
    stampType: stamp.stampType ?? stamp.stamp_type ?? "",
    stampPlacedAt: stamp.stampPlacedAt ?? stamp.stamp_placed_at ?? "",
    stampAuthority: stamp.stampAuthority ?? stamp.stamp_authority ?? "",
    stampNote: stamp.stampNote ?? stamp.stamp_note ?? "",
    isActive: stamp.isActive ?? stamp.is_active ?? false,
    details: stamp.details ?? {},
    createdAt: stamp.createdAt ?? stamp.created_at ?? "",
    updatedAt: stamp.updatedAt ?? stamp.updated_at ?? ""
  };
}
