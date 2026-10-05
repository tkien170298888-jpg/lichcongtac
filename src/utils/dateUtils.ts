import { DayOfWeek } from '../types';

export interface WeekDayInfo {
  dayOfWeek: DayOfWeek;
  dateStr: string;   // DD/MM/YYYY
  shortDate: string; // DD/MM
  isoDate: string;   // YYYY-MM-DD
  fullDate: Date;
}

const DAY_NAMES: DayOfWeek[] = [
  'Thứ Hai', 
  'Thứ Ba', 
  'Thứ Tư', 
  'Thứ Năm', 
  'Thứ Sáu', 
  'Thứ Bảy', 
  'Chủ Nhật'
];

/**
 * Returns the exact 7 days of a given week in a year.
 * Anchored accurately to official Tuần 41/2026 starting Monday 05/10/2026.
 */
export function getWeekDates(weekNumber: number, year: number = 2026): WeekDayInfo[] {
  // Anchor on Week 41 Monday: 2026-10-05
  const anchorMonday = new Date(2026, 9, 5, 12, 0, 0); // Oct 5, 2026
  const diffWeeks = weekNumber - 41;
  const monday = new Date(anchorMonday);
  monday.setDate(anchorMonday.getDate() + diffWeeks * 7);

  const days: WeekDayInfo[] = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);

    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();

    days.push({
      dayOfWeek: DAY_NAMES[i],
      dateStr: `${dd}/${mm}/${yyyy}`,
      shortDate: `${dd}/${mm}`,
      isoDate: `${yyyy}-${mm}-${dd}`,
      fullDate: d,
    });
  }

  return days;
}

/**
 * Formats official range text, e.g.: "Từ ngày 12/10/2026 đến ngày 16/10/2026"
 */
export function getWeekRangeText(weekNumber: number, year: number = 2026, includeWeekend = false): string {
  const weekDays = getWeekDates(weekNumber, year);
  const startDay = weekDays[0];
  const endDay = includeWeekend ? weekDays[6] : weekDays[4]; // Thứ Sáu or Chủ Nhật
  return `Từ ngày ${startDay.dateStr} đến ngày ${endDay.dateStr}`;
}

/**
 * Generates available weeks list for dropdown (e.g. Weeks 35 to 52 for year 2026)
 */
export function getAvailableWeeks(year: number = 2026) {
  const weeks = [];
  for (let w = 38; w <= 52; w++) {
    const days = getWeekDates(w, year);
    const start = days[0].shortDate;
    const end = days[4].shortDate;
    weeks.push({
      weekNumber: w,
      year,
      label: `Tuần ${w} (${start} - ${end}/${year})`,
      shortLabel: `Tuần ${w}`,
      dateRange: `Từ ${start} đến ${end}/${year}`,
      startDateStr: days[0].dateStr,
      endDateStr: days[4].dateStr,
    });
  }
  return weeks;
}

/**
 * Convert YYYY-MM-DD input to DD/MM/YYYY
 */
export function isoToDateStr(iso: string): string {
  if (!iso) return '';
  const parts = iso.split('-');
  if (parts.length !== 3) return iso;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

/**
 * Convert DD/MM/YYYY to YYYY-MM-DD for native input date
 */
export function dateStrToIso(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('/');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}-${parts[1]}-${parts[0]}`;
}
