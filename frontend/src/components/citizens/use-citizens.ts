"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { CitizensListFilters } from "@/components/citizens/citizens-toolbar";
import {
  createCitizen,
  deleteCitizen,
  getCitizen,
  getCitizens,
  updateCitizen,
  uploadCitizenPhoto
} from "@/lib/api/citizens";
import { ApiError } from "@/lib/api/client";
import { mergeCitizenStamps } from "@/lib/api/stamp-mappers";
import { citizenFormToStampPayloads } from "@/lib/api/stamp-form-mappers";
import {
  createCitizenStamp,
  deleteCitizenStamp,
  getCitizenStamps,
  updateCitizenStamp
} from "@/lib/api/stamps";
import { toApiDateFilter } from "@/lib/utils/filter-validation";
import type { CitizenFormValues } from "@/lib/validation/citizen";
import type { Citizen } from "@/types/citizen";

const defaultFilters: CitizensListFilters = {
  query: "",
  gender: "all",
  birthDate: "",
  passport: "",
  address: ""
};

export function useCitizens(token?: string | null) {
  const [citizens, setCitizens] = useState<Citizen[]>([]);
  const [filters, setFilters] = useState<CitizensListFilters>(defaultFilters);
  const [totalCitizens, setTotalCitizens] = useState(0);
  const [isLoadingCitizens, setIsLoadingCitizens] = useState(false);
  const [actionError, setActionError] = useState("");

  const stats = useMemo(
    () => ({
      femaleCount: citizens.filter((citizen) => citizen.gender === "female").length,
      maleCount: citizens.filter((citizen) => citizen.gender === "male").length,
      totalCount: totalCitizens || citizens.length
    }),
    [citizens, totalCitizens]
  );

  const loadCitizens = useCallback(async (nextFilters: CitizensListFilters) => {
    if (!token) {
      return;
    }

    try {
      setIsLoadingCitizens(true);
      setActionError("");
      const response = await getCitizens(token, {
        query: nextFilters.query.trim() || undefined,
        gender: nextFilters.gender,
        birthDateFrom: toApiDateFilter(nextFilters.birthDate),
        passport: nextFilters.passport.replace(/\D/g, "") || undefined,
        address: nextFilters.address.trim() || undefined,
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

  const createCitizenCard = useCallback(async (values: CitizenFormValues) => {
    try {
      setActionError("");
      const createdCitizen = await createCitizen(values, token);
      const nextCitizen = await syncCitizenStamps(createdCitizen, values, token);

      setCitizens((current) => [nextCitizen, ...current]);
      setTotalCitizens((current) => current + 1);
    } catch (error) {
      setActionError(getReadableApiError(error, "Не удалось создать карточку гражданина"));
      throw error;
    }
  }, [token]);

  const updateCitizenCard = useCallback(async (citizenId: string, values: CitizenFormValues) => {
    try {
      setActionError("");
      const updatedCitizenBase = await updateCitizen(citizenId, values, token);
      const updatedCitizen = await syncCitizenStamps(updatedCitizenBase, values, token);

      setCitizens((current) => current.map((citizen) => (citizen.id === citizenId ? updatedCitizen : citizen)));

      return updatedCitizen;
    } catch (error) {
      setActionError(getReadableApiError(error, "Не удалось сохранить изменения"));
      throw error;
    }
  }, [token]);

  const deleteCitizenCard = useCallback(async (citizen: Citizen) => {
    const fullName = [citizen.lastName, citizen.firstName, citizen.middleName].filter(Boolean).join(" ");

    if (!window.confirm(`Удалить запись гражданина ${fullName}?`)) {
      return;
    }

    try {
      setActionError("");
      await deleteCitizen(citizen.id, token);
      setCitizens((current) => current.filter((item) => item.id !== citizen.id));
      setTotalCitizens((current) => Math.max(0, current - 1));
    } catch (error) {
      setActionError(getReadableApiError(error, "Не удалось удалить карточку гражданина"));
    }
  }, [token]);

  const loadCitizenDetails = useCallback(async (citizen: Citizen) => {
    try {
      const detailedCitizen = await getCitizen(citizen.id, token);
      const stamps = await getCitizenStamps(citizen.id, token);
      const citizenWithStamps = mergeCitizenStamps(detailedCitizen, stamps);

      setCitizens((current) => current.map((item) => (item.id === citizenWithStamps.id ? citizenWithStamps : item)));

      return citizenWithStamps;
    } catch {
      return citizen;
    }
  }, [token]);

  const uploadPhoto = useCallback(async (file: File) => {
    const result = await uploadCitizenPhoto(file, token);

    return result.photoUrl;
  }, [token]);

  return {
    actionError,
    citizens,
    createCitizenCard,
    deleteCitizenCard,
    filters,
    isLoadingCitizens,
    loadCitizenDetails,
    setFilters,
    stats,
    updateCitizenCard,
    uploadPhoto
  };
}

function getReadableApiError(error: unknown, fallback: string) {
  if (error instanceof ApiError && error.message) {
    return error.message;
  }

  return fallback;
}

async function syncCitizenStamps(citizen: Citizen, values: CitizenFormValues, token?: string | null) {
  const existingStamps = await getCitizenStamps(citizen.id, token);
  const existingStampIds = new Set(existingStamps.map((stamp) => stamp.id));
  const nextPayloads = citizenFormToStampPayloads(values);
  const nextExistingIds = new Set(
    nextPayloads
      .map((payload) => payload.formId)
      .filter((id) => existingStampIds.has(id))
  );

  await Promise.all(
    existingStamps
      .filter((stamp) => !nextExistingIds.has(stamp.id))
      .map((stamp) => deleteCitizenStamp(citizen.id, stamp.id, token))
  );

  await Promise.all(
    nextPayloads.map(({ formId, ...payload }) => {
      if (existingStampIds.has(formId)) {
        return updateCitizenStamp(citizen.id, formId, payload, token);
      }

      return createCitizenStamp(citizen.id, payload, token);
    })
  );

  return mergeCitizenStamps(citizen, await getCitizenStamps(citizen.id, token));
}
