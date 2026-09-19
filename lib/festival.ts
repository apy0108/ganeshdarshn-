export interface FestivalDayInfo {
  status: "upcoming" | "active" | "ended";
  dayNumber?: number;
  totalDays: number;
  pill: string;
  banner: string;
  startDateFormatted: string;
  endDateFormatted: string;
}

// Single Source of Truth for Pune Ganeshotsav Festival Configuration (2026)
export const FESTIVAL_CONFIG = {
  year: 2026,
  startMonth: 9, // September (1-indexed)
  startDay: 14,  // 14 September 2026 (Day 1)
  endMonth: 9,   // September (1-indexed)
  endDay: 25,    // 25 September 2026 (Day 12 - Anant Chaturdashi)
  totalDays: 12,
};

/**
 * Authoritative dynamic festival calculation using India/Pune local-date semantics (Asia/Kolkata).
 * Sep 14, 2026 = Day 1
 * Sep 15, 2026 = Day 2
 * ...
 * Sep 19, 2026 = Day 6
 * ...
 * Sep 25, 2026 = Day 12 (Anant Chaturdashi)
 * After Sep 25, 2026 = Festival Concluded
 * Before Sep 14, 2026 = Festival Upcoming
 */
export function getFestivalDayInfo(customDate?: Date): FestivalDayInfo {
  const dateObj = customDate || new Date();

  // Extract date in Asia/Kolkata (IST) timezone
  const istFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });

  const parts = istFormatter.formatToParts(dateObj);
  let year = FESTIVAL_CONFIG.year;
  let month = FESTIVAL_CONFIG.startMonth;
  let day = 19; // Default fallback if parser fails

  parts.forEach((p) => {
    if (p.type === "year") year = parseInt(p.value, 10);
    if (p.type === "month") month = parseInt(p.value, 10);
    if (p.type === "day") day = parseInt(p.value, 10);
  });

  // Calculate day difference for Sep 2026
  if (year < FESTIVAL_CONFIG.year || (year === FESTIVAL_CONFIG.year && month < FESTIVAL_CONFIG.startMonth)) {
    return {
      status: "upcoming",
      totalDays: FESTIVAL_CONFIG.totalDays,
      pill: "Festival Upcoming",
      banner: "Festival begins on Sep 14, 2026",
      startDateFormatted: "Sep 14",
      endDateFormatted: "Sep 25",
    };
  }

  if (year > FESTIVAL_CONFIG.year || (year === FESTIVAL_CONFIG.year && month > FESTIVAL_CONFIG.endMonth)) {
    return {
      status: "ended",
      totalDays: FESTIVAL_CONFIG.totalDays,
      pill: "Festival Concluded",
      banner: "Pune Ganeshotsav has concluded for this year.",
      startDateFormatted: "Sep 14",
      endDateFormatted: "Sep 25",
    };
  }

  // Same year & September
  if (day < FESTIVAL_CONFIG.startDay) {
    const diffDays = FESTIVAL_CONFIG.startDay - day;
    return {
      status: "upcoming",
      totalDays: FESTIVAL_CONFIG.totalDays,
      pill: `Festival in ${diffDays} day${diffDays > 1 ? "s" : ""}`,
      banner: `Festival begins in ${diffDays} day${diffDays > 1 ? "s" : ""} (Sep 14 – 25)`,
      startDateFormatted: "Sep 14",
      endDateFormatted: "Sep 25",
    };
  }

  if (day > FESTIVAL_CONFIG.endDay) {
    return {
      status: "ended",
      totalDays: FESTIVAL_CONFIG.totalDays,
      pill: "Festival Concluded",
      banner: "Pune Ganeshotsav has concluded for this year.",
      startDateFormatted: "Sep 14",
      endDateFormatted: "Sep 25",
    };
  }

  // Active festival day (1 to 12)
  const dayNumber = day - FESTIVAL_CONFIG.startDay + 1;

  return {
    status: "active",
    dayNumber,
    totalDays: FESTIVAL_CONFIG.totalDays,
    pill: `Day ${dayNumber} of ${FESTIVAL_CONFIG.totalDays}`,
    banner: `🪔 Ganeshotsav • Day ${dayNumber} of ${FESTIVAL_CONFIG.totalDays} · Pune Active`,
    startDateFormatted: "Sep 14",
    endDateFormatted: "Sep 25",
  };
}
