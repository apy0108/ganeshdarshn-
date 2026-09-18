export interface CuratedRoute {
  id: string;
  name: string;
  description: string;
  tags: string[]; // e.g. ['evening', 'walking', 'famous']
  stopIds: string[]; // mandalId array in visit order
  estimatedMinutes: number; // walking + average queue
  bestTime?: 'morning' | 'evening' | 'night' | 'anytime';
  distanceMetres: number;
}

export const CURATED_ROUTES_DATA: CuratedRoute[] = [
  {
    id: "dagdusheth-and-manache-paach",
    name: "Dagdusheth & the Manache Paach",
    description: "The five Manache Paach in ceremonial order, with Shrimant Dagdusheth Halwai on the way.",
    stopIds: [
      "kasba-ganpati",
      "tambdi-jogeshwari",
      "guruji-talim",
      "dagdusheth-halwai-ganpati",
      "tulshibaug-ganpati",
      "kesariwada-ganpati",
    ],
    estimatedMinutes: 188,
    distanceMetres: 2100,
    bestTime: "anytime",
    tags: ["famous", "manache", "walking"],
  },
  {
    id: "evening-dekhava-trail",
    name: "Evening dekhava trail",
    description: "The mandals whose decorated sets are the point — best after dark.",
    stopIds: [
      "dagdusheth-halwai-ganpati",
      "akhil-mandai-mandal",
      "hutatma-babu-genu-mandal",
      "shanipar-mandal",
      "chhatrapati-rajaram-mandal",
    ],
    estimatedMinutes: 124,
    distanceMetres: 1800,
    bestTime: "evening",
    tags: ["evening", "dekhava", "lighting"],
  },
  {
    id: "peth-express-90",
    name: "90-minute peth express",
    description: "The most ground you can genuinely cover in an hour and a half on foot.",
    stopIds: [
      "kasba-ganpati",
      "tambdi-jogeshwari",
      "guruji-talim",
      "tulshibaug-ganpati",
    ],
    estimatedMinutes: 76,
    distanceMetres: 900,
    bestTime: "morning",
    tags: ["quick", "morning", "walking"],
  },
  {
    id: "historic-peth-stroll",
    name: "Historic peth stroll",
    description: "The oldest sarvajanik mandals, and the wadas and talims they grew out of.",
    stopIds: [
      "kasba-ganpati",
      "bhau-rangari-ganpati",
      "hutatma-babu-genu-mandal",
      "guruji-talim",
      "shanipar-mandal",
    ],
    estimatedMinutes: 108,
    distanceMetres: 1400,
    bestTime: "morning",
    tags: ["historic", "heritage", "walking"],
  },
  {
    id: "two-peths-on-foot",
    name: "Narayan & Budhwar on foot",
    description: "Two neighbouring peths, six mandals, one unhurried walk.",
    stopIds: [
      "kesariwada-ganpati",
      "tambdi-jogeshwari",
      "guruji-talim",
      "tulshibaug-ganpati",
      "hutatma-babu-genu-mandal",
      "bhau-rangari-ganpati",
    ],
    estimatedMinutes: 239,
    distanceMetres: 2800,
    bestTime: "anytime",
    tags: ["walking", "neighbourhood", "extended"],
  },
  {
    id: "mandai-hour",
    name: "One hour from Mandai",
    description: "Four mandals within a short walk of Mandai, in about an hour.",
    stopIds: [
      "akhil-mandai-mandal",
      "hutatma-babu-genu-mandal",
      "tambdi-jogeshwari",
      "dagdusheth-halwai-ganpati",
    ],
    estimatedMinutes: 81,
    distanceMetres: 900,
    bestTime: "anytime",
    tags: ["mandai", "quick", "central"],
  },
];

export function getCuratedRouteById(id: string): CuratedRoute | undefined {
  return CURATED_ROUTES_DATA.find((r) => r.id === id);
}

// Time calculation with live crowd data
export function getRouteTime(
  route: CuratedRoute,
  crowdState: Record<string, any> = {}
): number {
  const DARSHAN_MIN = 10; // base darshan time per mandal
  const queueTotal = route.stopIds.reduce((sum, id) => {
    const crowd = crowdState[id];
    if (!crowd || crowd.status === "none") return sum + 15; // default estimate
    if (crowd.status === "short") return sum + 5;
    if (crowd.status === "moving") return sum + (crowd.waitMinutes ?? 20);
    if (crowd.status === "heavy") return sum + (crowd.waitMinutes ?? 45);
    return sum + 15;
  }, 0);

  const walkBase = route.estimatedMinutes - (route.stopIds.length * 15);
  return walkBase + queueTotal + (route.stopIds.length * DARSHAN_MIN);
}

// Format minutes into clean human string: "X hr Y min" or "X min"
export function formatMinutes(mins: number): string {
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return remainingMins > 0 ? `${hrs} hr ${remainingMins} min` : `${hrs} hr`;
}
