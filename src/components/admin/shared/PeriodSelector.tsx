import { Calendar } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PERIOD_OPTIONS, ReportPeriod, PeriodOption } from "@/hooks/use-report-period";

interface PeriodSelectorProps {
  value: ReportPeriod;
  onChange: (value: ReportPeriod) => void;
  options?: PeriodOption[];
  className?: string;
  showIcon?: boolean;
  size?: "sm" | "default";
}

export const PeriodSelector = ({
  value,
  onChange,
  options = PERIOD_OPTIONS,
  className = "",
  showIcon = true,
  size = "default",
}: PeriodSelectorProps) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showIcon && (
        <Calendar className={`text-muted-foreground ${size === "sm" ? "w-4 h-4" : "w-5 h-5"}`} />
      )}
      <Select
        value={String(value)}
        onValueChange={(val) => onChange(parseInt(val, 10) as ReportPeriod)}
      >
        <SelectTrigger
          className={`${size === "sm" ? "h-8 text-sm w-[140px]" : "w-[180px]"}`}
        >
          <SelectValue placeholder="Selecione o período" />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={String(option.value)}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
