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

export const PUNE_METRO_STATIONS: MetroStation[] = [
  {
    id: "civil-court",
    name: "Civil Court Metro Interchange",
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
];

export function getNearestMetroStation(point: { lat: number; lng: number }): {
  station: MetroStation;
  distanceM: number;
} {
  let nearest = PUNE_METRO_STATIONS[0];
  let minDistance = Infinity;

  for (const station of PUNE_METRO_STATIONS) {
    const dLat = (station.lat - point.lat) * 111000;
    const dLng = (station.lng - point.lng) * 111000 * Math.cos((point.lat * Math.PI) / 180);
    const dist = Math.sqrt(dLat * dLat + dLng * dLng);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = station;
    }
  }

  return { station: nearest, distanceM: Math.round(minDistance) };
}
