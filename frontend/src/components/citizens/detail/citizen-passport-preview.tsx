import type {
  ChildRecord,
  Citizen,
  ForeignPassportRecord,
  HistoryRecord,
  MarriageRecord,
  MilitaryRecord,
  NameChangeRecord,
  RegistrationStamp
} from "@/types/citizen";
import { resolveApiAssetUrl } from "@/lib/api/assets";

type CitizenPassportPreviewProps = {
  citizen: Citizen;
};

export function CitizenPassportPreview({ citizen }: CitizenPassportPreviewProps) {
  return (
    <div className="mx-auto flex w-full max-w-[760px] flex-col items-center">
      <IssuePage citizen={citizen} />
      <Divider />
      <IdentityPage citizen={citizen} />
      <Divider />
      <RegistrationPage stamps={getRegistrationStamps(citizen)} />
      <Divider />
      <ChildrenPage childRecords={getChildren(citizen)} />
      <Divider />
      <MarriagePage records={getMarriageRecords(citizen)} />
      <Divider />
      <MilitaryPage records={getMilitaryRecords(citizen)} />
      <Divider />
      <ForeignPassportPage records={getForeignPassports(citizen)} />
      <Divider />
      <NameChangePage records={getNameChanges(citizen)} />
      <Divider />
      <HistoryPage records={getHistoryRecords(citizen)} />
    </div>
  );
}

function IssuePage({ citizen }: { citizen: Citizen }) {
  return (
    <PassportPage className="min-h-[315px]">
      <div className="text-center text-[14px] font-bold uppercase tracking-[12px] text-[#1f2430]">
        Российская Федерация
      </div>
      <div className="mt-8 grid grid-cols-[1fr_210px_28px] gap-6">
        <div className="space-y-5">
          <PassportLine label="Паспорт выдан" value={stripIssuedPrefix(citizen.passportIssuedBy)} strong />
          <PassportLine label="Дата выдачи" value={formatDate(citizen.passportIssuedDate)} strong />
        </div>
        <div className="pt-[69px]">
          <PassportLine label="Код подразделения" value={citizen.departmentCode} strong />
        </div>
        <div className="flex items-center justify-center text-[13px] font-bold tracking-[4px] text-[#b2444c] [writing-mode:vertical-rl]">
          {citizen.passportSeries} {citizen.passportNumber}
        </div>
      </div>
      <div className="mx-auto mt-6 flex h-[78px] w-[78px] items-center justify-center rounded-full border border-dashed border-[#999] text-[10px] text-[#999]" />
    </PassportPage>
  );
}

function IdentityPage({ citizen }: { citizen: Citizen }) {
  return (
    <PassportPage className="min-h-[255px]">
      <div className="grid grid-cols-[118px_1fr] gap-6">
        <PhotoBox photoUrl={citizen.photoUrl} />
        <div className="space-y-4">
          <PassportLine label="Фамилия" value={citizen.lastName.toUpperCase()} strong />
          <PassportLine label="Имя" value={citizen.firstName.toUpperCase()} strong />
          <PassportLine label="Отчество" value={(citizen.middleName ?? "").toUpperCase()} strong />
          <div className="grid grid-cols-2 gap-8">
            <PassportLine label="Пол" value={citizen.gender === "male" ? "М" : "Ж"} />
            <PassportLine label="Дата рождения" value={formatDate(citizen.birthDate)} />
          </div>
          <PassportLine label="Место рождения" value={citizen.birthPlace} />
        </div>
      </div>
    </PassportPage>
  );
}

function RegistrationPage({ stamps }: { stamps: RegistrationStamp[] }) {
  return (
    <PassportPage title="Штампы регистрации">
      {stamps.map((stamp) => (
        <StampBox key={stamp.id}>
          <Badge tone="rose">{stamp.type === "registration" ? "Зарегистрирован" : "Снят с регистрационного учёта"}</Badge>
          <PassportLine label="Дата" value={formatDate(stamp.date)} strong />
          <PassportLine
            label="Адрес"
            value={formatAddress(stamp)}
            strong
          />
          <div className="grid grid-cols-[1fr_86px] gap-5">
            <PassportLine label="Наименование подразделения" value={stamp.authority} />
            <PassportLine label="Код" value={stamp.departmentCode} />
          </div>
        </StampBox>
      ))}
    </PassportPage>
  );
}

