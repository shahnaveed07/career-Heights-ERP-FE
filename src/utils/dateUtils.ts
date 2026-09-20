/**
 * Centralized Date Utilities for Career Heights ERP
 * Ensures consistent date formatting, comparison, and dynamic date handling across all modules.
 */

// Returns current application date as 'YYYY-MM-DD' in local timezone
export function getTodayDateString(refDate: Date = new Date()): string {
  const year = refDate.getFullYear();
  const month = String(refDate.getMonth() + 1).padStart(2, '0');
  const day = String(refDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Check if a date string 'YYYY-MM-DD' is today
export function isToday(dateStr?: string | null): boolean {
  if (!dateStr) return false;
  return dateStr.startsWith(getTodayDateString());
}

// Check if a date string is in the current month
export function isCurrentMonth(dateStr?: string | null): boolean {
  if (!dateStr) return false;
  const currentMonthPrefix = getTodayDateString().substring(0, 7); // 'YYYY-MM'
  return dateStr.startsWith(currentMonthPrefix);
}

// Check if a date string is in the current year
export function isCurrentYear(dateStr?: string | null): boolean {
  if (!dateStr) return false;
  const currentYearPrefix = getTodayDateString().substring(0, 4); // 'YYYY'
  return dateStr.startsWith(currentYearPrefix);
}

// Check if a date string is past or today
export function isPastOrToday(dateStr?: string | null): boolean {
  if (!dateStr) return false;
  const dateOnly = dateStr.split(' ')[0].split('T')[0];
  return dateOnly <= getTodayDateString();
}

// Check if a date string is in the current academic year (e.g. within current year or last 365 days)
export function isCurrentAcademicYear(dateStr?: string | null): boolean {
  if (!dateStr) return false;
  const dateOnly = dateStr.split(' ')[0].split('T')[0];
  const currentYear = new Date().getFullYear();
  // An academic session covers the current year and the previous year intake
  return dateOnly.startsWith(`${currentYear}`) || dateOnly.startsWith(`${currentYear - 1}`);
}

// Check if date falls within a specific range
export function isDateInRange(dateStr: string, startDate: string, endDate: string): boolean {
  if (!dateStr) return false;
  const dateOnly = dateStr.split(' ')[0].split('T')[0];
  return dateOnly >= startDate && dateOnly <= endDate;
}

// Format date for user-facing display e.g. "20 Sep 2026"
export function formatDateDisplay(dateStr?: string | null): string {
  if (!dateStr) return '—';
  try {
    const parts = dateStr.split(' ')[0].split('T')[0].split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      }
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    }
  } catch (e) {
    // fallback
  }
  return dateStr;
}

// Format timestamp with time e.g. "20 Sep 2026, 09:30 AM"
export function formatDateTimeDisplay(dateTimeStr?: string | null): string {
  if (!dateTimeStr) return '—';
  try {
    const d = new Date(dateTimeStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  } catch (e) {
    // fallback
  }
  return dateTimeStr;
}

// Helper to get relative date string (e.g. offset in days)
export function getRelativeDateString(dayOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  return getTodayDateString(d);
}

// Helper to get future date string (e.g. offset in days)
export function getFutureDateString(dayOffset: number): string {
  return getRelativeDateString(dayOffset);
}

// Helper to get past date string (e.g. offset in days)
export function getPastDateString(dayOffset: number): string {
  return getRelativeDateString(-dayOffset);
}

