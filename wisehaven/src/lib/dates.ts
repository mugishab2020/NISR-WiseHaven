// ============================================================
// WiseHaven — Date & Maturity Utilities
// All timestamps stored as ISO 8601 strings.
// Timezone-aware: uses the browser's local clock for demo.
// ============================================================

/**
 * Returns true if the envelope's maturity date has been reached.
 */
export function isMatured(maturityDateISO: string): boolean {
  return new Date() >= new Date(maturityDateISO);
}

/**
 * Returns true if the envelope matures within the given hours.
 */
export function isUnlockingSoon(
  maturityDateISO: string,
  withinHours = 48
): boolean {
  const now = new Date();
  const maturity = new Date(maturityDateISO);
  const diffMs = maturity.getTime() - now.getTime();
  return diffMs > 0 && diffMs <= withinHours * 60 * 60 * 1000;
}

/**
 * Returns a human-readable countdown string.
 * e.g. "9d 14h 22m" or "18h 12m" or "Matured"
 */
export function formatCountdown(maturityDateISO: string): string {
  const now = new Date();
  const maturity = new Date(maturityDateISO);
  const diffMs = maturity.getTime() - now.getTime();

  if (diffMs <= 0) return "Matured";

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

/**
 * Returns the elapsed fraction (0–1) of the lock period.
 * Uses createdAt as start and maturityDate as end.
 */
export function calcElapsedFraction(
  createdAt: string,
  maturityDateISO: string
): number {
  const start = new Date(createdAt).getTime();
  const end = new Date(maturityDateISO).getTime();
  const now = Date.now();

  if (end <= start) return 1;
  const fraction = (now - start) / (end - start);
  return Math.min(1, Math.max(0, fraction));
}

/**
 * Formats an ISO date string for display.
 * e.g. "2026-10-25T09:00:00.000Z" → "25 Oct 2026"
 */
export function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Africa/Kigali",
  });
}

/**
 * Formats an ISO date string for activity display.
 * e.g. "15 Oct • 09:14 CAT"
 */
export function formatActivityDate(isoString: string): string {
  const d = new Date(isoString);
  const date = d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    timeZone: "Africa/Kigali",
  });
  const time = d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Kigali",
    hour12: false,
  });
  return `${date} • ${time} CAT`;
}

/**
 * Formats a date as short day + month for timeline items.
 * e.g. "25 OCT"
 */
export function formatTimelineDate(isoString: string): {
  day: string;
  month: string;
} {
  const d = new Date(isoString);
  return {
    day: d.toLocaleDateString("en-GB", {
      day: "2-digit",
      timeZone: "Africa/Kigali",
    }),
    month: d
      .toLocaleDateString("en-GB", {
        month: "short",
        timeZone: "Africa/Kigali",
      })
      .toUpperCase(),
  };
}

/**
 * Returns today's date as an ISO date string (YYYY-MM-DD) in CAT.
 */
export function todayCAT(): string {
  const now = new Date();
  // Africa/Kigali is UTC+2
  const cat = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  return cat.toISOString().slice(0, 10);
}

/**
 * Returns a datetime-local input value (YYYY-MM-DDTHH:mm) for
 * a date N days from now, at a given hour in local time.
 */
export function futureDatetimeLocal(daysFromNow: number, hour = 9): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, 0, 0, 0);
  // Format as YYYY-MM-DDTHH:mm
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
