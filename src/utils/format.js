// format.js — small display helpers.

/** Thousands-separated integer, e.g. 8937 -> "8,937". */
export function fmt(n) {
  if (n === null || n === undefined || Number.isNaN(n)) return '0';
  return Math.round(n).toLocaleString('en-US');
}

/** Zero-padded two-digit string for clock-style values. */
export function pad2(n) {
  return String(n).padStart(2, '0');
}
