import { Mandal } from "./types";
import { MANDALS, haversine } from "./mandals";
import { getWalkingMatrix } from "./osrm";

export interface RouteStop {
  mandal: Mandal;
  walkMinutesToNext: number; // walking time to this stop (or next)
  queueMinutes: number;      // from crowd state
  totalTimeAtStop: number;   // queue + darshan (~10 min darshan)
  distanceMeters: number;
}

export interface BuiltRouteResult {
  stops: RouteStop[];
  totalTimeMinutes: number;
  totalDistanceKm: number;
  totalWalkMinutes: number;
  totalQueueMinutes: number;
  budgetMinutes: number;
  originName: string;
}

export interface BuildRouteParams {
  budgetMinutes: number;
  preferences: string[];
  transport: "walk" | "metro" | "two-wheeler";
  startLocation?: { lat: number; lng: number };
  crowdStates?: Record<string, { status: string; waitMinutes?: number }>;
  dwellStyle?: "full" | "mixed" | "quick"; // 10m vs 5m vs 2m
}

const PUNE_CENTRE = { lat: 18.5204, lng: 73.8567 };

// Build an optimized darshan route based on time budget and preferences
export async function buildRoute(params: BuildRouteParams): Promise<BuiltRouteResult> {
  const {
    budgetMinutes = 120,
    preferences = ["manache"],
    transport = "walk",
    startLocation,
    crowdStates = {},
    dwellStyle = "full",
  } = params;

  const origin = startLocation || PUNE_CENTRE;
  const originName = startLocation ? "Your location" : "Pune city centre";

  // Transit speed multiplier
  const transitMultiplier =
    transport === "two-wheeler" ? 0.45 : transport === "metro" ? 0.7 : 1.0;

  // Base darshan dwell time per stop
  const baseDarshanMinutes =
    dwellStyle === "quick" ? 2 : dwellStyle === "mixed" ? 5 : 10;

  // 1. Filter candidates by user preferences
  let candidates: Mandal[] = [];

  const hasPref = (key: string) => preferences.includes(key);

  if (hasPref("surprise") || preferences.length === 0) {
    candidates = [...MANDALS];
  } else {
    const candidateSet = new Set<Mandal>();

    if (hasPref("manache")) {
      MANDALS.filter((m) => m.categories.includes("manache")).forEach((m) =>
        candidateSet.add(m)
      );
    }
    if (hasPref("dagdusheth")) {
      const dag = MANDALS.find((m) => m.id === "dagdusheth-halwai-ganpati");
      if (dag) candidateSet.add(dag);
    }
    if (hasPref("famous")) {
      MANDALS.filter((m) => m.categories.includes("famous")).forEach((m) =>
        candidateSet.add(m)
      );
    }
    if (hasPref("dekhava")) {
      MANDALS.filter(
        (m) =>
          m.area === "Sadashiv Peth" ||
          m.area === "Budhwar Peth" ||
          m.id === "natu-baug-mandal" ||
          m.id === "tulshibaug-ganpati"
      ).forEach((m) => candidateSet.add(m));
    }
    if (hasPref("historic")) {
      MANDALS.filter((m) => m.categories.includes("historic")).forEach((m) =>
        candidateSet.add(m)
      );
    }
    if (hasPref("calm")) {
      MANDALS.filter(
        (m) =>
          m.categories.includes("temple") ||
          m.categories.includes("neighbourhood")
      ).forEach((m) => candidateSet.add(m));
    }

    candidates = Array.from(candidateSet);
    if (candidates.length === 0) {
      candidates = MANDALS.filter((m) => m.categories.includes("manache"));
    }
  }

  // Ensure Dagdusheth and Kasba are candidate options if preferred
  if (candidates.length < 3) {
    candidates = MANDALS.slice(0, 8);
  }

  // 2. Fetch or compute distance matrix (filter out any candidate without coordinates)
  candidates = candidates.filter((m) => m.lat !== null && m.lng !== null);
  const points = [origin, ...candidates.map((m) => ({ lat: m.lat as number, lng: m.lng as number }))];
  const matrixSeconds = await getWalkingMatrix(points);

  // 3. Greedy TSP solver with budget limit
  const visitedIndices = new Set<number>();
  let currentIdx = 0; // index 0 is origin
  let accumulatedMinutes = 0;
  let totalWalkMinutes = 0;
  let totalQueueMinutes = 0;
  let totalDistanceMeters = 0;

  const stops: RouteStop[] = [];

  while (visitedIndices.size < candidates.length) {
    let bestCandidateIdx = -1;
    let minTravelSec = Infinity;

    for (let i = 1; i <= candidates.length; i++) {
      if (!visitedIndices.has(i)) {
        const sec =
          matrixSeconds[currentIdx] && matrixSeconds[currentIdx][i] !== undefined
            ? matrixSeconds[currentIdx][i]
            : Math.round(haversine(points[currentIdx], points[i]) / 1.2);

        if (sec < minTravelSec) {
          minTravelSec = sec;
          bestCandidateIdx = i;
        }
      }
    }

    if (bestCandidateIdx === -1) break;

    const chosenMandal = candidates[bestCandidateIdx - 1];
    const walkMins = Math.max(
      1,
      Math.round((minTravelSec * transitMultiplier) / 60)
    );
    const distMeters = haversine(points[currentIdx], points[bestCandidateIdx]);

    // Estimated queue wait
    const crowd = crowdStates[chosenMandal.id];
    let queueMins = 5;
    if (crowd?.waitMinutes) {
      queueMins = crowd.waitMinutes;
    } else if (crowd?.status === "heavy") {
      queueMins = 35;
    } else if (crowd?.status === "moving") {
      queueMins = 15;
    } else if (chosenMandal.id.includes("dagdusheth")) {
      queueMins = 25;
    }

    const stopTime = queueMins + baseDarshanMinutes;
    const additionalTime = walkMins + stopTime;

    // Check budget (allow at least 2 stops even if budget is tight)
    if (
      stops.length >= 2 &&
      accumulatedMinutes + additionalTime > budgetMinutes + 15
    ) {
      break;
    }

    accumulatedMinutes += additionalTime;
    totalWalkMinutes += walkMins;
    totalQueueMinutes += queueMins;
    totalDistanceMeters += distMeters;

    stops.push({
      mandal: chosenMandal,
      walkMinutesToNext: walkMins,
      queueMinutes: queueMins,
      totalTimeAtStop: stopTime,
      distanceMeters: Math.round(distMeters),
    });

    visitedIndices.add(bestCandidateIdx);
    currentIdx = bestCandidateIdx;

    if (accumulatedMinutes >= budgetMinutes) {
      break;
    }
  }

  return {
    stops,
    totalTimeMinutes: Math.round(accumulatedMinutes),
    totalDistanceKm: Number((totalDistanceMeters / 1000).toFixed(1)),
    totalWalkMinutes,
    totalQueueMinutes,
    budgetMinutes,
    originName,
  };
}

