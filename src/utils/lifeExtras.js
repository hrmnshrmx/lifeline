// lifeExtras.js
// Extra local calculations: generation, cosmic travel distance, weekly body
// rhythms and the "life in weeks" grid. All estimates are clearly framed.

import { getTotals } from './dateCalculations.js';

/* ------------------------------------------------------------------ */
/* Generation + decade                                                 */
/* ------------------------------------------------------------------ */
const GENERATIONS = [
  { min: 2013, max: 2100, name: 'Generation Alpha',
    blurb: 'The first cohort born entirely in the 21st century — raised with touchscreens and AI as a given.' },
  { min: 1997, max: 2012, name: 'Generation Z',
    blurb: 'True digital natives — you’ve never known a world without the internet and smartphones.' },
  { min: 1981, max: 1996, name: 'Millennials',
    blurb: 'You came of age alongside the rise of the web, mobile phones and social media.' },
  { min: 1965, max: 1980, name: 'Generation X',
    blurb: 'The bridge generation — an analog childhood that grew into a digital adulthood.' },
  { min: 1946, max: 1964, name: 'Baby Boomers',
    blurb: 'Born in the post-war boom, through decades of rapid social and technological change.' },
  { min: 1928, max: 1945, name: 'The Silent Generation',
    blurb: 'Shaped by the years around the Great Depression and the Second World War.' },
  { min: 0, max: 1927, name: 'The Greatest Generation',
    blurb: 'Formed by the early 20th century and the World Wars.' },
];

export function getGeneration(birthDate) {
  const year = birthDate.getFullYear();
  const gen = GENERATIONS.find((g) => year >= g.min && year <= g.max) || GENERATIONS[GENERATIONS.length - 1];
  const decade = `${Math.floor(year / 10) * 10}s`;
  return { name: gen.name, blurb: gen.blurb, decade, year };
}

/* ------------------------------------------------------------------ */
/* Cosmic distance                                                     */
/* ------------------------------------------------------------------ */
const ORBITAL_SPEED_KMS = 29.78; // Earth around the Sun
const GALACTIC_SPEED_KMS = 230; // the Sun around the galactic centre
const MOON_DISTANCE_KM = 384400; // Earth–Moon
const SUN_DISTANCE_KM = 149600000; // 1 AU

export function getCosmicDistance(birthDate, now = new Date()) {
  const seconds = getTotals(birthDate, now).seconds;
  const aroundSun = ORBITAL_SPEED_KMS * seconds; // km
  const throughGalaxy = GALACTIC_SPEED_KMS * seconds; // km
  return {
    aroundSunKm: aroundSun,
    throughGalaxyKm: throughGalaxy,
    moonTrips: aroundSun / (MOON_DISTANCE_KM * 2), // round trips to the Moon
    sunDistances: throughGalaxy / SUN_DISTANCE_KM, // in Earth–Sun distances
  };
}

/* ------------------------------------------------------------------ */
/* Weekly body rhythms (population averages)                           */
/* ------------------------------------------------------------------ */
export function getWeeklyRhythms() {
  const perWeek = 60 * 24 * 7;
  return {
    heartbeats: Math.round(72 * perWeek),      // ~72 bpm
    breaths: Math.round(16 * perWeek),         // ~16 / min
    blinks: Math.round(15 * 60 * 16 * 7),      // ~15 / min, ~16 waking hours
    sleepHours: 8 * 7,                         // ~8 h / night
  };
}

/* ------------------------------------------------------------------ */
/* Life in weeks                                                       */
/* ------------------------------------------------------------------ */
export function getLifeWeeks(birthDate, now = new Date(), lifeYears = 90) {
  const days = getTotals(birthDate, now).days;
  const weeksLived = Math.floor(days / 7);
  const weeksPerYear = 52;
  const totalWeeks = lifeYears * weeksPerYear;
  return {
    weeksLived: Math.min(weeksLived, totalWeeks),
    totalWeeks,
    weeksPerYear,
    lifeYears,
  };
}

/* ------------------------------------------------------------------ */
/* Number abbreviation for very large values                           */
/* ------------------------------------------------------------------ */
export function abbreviate(n) {
  const abs = Math.abs(n);
  if (abs >= 1e12) return `${(n / 1e12).toFixed(1)} trillion`;
  if (abs >= 1e9) return `${(n / 1e9).toFixed(1)} billion`;
  if (abs >= 1e6) return `${(n / 1e6).toFixed(1)} million`;
  return Math.round(n).toLocaleString('en-US');
}
