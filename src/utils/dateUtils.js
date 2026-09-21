export function getTodayDateString(refDate = new Date()) {
  const year = refDate.getFullYear();
  const month = String(refDate.getMonth() + 1).padStart(2, '0');
  const day = String(refDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
export function isToday(dateStr) {
  if (!dateStr) return false;
  return dateStr.startsWith(getTodayDateString());
}
export function isCurrentMonth(dateStr) {
  if (!dateStr) return false;
  const currentMonthPrefix = getTodayDateString().substring(0, 7);
  return dateStr.startsWith(currentMonthPrefix);
}
export function isDateInMonth(dateStr, targetYearMonth) {
  if (!dateStr) return false;
  const prefix = targetYearMonth || getTodayDateString().substring(0, 7);
  return dateStr.startsWith(prefix);
}
export function isCurrentYear(dateStr) {
  if (!dateStr) return false;
  const currentYearPrefix = getTodayDateString().substring(0, 4);
  return dateStr.startsWith(currentYearPrefix);
}
export function isPastOrToday(dateStr) {
  if (!dateStr) return false;
  const dateOnly = dateStr.split(' ')[0].split('T')[0];
  return dateOnly <= getTodayDateString();
}
export function isCurrentAcademicYear(dateStr) {
  if (!dateStr) return false;
  const dateOnly = dateStr.split(' ')[0].split('T')[0];
  const currentYear = new Date().getFullYear();
  return (
    dateOnly.startsWith(`${currentYear}`) ||
    dateOnly.startsWith(`${currentYear - 1}`)
  );
}
export function isDateInRange(dateStr, startDate, endDate) {
  if (!dateStr) return false;
  const dateOnly = dateStr.split(' ')[0].split('T')[0];
  return dateOnly >= startDate && dateOnly <= endDate;
}
export function formatDateDisplay(dateStr) {
  if (!dateStr) return '\u2014';
  try {
    const parts = dateStr.split(' ')[0].split('T')[0].split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d2 = new Date(year, month, day);
      if (!isNaN(d2.getTime())) {
        return d2.toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });
      }
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    }
  } catch (e) {}
  return dateStr;
}
export function formatDateTimeDisplay(dateTimeStr) {
  if (!dateTimeStr) return '\u2014';
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
  } catch (e) {}
  return dateTimeStr;
}
export function getRelativeDateString(dayOffset) {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  return getTodayDateString(d);
}
export function getFutureDateString(dayOffset) {
  return getRelativeDateString(dayOffset);
}
export function getPastDateString(dayOffset) {
  return getRelativeDateString(-dayOffset);
}
