// lifeStatistics.js
// Emotional-but-honest life statistics. Astronomical values are clearly
// labelled as approximations. All computed locally.

import {
  getTotals,
  getAgeInYears,
  getLeapDaysExperienced,
  MS_PER_DAY,
} from './dateCalculations.js';

// Average synodic month (new moon to new moon) in days.
const SYNODIC_MONTH_DAYS = 29.530588;
// Mean solar days per tropical year.
const DAYS_PER_YEAR = 365.2425;

/**
 * Number of birthdays a person has actually experienced (celebrated).
 * Equal to completed years, with a nod to the leap-day case.
 */
export function getBirthdaysExperienced(birthDate, now = new Date()) {
  return getAgeInYears(birthDate, now);
}

/**
 * Build the full set of "life in numbers" statistics.
 */
export function getLifeStatistics(birthDate, now = new Date()) {
  const totals = getTotals(birthDate, now);
  const years = getAgeInYears(birthDate, now);
  const days = totals.days;

  const approxMonths = Math.floor(days / (DAYS_PER_YEAR / 12));
  const fullMoons = Math.floor(days / SYNODIC_MONTH_DAYS);
  // One sunrise per day is an approximation (ignores polar regions / travel).
  const sunrises = days;
  const heartbeats = Math.floor((totals.minutes * 72)); // ~72 bpm average

  return {
    daysLived: days,
    weeksLived: totals.weeks,
    monthsLived: approxMonths,
    yearsCompleted: years,
    birthdaysExperienced: getBirthdaysExperienced(birthDate, now),
    leapDaysExperienced: getLeapDaysExperienced(birthDate, now),
    tripsAroundSun: years,
    fullMoons,
    sunrises,
    heartbeats,
  };
}

/**
 * Life-progress estimate against an illustrative lifespan. Clearly framed as
 * an illustration — nobody knows their real lifespan.
 * @param {Date} birthDate
 * @param {number} [lifeExpectancy=80]
 */
export function getLifeProgress(birthDate, now = new Date(), lifeExpectancy = 80) {
  const totals = getTotals(birthDate, now);
  const daysLived = totals.days;
  const totalDays = Math.round(lifeExpectancy * DAYS_PER_YEAR);
  const daysRemaining = Math.max(0, totalDays - daysLived);
  const yearsLived = getAgeInYears(birthDate, now);
  const yearsRemaining = Math.max(0, lifeExpectancy - yearsLived);
  const percent = Math.min(100, (daysLived / totalDays) * 100);

  return {
    lifeExpectancy,
    yearsLived,
    yearsRemaining,
    daysLived,
    daysRemaining,
    percent,
  };
}

export { MS_PER_DAY };
