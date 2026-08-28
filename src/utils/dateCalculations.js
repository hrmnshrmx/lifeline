// dateCalculations.js
// All life-time math lives here. Everything runs locally in the browser and
// operates on the user's local device time. Robust around leap years,
// month-length differences and DST (Date arithmetic in JS is DST-aware for
// wall-clock breakdowns).

const MS_PER_SECOND = 1000;
const MS_PER_MINUTE = 60 * MS_PER_SECOND;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;
const MS_PER_DAY = 24 * MS_PER_HOUR;

/**
 * Parse a birth date (and optional time) into a Date in local time.
 * @param {string} dateStr - ISO-like date string "YYYY-MM-DD".
 * @param {string} [timeStr] - Optional "HH:MM" 24h time.
 * @returns {{ date: Date, hasTime: boolean } | null}
 */
export function parseBirthday(dateStr, timeStr) {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return null;

  let hours = 0;
  let minutes = 0;
  let hasTime = false;
  if (timeStr && /^\d{1,2}:\d{2}$/.test(timeStr)) {
    const [hh, mm] = timeStr.split(':').map(Number);
    if (hh >= 0 && hh < 24 && mm >= 0 && mm < 60) {
      hours = hh;
      minutes = mm;
      hasTime = true;
    }
  }

  // Construct in local time. Month is 0-indexed.
  const date = new Date(y, m - 1, d, hours, minutes, 0, 0);

  // Validate the date actually exists (e.g. reject 31 Feb which rolls over).
  if (
    date.getFullYear() !== y ||
    date.getMonth() !== m - 1 ||
    date.getDate() !== d
  ) {
    return null;
  }

  return { date, hasTime };
}

/**
 * Is the given date in the future relative to `now`?
 */
export function isFuture(birthDate, now = new Date()) {
  return birthDate.getTime() > now.getTime();
}

/**
 * Break the elapsed time since birth into calendar components
 * (years, months, days, hours, minutes, seconds). Calendar-aware:
 * accounts for varying month lengths and leap years.
 */
export function getElapsedBreakdown(birthDate, now = new Date()) {
  if (birthDate.getTime() > now.getTime()) {
    return {
      years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0,
    };
  }

  let years = now.getFullYear() - birthDate.getFullYear();
  let months = now.getMonth() - birthDate.getMonth();
  let days = now.getDate() - birthDate.getDate();
  let hours = now.getHours() - birthDate.getHours();
  let minutes = now.getMinutes() - birthDate.getMinutes();
  let seconds = now.getSeconds() - birthDate.getSeconds();

  if (seconds < 0) { seconds += 60; minutes -= 1; }
  if (minutes < 0) { minutes += 60; hours -= 1; }
  if (hours < 0) { hours += 24; days -= 1; }
  if (days < 0) {
    // Borrow days from the previous month.
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prevMonth.getDate();
    months -= 1;
  }
  if (months < 0) { months += 12; years -= 1; }

  return { years, months, days, hours, minutes, seconds };
}

/** Total whole units elapsed since birth. */
export function getTotals(birthDate, now = new Date()) {
  const diff = Math.max(0, now.getTime() - birthDate.getTime());
  return {
    milliseconds: diff,
    seconds: Math.floor(diff / MS_PER_SECOND),
    minutes: Math.floor(diff / MS_PER_MINUTE),
    hours: Math.floor(diff / MS_PER_HOUR),
    days: Math.floor(diff / MS_PER_DAY),
    weeks: Math.floor(diff / (MS_PER_DAY * 7)),
  };
}

/**
 * Whole completed years (age). Handles the case where the birthday hasn't
 * occurred yet this year.
 */
export function getAgeInYears(birthDate, now = new Date()) {
  if (birthDate.getTime() > now.getTime()) return 0;
  let age = now.getFullYear() - birthDate.getFullYear();
  const monthDiff = now.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDate.getDate())) {
    age -= 1;
  }
  return age;
}

/** Is a given calendar year a leap year? */
export function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Count how many Feb-29 days have actually passed between birth and now.
 * (i.e. leap days the person has lived through.)
 */
export function getLeapDaysExperienced(birthDate, now = new Date()) {
  if (birthDate.getTime() > now.getTime()) return 0;
  let count = 0;
  for (let year = birthDate.getFullYear(); year <= now.getFullYear(); year++) {
    if (!isLeapYear(year)) continue;
    const feb29 = new Date(year, 1, 29, 0, 0, 0, 0);
    if (feb29 >= birthDate && feb29 <= now) count += 1;
  }
  return count;
}

/** Format a Date's month/day as a "MM-DD" key for dataset lookups. */
export function toMonthDayKey(date) {
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${mm}-${dd}`;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** Human-friendly "14 March" style label. */
export function formatDayMonth(date) {
  return `${date.getDate()} ${MONTH_NAMES[date.getMonth()]}`;
}

/** Full "14 March 1999" style label. */
export function formatFullDate(date) {
  return `${date.getDate()} ${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

export { MS_PER_DAY, MONTH_NAMES };
