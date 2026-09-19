import { Mandal } from "./types";
import { haversine } from "./mandals";

export interface MetroStation {
  id: string;
  name: string;
  nameMarathi: string;
  line: "Aqua" | "Purple";
  lat: number;
  lng: number;
  area: string;
  nearbyMandals: string[];
}

export interface MetroTransitPlan {
  isDirectWalk: boolean;
  startStation: MetroStation;
  destStation: MetroStation;
  requiresInterchange: boolean;
  interchangeStation?: MetroStation;
  walkToStartMeters: number;
  walkToStartMinutes: number;
  metroRideMinutes: number;
  walkFromDestMeters: number;
  walkFromDestMinutes: number;
  totalTransitMinutes: number;
  steps: {
    icon: string;
    title: string;
    description: string;
    durationMinutes: number;
  }[];
}

// Verified Pune Metro Station Network
export const PUNE_METRO_STATIONS: MetroStation[] = [
  // Purple Line Core Peth & Corridor Stations
  {
    id: "civil-court",
    name: "Civil Court Interchange",
    nameMarathi: "दिवाणी न्यायालय मेट्रो स्टेशन",
    line: "Purple",
    lat: 18.5194,
    lng: 73.8553,
    area: "Shivajinagar / Kasba",
    nearbyMandals: ["kasba-ganpati", "dagdusheth-halwai-ganpati", "bhau-rangari-ganpati"],
  },
  {
    id: "budhwar-peth",
    name: "Budhwar Peth Metro Station",
    nameMarathi: "बुधवार पेठ मेट्रो स्टेशन",
    line: "Purple",
    lat: 18.5142,
    lng: 73.8481,
    area: "Budhwar Peth",
    nearbyMandals: ["kesariwada-ganpati", "tambdi-jogeshwari", "guruji-talim"],
  },
  {
    id: "mandai",
    name: "Mandai Metro Station",
    nameMarathi: "मंडई मेट्रो स्टेशन",
    line: "Purple",
    lat: 18.5156,
    lng: 73.8569,
    area: "Shukrawar Peth / Mandai",
    nearbyMandals: ["akhil-mandai-mandal", "tulshibaug-ganpati", "hutatma-babu-genu-mandal"],
  },
  {
    id: "swargate",
    name: "Swargate Metro Terminal",
    nameMarathi: "स्वारगेट मेट्रो स्टेशन",
    line: "Purple",
    lat: 18.5015,
    lng: 73.8618,
    area: "Swargate",
    nearbyMandals: ["sarasbaug-ganpati", "chhatrapati-rajaram-mandal", "shanipar-mandal"],
  },
  {
    id: "shivajinagar",
    name: "Shivajinagar Metro Station",
    nameMarathi: "शिवाजीनगर मेट्रो स्टेशन",
    line: "Purple",
    lat: 18.5314,
    lng: 73.8505,
    area: "Shivajinagar",
    nearbyMandals: [],
  },
  {
    id: "pcmc",
    name: "PCMC Metro Station",
    nameMarathi: "पिंपरी चिंचवड मेट्रो स्टेशन",
    line: "Purple",
    lat: 18.6284,
    lng: 73.8055,
    area: "Pimpri",
    nearbyMandals: [],
  },
  // Aqua Line Stations
  {
    id: "pmc",
    name: "PMC Metro Station",
    nameMarathi: "महानगरपालिका मेट्रो स्टेशन",
    line: "Aqua",
    lat: 18.5218,
    lng: 73.8532,
    area: "Shivajinagar / Shaniwar Wada Bridge",
    nearbyMandals: ["kasba-ganpati", "bhau-rangari-ganpati"],
  },
  {
    id: "deccan",
    name: "Deccan Gymkhana Metro Station",
    nameMarathi: "डेक्कन जिमखाना मेट्रो स्टेशन",
    line: "Aqua",
    lat: 18.5175,
    lng: 73.8428,
    area: "Deccan Gymkhana",
    nearbyMandals: ["sadashiv-peth-mandal"],
  },
  {
    id: "pune-station",
    name: "Pune Railway Station Metro",
    nameMarathi: "पुणे रेल्वे स्टेशन मेट्रो",
    line: "Aqua",
    lat: 18.5284,
    lng: 73.8742,
    area: "Pune Station",
    nearbyMandals: [],
  },
  {
    id: "vanaz",
    name: "Vanaz Metro Station",
    nameMarathi: "वनाज मेट्रो स्टेशन",
    line: "Aqua",
    lat: 18.5072,
    lng: 73.7938,
    area: "Kothrud",
    nearbyMandals: [],
  },
  {
    id: "ramwadi",
    name: "Ramwadi Metro Station",
    nameMarathi: "रामवाडी मेट्रो स्टेशन",
    line: "Aqua",
    lat: 18.5532,
    lng: 73.9135,
    area: "Nagar Road / Ramwadi",
    nearbyMandals: [],
  },
];

