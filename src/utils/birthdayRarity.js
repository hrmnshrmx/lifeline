// birthdayRarity.js
// A TRANSPARENT, calendar-based birthday-rarity estimate.
//
// We deliberately do NOT pretend to have exact worldwide or India-wide birth
// statistics. This is an honest "1 in 365" style calendar estimate.
//
// Architecture note: if a real birthday-frequency dataset is added later,
// implement `frequencyForDate(monthDayKey)` returning a fraction (0..1) and
// wire it into `estimateBirthdayRarity`. The UI reads whatever this returns.

import { formatDayMonth } from './dateCalculations.js';

// Placeholder hook for a future real dataset. Return null to fall back to the
// calendar-based estimate. When real data exists, return the share of births
// (0..1) that fall on the given "MM-DD" key.
export function frequencyForDate(/* monthDayKey */) {
  return null;
}

/**
 * Produce a rarity estimate for a birth date.
 * @param {Date} birthDate
 * @returns {{
 *   dayLabel: string,
 *   oneIn: number,
 *   percent: number,
 *   isLeapDay: boolean,
 *   usesRealData: boolean,
 *   note: string,
 * }}
 */
export function estimateBirthdayRarity(birthDate) {
  const isLeapDay = birthDate.getMonth() === 1 && birthDate.getDate() === 29;
  const dayLabel = formatDayMonth(birthDate);
  const monthDayKey = `${String(birthDate.getMonth() + 1).padStart(2, '0')}-${String(
    birthDate.getDate(),
  ).padStart(2, '0')}`;

  const real = frequencyForDate(monthDayKey);
  if (real && real > 0) {
    return {
      dayLabel,
      oneIn: Math.round(1 / real),
      percent: real * 100,
      isLeapDay,
      usesRealData: true,
      note: 'Based on a supplied birth-frequency dataset.',
    };
  }

  // Feb 29 only occurs roughly once every 4 years → ~1 in 1461 calendar days.
  if (isLeapDay) {
    return {
      dayLabel,
      oneIn: 1461,
      percent: (1 / 1461) * 100,
      isLeapDay,
      usesRealData: false,
      note: 'A leap day — it only appears on the calendar roughly once every four years.',
    };
  }

  return {
    dayLabel,
    oneIn: 365,
    percent: (1 / 365) * 100,
    isLeapDay,
    usesRealData: false,
    note: 'Calendar-based estimate. Births are not evenly distributed across dates.',
  };
}
