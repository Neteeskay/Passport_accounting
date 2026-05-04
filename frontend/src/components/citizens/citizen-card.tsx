import {
  CalendarDays,
  CreditCard,
  Eye,
  Heart,
  MapPin,
  Pencil,
  Shield,
  Trash2,
  Users
} from "lucide-react";
import type { Citizen } from "@/types/citizen";

type CitizenCardProps = {
  citizen: Citizen;
  onView?: (citizen: Citizen) => void;
};

export function CitizenCard({ citizen, onView }: CitizenCardProps) {
  const fullName = [citizen.lastName, citizen.firstName, citizen.middleName].filter(Boolean).join(" ");
  const genderLabel = citizen.gender === "male" ? "М" : "Ж";
  const stampLabels = citizen.stamps.map((stamp) => stamp.comment).filter(Boolean).slice(0, 4) as string[];

  return (
    <article className="w-full max-w-[612px] rounded-[14px] border border-border bg-card p-5 shadow-soft">
      <div className="flex gap-4">
        <div className="flex h-[96px] w-[84px] shrink-0 items-center justify-center rounded-[18px] border border-border bg-background">
          <div className="relative flex h-[68px] w-[56px] items-center justify-center rounded-[14px] bg-[linear-gradient(180deg,#fff3ee_0%,#f2f4f8_100%)]">
            <div className="absolute top-[9px] h-6 w-6 rounded-full border-2 border-foreground/90" />
            <div className="absolute bottom-[10px] h-7 w-10 rounded-t-[999px] border-2 border-foreground/70 border-b-0" />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-[17px] font-bold leading-6 text-foreground">{fullName}</h2>
            <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full border border-border px-2 text-[11px] text-muted-foreground">
              {genderLabel}
            </span>
          </div>

          <div className="mt-2 space-y-2 text-[14px] leading-5 text-foreground">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                {formatDate(citizen.birthDate)}
              </span>
              <span>{citizen.birthPlace}</span>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <span className="inline-flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                {citizen.passportSeries} {citizen.passportNumber}
              </span>
              <span>{citizen.passportIssuedBy}</span>
            </div>

            <div className="inline-flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{citizen.registrationAddress}</span>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {stampLabels.map((label) => (
              <StampBadge key={label} label={label} />
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
          <button className="inline-flex items-center gap-2 text-foreground transition hover:text-primary" type="button">
            <Pencil className="h-4 w-4" />
            Изменить
          </button>
          <button className="inline-flex items-center gap-2 text-destructive transition hover:text-destructive/80" type="button">
            <Trash2 className="h-4 w-4" />
            Удалить
          </button>
        </div>
      </div>
    </article>
  );
}

function StampBadge({ label }: { label: string }) {
  const icon = label.includes("реб") ? Users : label.includes("Брак") ? Heart : Shield;

  return (
    <span className="inline-flex h-6 items-center gap-1.5 rounded-full border border-border bg-background px-2.5 text-[11px] text-muted-foreground">
      {icon === Users ? <Users className="h-3 w-3" /> : null}
      {icon === Heart ? <Heart className="h-3 w-3" /> : null}
      {icon === Shield ? <Shield className="h-3 w-3" /> : null}
      {label}
    </span>
  );
}

function formatDate(value: string) {
  const date = new Date(value);

  return new Intl.DateTimeFormat("ru-RU").format(date);
}
