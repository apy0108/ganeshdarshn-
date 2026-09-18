const OSRM_BASE = 'https://router.project-osrm.org';

// Haversine fallback if OSRM is unreachable
function haversineDist(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

// Get walking duration matrix between points (in seconds)
export async function getWalkingMatrix(
  points: { lat: number; lng: number }[]
): Promise<number[][]> {
  const n = points.length;
  if (n === 0) return [];
  if (n === 1) return [[0]];

  try {
    const coords = points.map((p) => `${p.lng},${p.lat}`).join(';');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(
      `${OSRM_BASE}/table/v1/foot/${coords}?annotations=duration`,
      { signal: controller.signal }
    );
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data.durations && Array.isArray(data.durations)) {
        return data.durations;
      }
    }
  } catch (err) {
    // Network / timeout fallback to geometric walking estimate (~1.2 m/s walk speed)
  }

  // Fallback matrix
  const matrix: number[][] = [];
  for (let i = 0; i < n; i++) {
    matrix[i] = [];
    for (let j = 0; j < n; j++) {
      if (i === j) {
        matrix[i][j] = 0;
      } else {
        const meters = haversineDist(points[i], points[j]);
        matrix[i][j] = Math.round(meters / 1.2); // ~1.2 m/s (4.3 km/h) walking speed
      }
    }
  }
  return matrix;
}

// Get a specific walking route between two points
export async function getWalkingRoute(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number }
): Promise<{
  durationSeconds: number;
  distanceMetres: number;
  geometry?: any;
}> {
  try {
    const coords = `${from.lng},${from.lat};${to.lng},${to.lat}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(
      `${OSRM_BASE}/route/v1/foot/${coords}?overview=full&geometries=geojson`,
      { signal: controller.signal }
    );
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data.routes && data.routes[0]) {
        return {
          durationSeconds: data.routes[0].duration,
          distanceMetres: data.routes[0].distance,
          geometry: data.routes[0].geometry,
        };
      }
    }
  } catch {}

  // Fallback
  const meters = haversineDist(from, to);
  return {
    durationSeconds: Math.round(meters / 1.2),
    distanceMetres: Math.round(meters),
    geometry: {
      type: "LineString",
      coordinates: [
        [from.lng, from.lat],
        [to.lng, to.lat],
      ],
    },
  };
}
