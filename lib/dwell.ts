import { Mandal } from "./types";
import { MANDALS, haversine } from "./mandals";

export interface DwellZone {
  mandalId: string;
  lat: number;
  lng: number;
  radiusM: number; // 25–75m, based on nearest neighbour
  crossingS: number; // expected time to walk past (seconds)
  lingeringS: number; // crossingS × 1.5 — user is slowing down
  queueingS: number; // crossingS × 4 — user is clearly in queue
}

export type DwellState = "passing" | "lingering" | "queueing";

export function buildDwellZones(mandals: Mandal[] = MANDALS): DwellZone[] {
  const validMandals = mandals.filter((m) => m.lat !== null && m.lng !== null);
  return validMandals.map((mandal) => {
    // Find nearest neighbour distance
    const distances = validMandals
      .filter((m) => m.id !== mandal.id)
      .map((m) =>
        haversine(
          { lat: mandal.lat as number, lng: mandal.lng as number },
          { lat: m.lat as number, lng: m.lng as number }
        )
      );
    const nearest = distances.length > 0 ? Math.min(...distances) : 100;

    // Radius = half distance to nearest, capped 25-75m
    const radius = Math.min(75, Math.max(25, nearest / 2 - 5));

    // Walking speed ~1.2 m/s, add 30% detour factor
    const crossingS = (2 * radius * 1.3) / 1.2;

    return {
      mandalId: mandal.id,
      lat: mandal.lat as number,
      lng: mandal.lng as number,
      radiusM: Math.round(radius),
      crossingS: Math.round(crossingS),
      lingeringS: Math.round(crossingS * 1.5),
      queueingS: Math.round(crossingS * 4),
    };
  });
}

export function classifyDwell(secondsInZone: number, zone: DwellZone): DwellState {
  if (secondsInZone >= zone.queueingS) return "queueing";
  if (secondsInZone >= zone.lingeringS) return "lingering";
  return "passing";
}

// Pre-built static dwell zones for all 30 mandals
export const DWELL_ZONES: DwellZone[] = buildDwellZones(MANDALS);

export function getDwellZoneForMandal(mandalId: string): DwellZone | undefined {
  return DWELL_ZONES.find((z) => z.mandalId === mandalId);
}

// Find which dwell zone a given coordinate is currently in (if any)
export function findCurrentDwellZone(
  pos: { lat: number; lng: number },
  zones: DwellZone[] = DWELL_ZONES
): { zone: DwellZone; distanceM: number } | null {
  for (const zone of zones) {
    const d = haversine(pos, { lat: zone.lat, lng: zone.lng });
    if (d <= zone.radiusM) {
      return { zone, distanceM: Math.round(d) };
    }
  }
  return null;
}
