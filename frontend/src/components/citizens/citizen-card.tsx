import {
  Baby,
  CalendarDays,
  CreditCard,
  Eye,
  FileText,
  Heart,
  MapPin,
  Pencil,
  Shield,
  Trash2
} from "lucide-react";
import { resolveApiAssetUrl } from "@/lib/api/assets";
import type { Citizen, Stamp } from "@/types/citizen";

type CitizenCardProps = {
  citizen: Citizen;
  onView?: (citizen: Citizen) => void;
  onEdit?: (citizen: Citizen) => void;
  onDelete?: (citizen: Citizen) => void;
};

export function CitizenCard({ citizen, onView, onEdit, onDelete }: CitizenCardProps) {
  const fullName = [citizen.lastName, citizen.firstName, citizen.middleName].filter(Boolean).join(" ");
  const genderLabel = citizen.gender === "male" ? "М" : "Ж";
  const badges = buildCardBadges(citizen);
  const registrationAddress = getRegistrationAddress(citizen);

  return (
    <article className="w-full max-w-[612px] rounded-[14px] border border-border bg-card p-5 shadow-soft">
      <div className="flex gap-4">
        <div className="flex h-[96px] w-[84px] shrink-0 items-center justify-center rounded-[18px] border border-border bg-background">
          {citizen.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt="Фото гражданина" className="h-full w-full rounded-[18px] object-cover" src={resolveApiAssetUrl(citizen.photoUrl)} />
          ) : (
            <div className="relative flex h-[68px] w-[56px] items-center justify-center rounded-[14px] bg-[linear-gradient(180deg,#fff3ee_0%,#f2f4f8_100%)]">
              <div className="absolute top-[9px] h-6 w-6 rounded-full border-2 border-foreground/90" />
              <div className="absolute bottom-[10px] h-7 w-10 rounded-t-[999px] border-2 border-foreground/70 border-b-0" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-[17px] font-bold leading-6 text-foreground">{fullName}</h2>
            <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full border border-border px-2 text-[11px] text-muted-foreground">
              {genderLabel}
            </span>
          </div>

          <div className="mt-2 space-y-2 text-[14px] leading-5 text-foreground">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                {formatDate(citizen.birthDate)}
              </span>
              {citizen.birthPlace ? (
                <>
                  <DividerDot />
                  <span>{citizen.birthPlace}</span>
                </>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="inline-flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                {citizen.passportSeries} {citizen.passportNumber}
              </span>
              {citizen.passportIssuedDate ? (
                <>
                  <DividerDot />
                  <span>выдан {formatDate(citizen.passportIssuedDate)}</span>
                </>
              ) : null}
            </div>

            <div className="flex min-h-5 items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              <span className="min-w-0 break-words">{registrationAddress || "Адрес регистрации не указан"}</span>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {badges.map((badge) => (
              <StampBadge badge={badge} key={badge.label} />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 border-t border-border pt-4">
        <div className="flex items-center justify-end gap-6 text-[14px]">
          <button
            className="inline-flex items-center gap-2 text-foreground transition hover:text-primary"
            type="button"
            onClick={() => onView?.(citizen)}
          >
            <Eye className="h-4 w-4" />
            Просмотр
          </button>
          <button
            className="inline-flex items-center gap-2 text-foreground transition hover:text-primary"
            type="button"
            onClick={() => onEdit?.(citizen)}
          >
            <Pencil className="h-4 w-4" />
            Изменить
          </button>
          {onDelete ? (
            <button
              className="inline-flex items-center gap-2 text-destructive transition hover:text-destructive/80"
              type="button"
              onClick={() => onDelete(citizen)}
            >
              <Trash2 className="h-4 w-4" />
              Удалить
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

type CardBadge = {
  icon: typeof Baby;
  label: string;
};

function StampBadge({ badge }: { badge: CardBadge }) {
  const Icon = badge.icon;
  return (
    <span className="inline-flex h-7 items-center gap-1.5 rounded-full border border-border bg-background px-3 text-[12px] font-medium text-muted-foreground shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
      <Icon className="h-3.5 w-3.5" />
      {badge.label}
    </span>
  );
}

function DividerDot() {
  return <span className="h-1 w-1 rounded-full bg-muted-foreground/35" aria-hidden="true" />;
}

function buildCardBadges(citizen: Citizen): CardBadge[] {
  const childCount = citizen.children?.length ?? countStampsByComment(citizen.stamps, "реб");
  const hasMarriage = Boolean(citizen.marriageRecords?.length) || hasStamp(citizen.stamps, ["marital_status"], "Брак");
  const hasMilitary = Boolean(citizen.militaryRecords?.length) || hasStamp(citizen.stamps, ["military_duty"], "Воин");
  const passportCount = (citizen.historyRecords?.length ?? 0) + (citizen.foreignPassports?.length ?? 0);
  const fallbackPassportCount = countStamps(citizen.stamps, ["foreign_passport"]) || countStampsByComment(citizen.stamps, "пасп");
  const badges: CardBadge[] = [];

  if (childCount > 0) {
    badges.push({ icon: Baby, label: `${childCount} ${pluralize(childCount, ["ребёнок", "ребёнка", "детей"])}` });
  }

  if (hasMarriage) {
    badges.push({ icon: Heart, label: "Брак" });
  }

  if (hasMilitary) {
    badges.push({ icon: Shield, label: "Воинская" });
  }

  if (passportCount > 0 || fallbackPassportCount > 0) {
    const count = passportCount || fallbackPassportCount;
    badges.push({ icon: FileText, label: `${count} пасп.` });
  }

  return badges;
}

function getRegistrationAddress(citizen: Citizen) {
  if (citizen.registrationAddress) {
    return citizen.registrationAddress;
  }

  const registration = citizen.registrationStamps?.find((stamp) => stamp.type === "registration") ?? citizen.registrationStamps?.[0];

  if (!registration) {
    return "";
  }

  return [
    registration.locality,
    registration.settlement,
    registration.street ? `ул. ${registration.street}` : "",
    registration.house ? `д.${registration.house}` : "",
    registration.apartment ? `кв.${registration.apartment}` : ""
  ]
    .filter(Boolean)
    .join(", ");
}

function countStamps(stamps: Stamp[], types: Stamp["type"][]) {
  return stamps.filter((stamp) => types.includes(stamp.type)).length;
}

function countStampsByComment(stamps: Stamp[], labelPart: string) {
  return stamps.filter((stamp) => stamp.comment?.toLowerCase().includes(labelPart.toLowerCase())).length;
}

function hasStamp(stamps: Stamp[], types: Stamp["type"][], labelPart: string) {
  return stamps.some((stamp) => types.includes(stamp.type) && stamp.comment?.includes(labelPart));
}

function pluralize(count: number, [one, few, many]: [string, string, string]) {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return one;
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return few;
  }

  return many;
}

function formatDate(value: string) {
  if (!value) {
    return "";
  }

  if (/^\d{2}\.\d{2}\.\d{4}$/.test(value)) {
    return value;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ru-RU").format(date);
}
