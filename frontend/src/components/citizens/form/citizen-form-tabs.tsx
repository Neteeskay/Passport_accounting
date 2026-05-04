import {
  Baby,
  BookText,
  FileText,
  Globe,
  Heart,
  MapPin,
  Shield,
  UserRound,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type CitizenFormTab =
  | "basic"
  | "registration"
  | "children"
  | "marriage"
  | "military"
  | "foreign-passport"
  | "name-change"
  | "history";

const tabs: Array<{
  value: CitizenFormTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  fullRow?: boolean;
}> = [
  { value: "basic", label: "Основное", icon: FileText },
  { value: "registration", label: "Регистрация", icon: MapPin },
  { value: "children", label: "Дети", icon: Baby },
  { value: "marriage", label: "Брак", icon: Heart },
  { value: "military", label: "Воинская", icon: Shield },
  { value: "foreign-passport", label: "Загран", icon: Globe },
  { value: "name-change", label: "Смена ФИО", icon: UserRound },
  { value: "history", label: "История", icon: BookText, fullRow: true }
];

type CitizenFormTabsProps = {
  activeTab: CitizenFormTab;
  onChange: (tab: CitizenFormTab) => void;
};

export function CitizenFormTabs({ activeTab, onChange }: CitizenFormTabsProps) {
  return (
    <div className="rounded-[18px] bg-muted p-2">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;

          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => onChange(tab.value)}
              className={cn(
                "inline-flex h-10 items-center gap-2 rounded-full px-4 text-[14px] transition",
                tab.fullRow && "mx-auto mt-1",
                activeTab === tab.value ? "bg-card text-foreground shadow-soft" : "text-foreground hover:bg-card/70"
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
