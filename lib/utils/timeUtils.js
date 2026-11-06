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

export function formatDateDMY(dateStr) {
  if (!dateStr) return "";
  try {
    const parts = String(dateStr).trim().split("-");
    if (parts.length === 3) {
      const year = parts[0];
      const monthIdx = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      if (monthIdx >= 0 && monthIdx < 12 && !isNaN(day)) {
        return `${day} ${months[monthIdx]} ${year}`;
      }
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const day = d.getDate();
      const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
    }
  } catch (_) {}
  return dateStr;
}
