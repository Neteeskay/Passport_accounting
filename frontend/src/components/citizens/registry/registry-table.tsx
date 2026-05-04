import type { Citizen } from "@/types/citizen";

type RegistryTableProps = {
  citizens: Citizen[];
};

export function RegistryTable({ citizens }: RegistryTableProps) {
  return (
    <div className="overflow-hidden rounded-[14px] border border-border bg-card">
      <table className="w-full table-fixed border-collapse text-left text-[13px] text-foreground">
        <thead>
          <tr className="border-b border-border">
            <th className="w-[48px] px-4 py-4 font-semibold">№</th>
            <th className="w-[170px] px-4 py-4 font-semibold">ФИО</th>
            <th className="w-[105px] px-4 py-4 font-semibold uppercase leading-4">Дата рожд.</th>
            <th className="w-[64px] px-4 py-4 font-semibold uppercase">Пол</th>
            <th className="w-[120px] px-4 py-4 font-semibold uppercase leading-4">Место рожд.</th>
            <th className="w-[125px] px-4 py-4 font-semibold uppercase leading-4">Серия / номер</th>
            <th className="px-4 py-4 font-semibold uppercase">Адрес</th>
            <th className="w-[105px] px-4 py-4 font-semibold uppercase leading-4">Дата выдачи</th>
          </tr>
        </thead>
        <tbody>
          {citizens.length > 0 ? (
            citizens.map((citizen, index) => (
              <tr className="border-b border-border last:border-b-0" key={citizen.id}>
                <td className="px-4 py-4 align-top">{index + 1}</td>
                <td className="px-4 py-4 align-top font-semibold leading-5">{formatFullName(citizen)}</td>
                <td className="px-4 py-4 align-top">{formatDate(citizen.birthDate)}</td>
                <td className="px-4 py-4 align-top">{citizen.gender === "male" ? "М" : "Ж"}</td>
                <td className="px-4 py-4 align-top">{citizen.birthPlace}</td>
                <td className="px-4 py-4 align-top">
                  {citizen.passportSeries} {citizen.passportNumber}
                </td>
                <td className="px-4 py-4 align-top leading-5">{citizen.registrationAddress}</td>
                <td className="px-4 py-4 align-top">{formatDate(citizen.passportIssuedDate)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="px-4 py-8 text-center text-muted-foreground" colSpan={8}>
                Записи ещё не добавлены
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function formatFullName(citizen: Citizen) {
  return [citizen.lastName, citizen.firstName, citizen.middleName].filter(Boolean).join(" ");
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ru-RU").format(date);
}
