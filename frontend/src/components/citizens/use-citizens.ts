"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CitizensListFilters } from "@/components/citizens/citizens-toolbar";
import {
  createCitizen,
  deleteCitizen,
  exportCitizenPdf,
  exportRegistryPdf,
  getCitizen,
  getCitizens,
  getCitizensStats,
  updateCitizen,
  uploadCitizenPhoto
} from "@/lib/api/citizens";
import { citizenFiltersToApiParams } from "@/lib/api/citizen-query";
import { ApiError } from "@/lib/api/client";
import { mergeCitizenStamps } from "@/lib/api/stamp-mappers";
import { citizenFormToStampPayloads } from "@/lib/api/stamp-form-mappers";
import {
  createCitizenStamp,
  deleteCitizenStamp,
  getCitizenStamps,
  updateCitizenStamp
} from "@/lib/api/stamps";
import { downloadBlob } from "@/lib/utils/download";
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
  const loadRequestId = useRef(0);
  const [citizens, setCitizens] = useState<Citizen[]>([]);
  const [filters, setFilters] = useState<CitizensListFilters>(defaultFilters);
  const [stats, setStats] = useState({
    femaleCount: 0,
    maleCount: 0,
    totalCount: 0
  });
  const [isLoadingCitizens, setIsLoadingCitizens] = useState(false);
  const [hasLoadedCitizens, setHasLoadedCitizens] = useState(false);
  const [actionError, setActionError] = useState("");

  const loadCitizens = useCallback(async (nextFilters: CitizensListFilters) => {
    if (!token) {
      return;
    }

    const requestId = loadRequestId.current + 1;
    loadRequestId.current = requestId;

    try {
      setIsLoadingCitizens(true);
      setActionError("");
      const apiParams = {
        ...citizenFiltersToApiParams(nextFilters),
        limit: 50,
        offset: 0
      };
      const [citizensResult, statsResult] = await Promise.allSettled([
        getCitizens(token, apiParams),
        getCitizensStats(token, apiParams)
      ]);

      if (citizensResult.status === "rejected") {
        throw citizensResult.reason;
      }

      const response = citizensResult.value;

      if (requestId !== loadRequestId.current) {
        return;
      }

      setCitizens(response.items);
      if (statsResult.status === "fulfilled") {
        setStats(statsResult.value);
      } else {
        setStats({
          femaleCount: response.items.filter((citizen) => citizen.gender === "female").length,
          maleCount: response.items.filter((citizen) => citizen.gender === "male").length,
          totalCount: response.total
        });
      }
    } catch (error) {
      if (requestId !== loadRequestId.current) {
        return;
      }

      setActionError(getReadableApiError(error, "Не удалось загрузить граждан с backend"));
    } finally {
      if (requestId === loadRequestId.current) {
        setIsLoadingCitizens(false);
        setHasLoadedCitizens(true);
      }
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
      setStats((current) => ({
        femaleCount: current.femaleCount + (nextCitizen.gender === "female" ? 1 : 0),
        maleCount: current.maleCount + (nextCitizen.gender === "male" ? 1 : 0),
        totalCount: current.totalCount + 1
      }));
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
      setStats((current) => ({
        femaleCount: Math.max(0, current.femaleCount - (citizen.gender === "female" ? 1 : 0)),
        maleCount: Math.max(0, current.maleCount - (citizen.gender === "male" ? 1 : 0)),
        totalCount: Math.max(0, current.totalCount - 1)
      }));
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

  const downloadRegistryPdf = useCallback(async (nextFilters: CitizensListFilters = filters) => {
    try {
      setActionError("");
      const blob = await exportRegistryPdf(token, citizenFiltersToApiParams(nextFilters));

      downloadBlob(blob, "citizens-registry.pdf");
    } catch (error) {
      setActionError(getReadableApiError(error, "Не удалось скачать PDF реестра"));
      throw error;
    }
  }, [filters, token]);

  const downloadCitizenPdf = useCallback(async (citizenId: string) => {
    try {
      setActionError("");
      const blob = await exportCitizenPdf(citizenId, token);

      downloadBlob(blob, `citizen-${citizenId}.pdf`);
    } catch (error) {
      setActionError(getReadableApiError(error, "Не удалось скачать PDF гражданина"));
      throw error;
    }
  }, [token]);

  return {
    actionError,
    citizens,
    createCitizenCard,
    deleteCitizenCard,
    downloadCitizenPdf,
    downloadRegistryPdf,
    filters,
    hasLoadedCitizens,
    isLoadingCitizens,
    isRefreshingCitizens: isLoadingCitizens && hasLoadedCitizens,
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
