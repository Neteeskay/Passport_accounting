import type { Citizen, RegistrationStamp } from "@/types/citizen";

export function getCitizenRegistrationAddress(citizen: Citizen) {
  if (citizen.registrationAddress) {
    return citizen.registrationAddress;
  }

  const registration = citizen.registrationStamps?.find((stamp) => stamp.type === "registration") ?? citizen.registrationStamps?.[0];

  return registration ? formatRegistrationAddress(registration) : "";
}

function formatRegistrationAddress(stamp: RegistrationStamp) {
  return [
    stamp.locality,
    stamp.settlement,
    stamp.street ? `ул. ${stamp.street}` : "",
    stamp.house ? `д.${stamp.house}` : "",
    stamp.apartment ? `кв.${stamp.apartment}` : ""
  ]
    .filter(Boolean)
    .join(", ");
}