export function getNearestMetroStation(point: { lat: number; lng: number }): {
  station: MetroStation;
  distanceM: number;
} {
  let nearest = PUNE_METRO_STATIONS[0];
  let minDistance = Infinity;

  for (const station of PUNE_METRO_STATIONS) {
    const dist = haversine(point, { lat: station.lat, lng: station.lng });
    if (dist < minDistance) {
      minDistance = dist;
      nearest = station;
    }
  }

  return { station: nearest, distanceM: Math.round(minDistance) };
}

/**
 * Computes an end-to-end Metro Transit Journey:
 * USER CURRENT LOCATION -> NEAREST START METRO STATION -> METRO JOURNEY -> APPROPRIATE DESTINATION METRO STATION -> WALKING ROUTE -> GANPATI MANDAL
 */
export function getMetroTransitPlan(
  origin: { lat: number; lng: number },
  destinationMandal: Mandal
): MetroTransitPlan {
  const destCoords =
    destinationMandal.lat !== null && destinationMandal.lng !== null
      ? { lat: destinationMandal.lat, lng: destinationMandal.lng }
      : origin;
  const startMetro = getNearestMetroStation(origin);
  const destMetro = getNearestMetroStation(destCoords);

  const directWalkMeters = haversine(origin, destCoords);

  const isSameStation = startMetro.station.id === destMetro.station.id;
  const isDirectWalk = isSameStation && directWalkMeters < 800;

  const walkToStartM = startMetro.distanceM;
  const walkToStartMinutes = Math.max(1, Math.round(walkToStartM / 1.2 / 60));

  const walkFromDestM = destMetro.distanceM;
  const walkFromDestMinutes = Math.max(1, Math.round(walkFromDestM / 1.2 / 60));

  const requiresInterchange =
    !isSameStation && startMetro.station.line !== destMetro.station.line;

  const stationHopDistanceM = haversine(
    { lat: startMetro.station.lat, lng: startMetro.station.lng },
    { lat: destMetro.station.lat, lng: destMetro.station.lng }
  );

  // Train travel time: ~2.5 min per km on metro + 3 min dwell/wait
  const metroRideMinutes = isSameStation
    ? 0
    : Math.max(4, Math.round((stationHopDistanceM / 1000) * 2.5 + (requiresInterchange ? 5 : 2)));

  const totalTransitMinutes = isDirectWalk
    ? Math.max(1, Math.round(directWalkMeters / 1.2 / 60))
    : walkToStartMinutes + metroRideMinutes + walkFromDestMinutes;

  const steps = [];

  if (isDirectWalk) {
    steps.push({
      icon: "🚶",
      title: "Direct Walk to Mandal",
      description: `Walk ~${Math.round(directWalkMeters)}m directly to ${destinationMandal.name}.`,
      durationMinutes: totalTransitMinutes,
    });
  } else {
    // Step 1: Origin to Start Metro
    steps.push({
      icon: "🚶",
      title: `Walk to ${startMetro.station.name}`,
      description: `Walk ~${walkToStartM}m (${startMetro.station.area}) from your current location.`,
      durationMinutes: walkToStartMinutes,
    });

    // Step 2: Metro Ride
    const lineDesc = requiresInterchange
      ? `Board ${startMetro.station.line} Line to Civil Court Interchange, then transfer to ${destMetro.station.line} Line towards ${destMetro.station.name}.`
      : `Board Pune Metro ${startMetro.station.line} Line to ${destMetro.station.name}.`;

    steps.push({
      icon: "🚇",
      title: `Metro Ride to ${destMetro.station.name}`,
      description: lineDesc,
      durationMinutes: metroRideMinutes,
    });

    // Step 3: Destination Metro to Mandal
    steps.push({
      icon: "🚶",
      title: `Walk to ${destinationMandal.name}`,
      description: `Exit at ${destMetro.station.name} and walk ~${walkFromDestM}m into ${destinationMandal.area}.`,
      durationMinutes: walkFromDestMinutes,
    });
  }

  return {
    isDirectWalk,
    startStation: startMetro.station,
    destStation: destMetro.station,
    requiresInterchange,
    interchangeStation: requiresInterchange
      ? PUNE_METRO_STATIONS.find((s) => s.id === "civil-court")
      : undefined,
    walkToStartMeters: walkToStartM,
    walkToStartMinutes,
    metroRideMinutes,
    walkFromDestMeters: walkFromDestM,
    walkFromDestMinutes,
    totalTransitMinutes,
    steps,
  };
}