// Build Google Maps navigation URL for stops (respecting max 10 waypoints limit)
export function buildGoogleMapsURL(
  userLocation: { lat: number; lng: number } | null,
  stops: RouteStop[]
): string {
  const validStops = stops.filter((s) => s.mandal.lat !== null && s.mandal.lng !== null);
  if (validStops.length === 0) return "https://www.google.com/maps";

  const url = new URL("https://www.google.com/maps/dir/");
  url.searchParams.set("api", "1");

  // Origin
  if (userLocation) {
    url.searchParams.set("origin", `${userLocation.lat},${userLocation.lng}`);
  } else {
    const first = validStops[0].mandal;
    url.searchParams.set("origin", `${first.lat},${first.lng}`);
  }

  // Destination = last stop
  const last = validStops[validStops.length - 1].mandal;
  url.searchParams.set("destination", `${last.lat},${last.lng}`);
  if (last.googlePlaceId) {
    url.searchParams.set("destination_place_id", last.googlePlaceId);
  }

  // Waypoints = middle stops (Google Maps caps at 10)
  const hasUserLoc = Boolean(userLocation);
  const middleStops = hasUserLoc ? validStops.slice(0, -1) : validStops.slice(1, -1);
  const waypoints = middleStops.slice(0, 9);

  if (waypoints.length > 0) {
    url.searchParams.set(
      "waypoints",
      waypoints.map((s) => `${s.mandal.lat},${s.mandal.lng}`).join("|")
    );
  }

  url.searchParams.set("travelmode", "walking");
  return url.toString();
}

// Split into legs if > 10 stops
export function splitIntoLegs(
  stops: RouteStop[],
  hasUserLoc: boolean
): RouteStop[][] {
  const maxPerLeg = hasUserLoc ? 10 : 11;
  if (stops.length <= maxPerLeg) return [stops];

  const legs: RouteStop[][] = [];
  let i = 0;
  while (i < stops.length && legs.length < 5) {
    legs.push(stops.slice(i, i + maxPerLeg));
    i += maxPerLeg - 1; // overlap by 1 stop
  }
  return legs;
}
