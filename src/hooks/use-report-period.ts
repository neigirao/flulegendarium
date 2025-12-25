import { useState, useCallback, useMemo } from "react";

export type ReportPeriod = 7 | 14 | 30 | 60 | 90;

export interface PeriodOption {
  value: ReportPeriod;
  label: string;
  shortLabel: string;
}

export const PERIOD_OPTIONS: PeriodOption[] = [
  { value: 7, label: "Últimos 7 dias", shortLabel: "7d" },
  { value: 14, label: "Últimos 14 dias", shortLabel: "14d" },
  { value: 30, label: "Últimos 30 dias", shortLabel: "30d" },
  { value: 60, label: "Últimos 60 dias", shortLabel: "60d" },
  { value: 90, label: "Últimos 90 dias", shortLabel: "90d" },
];

const STORAGE_KEY = "admin-report-period";

interface UseReportPeriodOptions {
  defaultPeriod?: ReportPeriod;
  persistSelection?: boolean;
}

export const useReportPeriod = (options: UseReportPeriodOptions = {}) => {
  const { defaultPeriod = 30, persistSelection = true } = options;

  const getInitialPeriod = (): ReportPeriod => {
    if (persistSelection) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = parseInt(stored, 10) as ReportPeriod;
          if (PERIOD_OPTIONS.some((opt) => opt.value === parsed)) {
            return parsed;
          }
        }
      } catch {
        // localStorage not available
      }
    }
    return defaultPeriod;
  };

  const [period, setPeriodState] = useState<ReportPeriod>(getInitialPeriod);

  const setPeriod = useCallback(
    (newPeriod: ReportPeriod) => {
      setPeriodState(newPeriod);
      if (persistSelection) {
        try {
          localStorage.setItem(STORAGE_KEY, String(newPeriod));
        } catch {
          // localStorage not available
        }
      }
    },
    [persistSelection]
  );

  const currentOption = useMemo(
    () => PERIOD_OPTIONS.find((opt) => opt.value === period) || PERIOD_OPTIONS[2],
    [period]
  );

  const dateRange = useMemo(() => {
    const endDate = new Date();
    const startDate = new Date(Date.now() - period * 24 * 60 * 60 * 1000);
    return { startDate, endDate };
  }, [period]);

  return {
    period,
    setPeriod,
    periodOptions: PERIOD_OPTIONS,
    currentOption,
    dateRange,
  };
};