function ChildrenPage({ childRecords }: { childRecords: ChildRecord[] }) {
  return (
    <PassportPage title="Дети">
      {childRecords.map((child) => (
        <StampBox key={child.id}>
          <div className="grid grid-cols-[1fr_54px] gap-5">
            <PassportLine label="ФИО ребёнка" value={formatPersonName(child.lastName, child.firstName, child.middleName).toUpperCase()} strong />
            <PassportLine label="Пол" value={child.gender === "male" ? "М" : "Ж"} />
          </div>
          <div className="grid grid-cols-2 gap-5">
            <PassportLine label="Дата рождения" value={formatDate(child.birthDate)} />
            <PassportLine label="Личный код" value={child.personalMark || "—"} />
          </div>
        </StampBox>
      ))}
    </PassportPage>
  );
}

function MarriagePage({ records }: { records: MarriageRecord[] }) {
  return (
    <PassportPage title="Семейное положение">
      {records.map((record) => (
        <StampBox key={record.id}>
          <Badge tone="rose">{record.status === "registered" ? "Зарегистрирован брак" : "Брак расторгнут"}</Badge>
          <PassportLine label="Дата" value={formatDate(record.date)} />
          <PassportLine
            label="Супруг(а)"
            value={formatPersonName(record.spouseLastName, record.spouseFirstName, record.spouseMiddleName).toUpperCase()}
            strong
          />
          {record.status === "registered" ? (
            <PassportLine label="Дата рождения супруга(и)" value={formatDate(record.spouseBirthDate)} />
          ) : null}
          <PassportLine label="Наименование органа" value={record.authority} />
          {record.actRecordNumber ? <PassportLine label="№ записи акта" value={record.actRecordNumber} /> : null}
        </StampBox>
      ))}
    </PassportPage>
  );
}

function MilitaryPage({ records }: { records: MilitaryRecord[] }) {
  return (
    <PassportPage title="Воинская обязанность">
      {records.map((record) => (
        <StampBox key={record.id}>
          <Badge tone="rose">
            {record.status === "liable"
              ? "Обязан(а) исполнять воинскую обязанность"
              : "Освобожден(а) от исполнения"}
          </Badge>
          <PassportLine label="Наименование органа" value={record.authority} strong />
          <PassportLine label="Дата" value={formatDate(record.date)} />
        </StampBox>
      ))}
    </PassportPage>
  );
}

function ForeignPassportPage({ records }: { records: ForeignPassportRecord[] }) {
  return (
    <PassportPage title="Заграничные паспорта">
      {records.map((record) => (
        <StampBox key={record.id}>
          <Badge tone="rose">Выдан заграничный паспорт</Badge>
          <div className="grid grid-cols-3 gap-5">
            <PassportLine label="Дата выдачи" value={formatDate(record.issueDate)} />
            <PassportLine label="Серия" value={record.series} strong />
            <PassportLine label="Номер" value={record.number} strong />
          </div>
          <PassportLine label="Кем выдан" value={record.authority} />
          {record.note ? <PassportLine label="Примечание" value={record.note} /> : null}
        </StampBox>
      ))}
    </PassportPage>
  );
}

function NameChangePage({ records }: { records: NameChangeRecord[] }) {
  return (
    <PassportPage title="Смена ФИО">
      {records.map((record) => (
        <StampBox key={record.id}>
          <Badge tone="rose">{record.reason || "Смена ФИО"}</Badge>
          <PassportLine label="Дата" value={formatDate(record.date)} />
          <div className="grid grid-cols-2 gap-5">
            <PassportLine
              label="Прежние данные"
              value={formatPersonName(record.previousLastName, record.previousFirstName, record.previousMiddleName).toUpperCase()}
              strong
            />
            <PassportLine
              label="Новые данные"
              value={formatPersonName(record.newLastName, record.newFirstName, record.newMiddleName).toUpperCase()}
              strong
            />
          </div>
          <div className="grid grid-cols-2 gap-5">
            <PassportLine label="Орган регистрации" value={record.authority} />
            <PassportLine label="Номер документа" value={record.documentNumber} />
          </div>
          {record.note ? <PassportLine label="Примечание" value={record.note} /> : null}
        </StampBox>
      ))}
    </PassportPage>
  );
}

function HistoryPage({ records }: { records: HistoryRecord[] }) {
  return (
    <PassportPage title="История паспортов">
      {records.map((record) => (
        <StampBox key={record.id}>
          <Badge>{record.event}</Badge>
          <div className="grid grid-cols-2 gap-5">
            <PassportLine label="Серия" value={record.series} />
            <PassportLine label="Номер" value={record.number} />
          </div>
          <div className="grid grid-cols-2 gap-5">
            <PassportLine label="Дата выдачи" value={formatDate(record.issueDate)} />
            <PassportLine label="Код подразделения" value={record.departmentCode} />
          </div>
          <PassportLine label="Кем выдан" value={record.authority} />
        </StampBox>
      ))}
    </PassportPage>
  );
}

