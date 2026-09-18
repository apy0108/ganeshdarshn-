import { haversine } from "./mandals";

export interface GPSState {
  status: "idle" | "loading" | "ready" | "denied" | "error";
  position: { lat: number; lng: number };
  accuracyM: number;
  error?: string;
}

export interface ReportEligibility {
  kind: "allowed" | "refining" | "no_location";
  atMandal: boolean;
  distanceM?: number;
}

export function getReportEligibility(
  gpsState: GPSState,
  mandalLocation: { lat: number; lng: number }
): ReportEligibility {
  if (gpsState.status !== "ready" || !gpsState.position) {
    return { kind: "no_location", atMandal: false };
  }

  const dist = haversine(gpsState.position, mandalLocation);
  const accuracy = gpsState.accuracyM || 50;

  // User is considered "at mandal" if GPS says they're within 200m
  // AND GPS accuracy is good enough (< 100m error)
  const atMandal = dist <= 200 && accuracy <= 100;

  if (accuracy > 200) {
    return { kind: "refining", atMandal: false, distanceM: Math.round(dist) }; // GPS still settling
  }

  return { kind: "allowed", atMandal, distanceM: Math.round(dist) };
}
