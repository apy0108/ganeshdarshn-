export interface FestivalDayInfo {
  status: "upcoming" | "active" | "ended";
  dayNumber?: number;
  totalDays: number;
  pill: string;
  banner: string;
  startDateFormatted: string;
  endDateFormatted: string;
}

// Single Source of Truth for Pune Ganeshotsav Festival Configuration
export const FESTIVAL_CONFIG = {
  year: 2026,
  startMonth: 8, // September (0-indexed: 8 = Sep)
  startDay: 14,  // 14 September 2026 (Day 1)
  endMonth: 8,   // September (0-indexed: 8 = Sep)
  endDay: 25,    // 25 September 2026 (Day 12 - Anant Chaturdashi)
  totalDays: 12,
};

/**
 * Dynamically computes the festival day status based on current date.
 * Sep 14 = Day 1
 * Sep 15 = Day 2
 * Sep 16 = Day 3
 * Sep 17 = Day 4
 * Sep 18 = Day 5
 * Sep 19 = Day 6
 * ...
 * Sep 25 = Day 12 (Anant Chaturdashi)
 */
export function getFestivalDayInfo(customDate?: Date): FestivalDayInfo {
  const now = customDate || new Date();
  const year = FESTIVAL_CONFIG.year;

  // Start of festival day 1 at 00:00:00 local time
  const festivalStart = new Date(
    year,
    FESTIVAL_CONFIG.startMonth,
    FESTIVAL_CONFIG.startDay,
    0,
    0,
    0
  );

  // End of festival on final day at 23:59:59 local time
  const festivalEnd = new Date(
    year,
    FESTIVAL_CONFIG.endMonth,
    FESTIVAL_CONFIG.endDay,
    23,
    59,
    59
  );

  const startMs = festivalStart.getTime();
  const endMs = festivalEnd.getTime();
  const currentMs = now.getTime();

  if (currentMs < startMs) {
    const diffDays = Math.ceil((startMs - currentMs) / (1000 * 60 * 60 * 24));
    return {
      status: "upcoming",
      totalDays: FESTIVAL_CONFIG.totalDays,
      pill: `Festival in ${diffDays} day${diffDays > 1 ? "s" : ""}`,
      banner: `Festival begins in ${diffDays} day${diffDays > 1 ? "s" : ""} (Sep 14 – 25)`,
      startDateFormatted: "Sep 14",
      endDateFormatted: "Sep 25",
    };
  } else if (currentMs <= endMs) {
    // Exact day index (1-indexed)
    const elapsedDays = Math.floor((currentMs - startMs) / (1000 * 60 * 60 * 24));
    const dayNumber = Math.min(
      FESTIVAL_CONFIG.totalDays,
      Math.max(1, elapsedDays + 1)
    );

    return {
      status: "active",
      dayNumber,
      totalDays: FESTIVAL_CONFIG.totalDays,
      pill: `Day ${dayNumber} of ${FESTIVAL_CONFIG.totalDays}`,
      banner: `🪔 Ganeshotsav • Day ${dayNumber} of ${FESTIVAL_CONFIG.totalDays} · Pune Active`,
      startDateFormatted: "Sep 14",
      endDateFormatted: "Sep 25",
    };
  } else {
    return {
      status: "ended",
      totalDays: FESTIVAL_CONFIG.totalDays,
      pill: "Festival Concluded",
      banner: "Pune Ganeshotsav has concluded for this year.",
      startDateFormatted: "Sep 14",
      endDateFormatted: "Sep 25",
    };
  }
}
