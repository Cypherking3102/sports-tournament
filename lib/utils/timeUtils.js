/**
 * Time utility functions for schedule parsing and chronological sorting
 */

export function parseTimeToMinutes(t) {
  if (!t) return 0;
  const str = String(t).trim().toUpperCase();
  const isPM = str.includes("PM");
  const isAM = str.includes("AM");
  const clean = str.replace(/[AP]M/, "").trim();
  const parts = clean.split(":");
  let h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  if (isPM && h < 12) h += 12;
  if (isAM && h === 12) h = 0;
  return h * 60 + m;
}

export function compareMatchTimes(aTime, bTime) {
  return parseTimeToMinutes(aTime) - parseTimeToMinutes(bTime);
}

export function formatTimeDisplay(timeStr) {
  if (!timeStr) return "";
  return timeStr.trim();
}