function PassportPage({
  title,
  className,
  children
}: {
  title?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={[
        "w-full rounded-[4px] border border-[#cfc9bc] bg-[#f5efe3] px-7 py-7 text-[#1f2430] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.45)]",
        "bg-[repeating-linear-gradient(135deg,rgba(188,170,132,0.08)_0px,rgba(188,170,132,0.08)_1px,transparent_1px,transparent_14px)]",
        className ?? ""
      ].join(" ")}
    >
      {title ? (
        <h3 className="mb-6 text-center text-[12px] font-bold uppercase tracking-[7px] text-[#1f2430]">
          {title}
        </h3>
      ) : null}
      <div className="space-y-5">{children}</div>
    </section>
  );
}

function StampBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[3px] border border-[#c99aa0] bg-[#efe5d5]/75 px-4 py-4 text-[#1f2430]">
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function PassportLine({ label, value, strong = false }: { label: string; value?: string; strong?: boolean }) {
  return (
    <div>
      <div className="text-[10px] italic text-[#686861]">{label}</div>
      <div
        className={[
          "min-h-7 border-b border-[#8f8b80] py-1 text-[15px] leading-6",
          strong ? "text-[17px] font-bold uppercase tracking-[0.5px]" : "font-medium"
        ].join(" ")}
      >
        {value || "—"}
      </div>
    </div>
  );
}

function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "rose" }) {
  return (
    <span
      className={
        tone === "rose"
          ? "inline-flex rounded-full bg-[#ecd1cd] px-3 py-1 text-[11px] font-bold uppercase text-[#943c45]"
          : "inline-flex rounded-full bg-[#ece8dd] px-3 py-1 text-[11px] font-bold uppercase text-[#6c6960]"
      }
    >
      {children}
    </span>
  );
}

function PhotoBox({ photoUrl }: { photoUrl?: string }) {
  return (
    <div className="flex h-[160px] w-[118px] shrink-0 items-center justify-center overflow-hidden border border-[#8f8b80] bg-[#f7f3ea]">
      {photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={resolveApiAssetUrl(photoUrl)} alt="Фото гражданина" className="h-full w-full object-cover" />
      ) : (
        <div className="relative flex h-[98px] w-[80px] items-center justify-center rounded-[18px] bg-[linear-gradient(180deg,#fff3ee_0%,#e6e7ea_100%)]">
          <div className="absolute top-[13px] h-8 w-8 rounded-full border-[3px] border-[#171717]" />
          <div className="absolute bottom-[13px] h-10 w-14 rounded-t-[999px] border-[3px] border-[#171717] border-b-0" />
        </div>
      )}
    </div>
  );
}

function Divider() {
  return <div className="my-4 h-[6px] w-full rounded-full bg-[#bd6b76]" />;
}

function formatPersonName(lastName: string, firstName: string, middleName?: string) {
  return [lastName, firstName, middleName].filter(Boolean).join(" ");
}

function stripIssuedPrefix(value: string) {
  return value.replace(/^выдан\s+/i, "");
}

function formatDate(value?: string) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ru-RU").format(date);
}

function formatAddress(stamp: RegistrationStamp) {
  return [
    stamp.region,
    stamp.district,
    stamp.locality,
    stamp.settlement,
    stamp.street,
    stamp.house ? `д.${stamp.house}` : "",
    stamp.apartment ? `кв.${stamp.apartment}` : ""
  ]
    .filter(Boolean)
    .join(", ");
}

function getRegistrationStamps(citizen: Citizen) {
  return citizen.registrationStamps ?? [];
}

function getChildren(citizen: Citizen) {
  return citizen.children ?? [];
}

function getMarriageRecords(citizen: Citizen) {
  return citizen.marriageRecords ?? [];
}

function getMilitaryRecords(citizen: Citizen) {
  return citizen.militaryRecords ?? [];
}

function getForeignPassports(citizen: Citizen) {
  return citizen.foreignPassports ?? [];
}

function getNameChanges(citizen: Citizen) {
  return citizen.nameChanges ?? [];
}

function getHistoryRecords(citizen: Citizen) {
  return citizen.historyRecords ?? [];
}
