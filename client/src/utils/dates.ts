import {
  startOfWeek, endOfWeek, startOfMonth, endOfMonth,
  startOfQuarter, endOfQuarter, startOfYear, endOfYear,
  isWithinInterval,
} from "date-fns";

export type TimePeriod = "week" | "month" | "quarter" | "year" | "all";

export function getPeriodRange(period: TimePeriod): { start: Date; end: Date } | null {
  const now = new Date();
  if (period === "all") return null;
  if (period === "week")    return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
  if (period === "month")   return { start: startOfMonth(now), end: endOfMonth(now) };
  if (period === "quarter") return { start: startOfQuarter(now), end: endOfQuarter(now) };
  return { start: startOfYear(now), end: endOfYear(now) };
}

export function filterByPeriod<T extends { date: string }>(
  items: T[],
  period: TimePeriod
): T[] {
  const range = getPeriodRange(period);
  if (!range) return items;
  return items.filter(item =>
    isWithinInterval(new Date(item.date), { start: range.start, end: range.end })
  );
}
