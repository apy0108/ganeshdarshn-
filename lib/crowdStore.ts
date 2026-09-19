import { db, isConfigured } from "./firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { CrowdStatus, LiveCrowd } from "./types";
import { MANDALS, getMandalById, haversine } from "./mandals";

export const CROWD_REPORT_TTL_MS = 90 * 60 * 1000; // 90 minutes
export const COOLDOWN_MS = 60 * 60 * 1000; // 60 minutes
export const MAX_REPORT_DISTANCE_METRES = 1000; // 1 km
export const MAX_GPS_ACCURACY_METRES = 200; // GPS accuracy threshold

export interface StoredCrowdReport {
  mandalId: string;
  status: CrowdStatus;
  deviceId: string;
  requestId: string;
  minutes?: number;
  timestamp: number; // epoch ms
  expiresAt: number; // epoch ms
  verifiedLocation: boolean;
}

export interface MandalCrowdState {
  mandalId: string;
  status: CrowdStatus;
  waitMinutes?: number;
  lastReportAt: number;
  reportCount: number;
  isEstimated: boolean;
}

// In-memory cache (acts as local offline fallback or fast cache in development)
const inMemoryReports: StoredCrowdReport[] = [];
const inMemoryState: Record<string, MandalCrowdState> = {};
const usedRequestIds = new Set<string>();

/**
 * Server-side 1 km distance & accuracy validation.
 * Privacy: Verifies devotee is within 1 km without permanently persisting user's raw lat/lng.
 */
export function validateReportLocation(
  coords: { lat?: number; lng?: number; accuracyM?: number } | undefined,
  mandalId: string
): { valid: boolean; reason?: string; distanceM?: number } {
  if (!coords || typeof coords.lat !== "number" || typeof coords.lng !== "number") {
    return {
      valid: false,
      reason: "Location coordinates are required to submit a report.",
    };
  }

  const mandal = getMandalById(mandalId);
  if (!mandal) {
    return { valid: false, reason: "Mandal not found." };
  }

  if (mandal.lat === null || mandal.lng === null) {
    return {
      valid: false,
      reason: "Location coordinates for this mandal are not currently available.",
    };
  }

  // Check GPS accuracy if provided
  const accuracy = coords.accuracyM ?? 50;
  if (accuracy > MAX_GPS_ACCURACY_METRES) {
    return {
      valid: false,
      reason: "GPS location accuracy is too low (>200m). Please wait for a better GPS fix.",
    };
  }

  const distanceM = haversine(
    { lat: coords.lat, lng: coords.lng },
    { lat: mandal.lat, lng: mandal.lng }
  );

  if (distanceM > MAX_REPORT_DISTANCE_METRES) {
    return {
      valid: false,
      reason: `You are ${(distanceM / 1000).toFixed(1)} km away. Reports are only accepted within 1 km of the mandal.`,
      distanceM: Math.round(distanceM),
    };
  }

  return { valid: true, distanceM: Math.round(distanceM) };
}

// Helper to compute median wait time
function calculateMedian(values: number[]): number | undefined {
  if (values.length === 0) return undefined;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

// Check cooldown for a specific device and mandal
export async function getDeviceCooldown(
  deviceId: string,
  mandalId: string
): Promise<{ onCooldown: boolean; secondsRemaining: number }> {
  const now = Date.now();

  // 1. Check Firestore if configured
  if (isConfigured && db) {
    try {
      const q = query(
        collection(db, "crowd_reports"),
        where("deviceId", "==", deviceId),
        where("mandalId", "==", mandalId)
      );
      const snapshot = await getDocs(q);
      let latestTimestamp = 0;
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const ts =
          data.timestamp && typeof data.timestamp.toMillis === "function"
            ? data.timestamp.toMillis()
            : typeof data.timestamp === "number"
            ? data.timestamp
            : 0;
        if (ts > latestTimestamp) latestTimestamp = ts;
      });

      if (latestTimestamp && now - latestTimestamp < COOLDOWN_MS) {
        const secondsRemaining = Math.ceil((COOLDOWN_MS - (now - latestTimestamp)) / 1000);
        return { onCooldown: true, secondsRemaining };
      }
    } catch (e) {
      console.warn("Firestore cooldown check error, checking memory:", e);
    }
  }

  // 2. Memory check fallback
  const recent = inMemoryReports.filter(
    (r) => r.deviceId === deviceId && r.mandalId === mandalId && now - r.timestamp < COOLDOWN_MS
  );

  if (recent.length > 0) {
    const latest = Math.max(...recent.map((r) => r.timestamp));
    const secondsRemaining = Math.ceil((COOLDOWN_MS - (now - latest)) / 1000);
    return { onCooldown: true, secondsRemaining };
  }

  return { onCooldown: false, secondsRemaining: 0 };
}

// Get all active cooldowns for a device
export async function getAllDeviceCooldowns(
  deviceId: string
): Promise<Record<string, number>> {
  const now = Date.now();
  const cooldowns: Record<string, number> = {};

  if (isConfigured && db) {
    try {
      const q = query(
        collection(db, "crowd_reports"),
        where("deviceId", "==", deviceId)
      );
      const snapshot = await getDocs(q);
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const ts =
          data.timestamp && typeof data.timestamp.toMillis === "function"
            ? data.timestamp.toMillis()
            : typeof data.timestamp === "number"
            ? data.timestamp
            : 0;
        if (ts && now - ts < COOLDOWN_MS) {
          const remaining = Math.ceil((COOLDOWN_MS - (now - ts)) / 1000);
          if (!cooldowns[data.mandalId] || remaining > cooldowns[data.mandalId]) {
            cooldowns[data.mandalId] = remaining;
          }
        }
      });
      return cooldowns;
    } catch (e) {
      console.warn("Firestore getAllDeviceCooldowns error:", e);
    }
  }

  const userReports = inMemoryReports.filter(
    (r) => r.deviceId === deviceId && now - r.timestamp < COOLDOWN_MS
  );

  userReports.forEach((r) => {
    const remaining = Math.ceil((COOLDOWN_MS - (now - r.timestamp)) / 1000);
    if (!cooldowns[r.mandalId] || remaining > cooldowns[r.mandalId]) {
      cooldowns[r.mandalId] = remaining;
    }
  });

  return cooldowns;
}

// Submit a crowd status report (Short / Moving / Heavy)
export async function addCrowdReport(report: {
  mandalId: string;
  status: CrowdStatus;
  deviceId: string;
  requestId: string;
  coords?: { lat?: number; lng?: number; accuracyM?: number };
}): Promise<{
  success: boolean;
  reason?: string;
  retryAfter?: number;
  crowd?: MandalCrowdState;
}> {
  const { mandalId, status, deviceId, requestId, coords } = report;

  if (!deviceId || deviceId.trim() === "") {
    return { success: false, reason: "invalid_device_id" };
  }

  if (!["short", "moving", "heavy"].includes(status)) {
    return { success: false, reason: "invalid_status" };
  }

  // 1. Server-side 1 km validation
  const locationValidation = validateReportLocation(coords, mandalId);
  if (!locationValidation.valid) {
    return { success: false, reason: locationValidation.reason };
  }

  // 2. Deduplication check
  if (usedRequestIds.has(requestId)) {
    const current = await getMandalCrowdState(mandalId);
    return { success: true, crowd: current };
  }

  // 3. Cooldown check (60 mins)
  const cooldown = await getDeviceCooldown(deviceId, mandalId);
  if (cooldown.onCooldown) {
    return {
      success: false,
      reason: "cooldown",
      retryAfter: cooldown.secondsRemaining,
    };
  }

  const now = Date.now();
  const storedReport: StoredCrowdReport = {
    mandalId,
    status,
    deviceId,
    requestId,
    verifiedLocation: true,
    timestamp: now,
    expiresAt: now + CROWD_REPORT_TTL_MS,
  };

  usedRequestIds.add(requestId);
  inMemoryReports.push(storedReport);

  // 4. Persist report directly to Firestore
  if (isConfigured && db) {
    try {
      await setDoc(doc(db, "crowd_reports", requestId), {
        mandalId,
        status,
        deviceId,
        requestId,
        verifiedLocation: true,
        timestamp: Timestamp.fromMillis(now),
        expiresAt: Timestamp.fromMillis(storedReport.expiresAt),
      });
    } catch (e) {
      console.warn("Firestore write error for crowd report:", e);
    }
  }

  // 5. Authoritative recalculation
  const newState = await recalculateMandalState(mandalId);
  return { success: true, crowd: newState };
}

// Submit a wait-time report (5, 10, 15, 20, 30, 45, 60, 90 mins)
export async function addWaitTimeReport(report: {
  mandalId: string;
  minutes: number;
  deviceId: string;
  requestId: string;
  coords?: { lat?: number; lng?: number; accuracyM?: number };
}): Promise<{ success: boolean; waitMinutes?: number; reason?: string }> {
  const { mandalId, minutes, deviceId, requestId, coords } = report;
  const validMinutes = [5, 10, 15, 20, 30, 45, 60, 90];

  if (!validMinutes.includes(minutes)) {
    return { success: false, reason: "invalid_minutes" };
  }

  // 1. Server-side 1 km validation
  const locationValidation = validateReportLocation(coords, mandalId);
  if (!locationValidation.valid) {
    return { success: false, reason: locationValidation.reason };
  }

  if (usedRequestIds.has(requestId)) {
    const current = await getMandalCrowdState(mandalId);
    return { success: true, waitMinutes: current.waitMinutes };
  }

  const now = Date.now();
  const status: CrowdStatus = minutes <= 15 ? "short" : minutes <= 40 ? "moving" : "heavy";

  const storedReport: StoredCrowdReport = {
    mandalId,
    status,
    deviceId,
    requestId,
    minutes,
    verifiedLocation: true,
    timestamp: now,
    expiresAt: now + CROWD_REPORT_TTL_MS,
  };

  usedRequestIds.add(requestId);
  inMemoryReports.push(storedReport);

  // 2. Persist wait-time report directly to Firestore
  if (isConfigured && db) {
    try {
      await setDoc(doc(db, "crowd_reports", requestId), {
        mandalId,
        status,
        minutes,
        deviceId,
        requestId,
        verifiedLocation: true,
        timestamp: Timestamp.fromMillis(now),
        expiresAt: Timestamp.fromMillis(storedReport.expiresAt),
      });
    } catch (e) {
      console.warn("Firestore write error for wait-time report:", e);
    }
  }

  // 3. Authoritative recalculation
  const updatedState = await recalculateMandalState(mandalId);
  return { success: true, waitMinutes: updatedState.waitMinutes };
}

// Recalculate crowd_state for a mandal based on non-expired reports (<90 min)
export async function recalculateMandalState(mandalId: string): Promise<MandalCrowdState> {
  const now = Date.now();
  let activeReports: StoredCrowdReport[] = [];

  // 1. Fetch active reports from Firestore if configured
  if (isConfigured && db) {
    try {
      const q = query(
        collection(db, "crowd_reports"),
        where("mandalId", "==", mandalId)
      );
      const snapshot = await getDocs(q);
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const exp =
          data.expiresAt && typeof data.expiresAt.toMillis === "function"
            ? data.expiresAt.toMillis()
            : typeof data.expiresAt === "number"
            ? data.expiresAt
            : 0;

        const ts =
          data.timestamp && typeof data.timestamp.toMillis === "function"
            ? data.timestamp.toMillis()
            : typeof data.timestamp === "number"
            ? data.timestamp
            : 0;

        if (exp > now && ["short", "moving", "heavy"].includes(data.status)) {
          activeReports.push({
            mandalId,
            status: data.status as CrowdStatus,
            deviceId: data.deviceId || "",
            requestId: data.requestId || docSnap.id,
            minutes: typeof data.minutes === "number" ? data.minutes : undefined,
            verifiedLocation: Boolean(data.verifiedLocation),
            timestamp: ts,
            expiresAt: exp,
          });
        }
      });
    } catch (e) {
      console.warn("Firestore fetch error in recalculateMandalState:", e);
    }
  }

  // 2. Include in-memory reports if Firestore returned nothing or is offline
  if (activeReports.length === 0) {
    activeReports = inMemoryReports.filter(
      (r) => r.mandalId === mandalId && r.expiresAt > now
    );
  }

  // 3. If zero active reports exist within 90 minutes -> "none" (No fake data!)
  if (activeReports.length === 0) {
    const fallbackState: MandalCrowdState = {
      mandalId,
      status: "none",
      lastReportAt: 0,
      reportCount: 0,
      isEstimated: false,
    };
    inMemoryState[mandalId] = fallbackState;

    if (isConfigured && db) {
      try {
        await setDoc(doc(db, "crowd_state", mandalId), {
          ...fallbackState,
          lastReportAt: 0,
        });
      } catch (e) {
        console.warn("Firestore state sync error:", e);
      }
    }

    return fallbackState;
  }

  // 4. Deterministic Aggregation
  const counts: Record<CrowdStatus, number> = { short: 0, moving: 0, heavy: 0, none: 0 };
  const waitTimes: number[] = [];
  let latestTs = 0;

  activeReports.forEach((r) => {
    counts[r.status] = (counts[r.status] || 0) + 1;
    if (typeof r.minutes === "number" && r.minutes > 0) {
      waitTimes.push(r.minutes);
    }
    if (r.timestamp > latestTs) latestTs = r.timestamp;
  });

  // Pick dominant status
  let dominantStatus: CrowdStatus = "short";
  let maxCount = -1;
  (["short", "moving", "heavy"] as CrowdStatus[]).forEach((st) => {
    if (counts[st] > maxCount) {
      maxCount = counts[st];
      dominantStatus = st;
    }
  });

  const computedState: MandalCrowdState = {
    mandalId,
    status: dominantStatus,
    waitMinutes: calculateMedian(waitTimes),
    lastReportAt: latestTs,
    reportCount: activeReports.length,
    isEstimated: false,
  };

  inMemoryState[mandalId] = computedState;

  // 5. Persist the aggregated state to Firestore crowd_state/{mandalId}
  if (isConfigured && db) {
    try {
      await setDoc(doc(db, "crowd_state", mandalId), {
        ...computedState,
        lastReportAt: Timestamp.fromMillis(latestTs),
      });
    } catch (e) {
      console.warn("Firestore state sync error:", e);
    }
  }

  return computedState;
}

// Get crowd state for a single mandal
export async function getMandalCrowdState(mandalId: string): Promise<MandalCrowdState> {
  const now = Date.now();

  // Try Firestore first
  if (isConfigured && db) {
    try {
      const docSnap = await getDoc(doc(db, "crowd_state", mandalId));
      if (docSnap.exists()) {
        const data = docSnap.data();
        const lastReportAt =
          data.lastReportAt && typeof data.lastReportAt.toMillis === "function"
            ? data.lastReportAt.toMillis()
            : typeof data.lastReportAt === "number"
            ? data.lastReportAt
            : 0;

        if (lastReportAt > 0 && now - lastReportAt <= CROWD_REPORT_TTL_MS && data.status !== "none") {
          return {
            mandalId,
            status: data.status as CrowdStatus,
            waitMinutes: data.waitMinutes,
            lastReportAt,
            reportCount: data.reportCount || 0,
            isEstimated: Boolean(data.isEstimated),
          };
        }
      }
    } catch (e) {
      console.warn("Firestore getMandalCrowdState error:", e);
    }
  }

  if (inMemoryState[mandalId]) {
    const state = inMemoryState[mandalId];
    if (state.lastReportAt > 0 && now - state.lastReportAt <= CROWD_REPORT_TTL_MS) {
      return state;
    }
  }

  return recalculateMandalState(mandalId);
}

// Get crowd state for ALL mandals
export async function getAllCrowdStates(): Promise<Record<string, MandalCrowdState>> {
  const now = Date.now();
  const result: Record<string, MandalCrowdState> = {};

  // Try fetching all from Firestore crowd_state
  if (isConfigured && db) {
    try {
      const snapshot = await getDocs(collection(db, "crowd_state"));
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const lastReportAt =
          data.lastReportAt && typeof data.lastReportAt.toMillis === "function"
            ? data.lastReportAt.toMillis()
            : typeof data.lastReportAt === "number"
            ? data.lastReportAt
            : 0;

        const isExpired = lastReportAt > 0 && now - lastReportAt > CROWD_REPORT_TTL_MS;

        if (isExpired || data.status === "none" || !data.status) {
          result[docSnap.id] = {
            mandalId: docSnap.id,
            status: "none",
            lastReportAt: 0,
            reportCount: 0,
            isEstimated: false,
          };
        } else {
          result[docSnap.id] = {
            mandalId: docSnap.id,
            status: data.status as CrowdStatus,
            waitMinutes: data.waitMinutes,
            lastReportAt,
            reportCount: data.reportCount || 0,
            isEstimated: Boolean(data.isEstimated),
          };
        }
      });
    } catch (e) {
      console.warn("Firestore getAllCrowdStates error:", e);
    }
  }

  // Ensure all 30 mandals have an entry
  for (const m of MANDALS) {
    if (!result[m.id]) {
      if (inMemoryState[m.id] && now - inMemoryState[m.id].lastReportAt <= CROWD_REPORT_TTL_MS) {
        result[m.id] = inMemoryState[m.id];
      } else {
        result[m.id] = {
          mandalId: m.id,
          status: "none",
          lastReportAt: 0,
          reportCount: 0,
          isEstimated: false,
        };
      }
    }
  }

  return result;
}

export interface StoredDwellSignal {
  mandalId: string;
  dwell: "lingering" | "queueing";
  dwellSeconds: number;
  deviceId: string;
  dedupKey: string;
  timestamp: number;
}

const inMemoryDwellSignals: StoredDwellSignal[] = [];
const processedDwellKeys = new Set<string>();

// Process and store anonymous passive dwell signal
export async function addDwellSignal(signal: {
  mandalId: string;
  dwell: "lingering" | "queueing";
  dwellSeconds: number;
  deviceId: string;
  isFinal?: boolean;
}): Promise<{ success: boolean; state?: MandalCrowdState }> {
  const { mandalId, dwell, dwellSeconds, deviceId } = signal;

  if (!mandalId || !deviceId || !["lingering", "queueing"].includes(dwell)) {
    return { success: false };
  }

  const todayStr = new Date().toISOString().split("T")[0];
  const dedupKey = `${deviceId}_${mandalId}_${todayStr}_${dwell}`;

  if (processedDwellKeys.has(dedupKey) && !signal.isFinal) {
    const current = await getMandalCrowdState(mandalId);
    return { success: true, state: current };
  }

  processedDwellKeys.add(dedupKey);

  const now = Date.now();
  const storedSignal: StoredDwellSignal = {
    mandalId,
    dwell,
    dwellSeconds,
    deviceId,
    dedupKey,
    timestamp: now,
  };

  inMemoryDwellSignals.push(storedSignal);

  // If dwell is 'queueing', convert to an anonymous crowd indicator
  if (dwell === "queueing") {
    const estWait = dwellSeconds > 1800 ? 45 : dwellSeconds > 900 ? 30 : 20;
    const crowdStatus: CrowdStatus = estWait >= 35 ? "heavy" : "moving";

    inMemoryReports.push({
      mandalId,
      status: crowdStatus,
      deviceId: `dwell_${deviceId}`,
      requestId: `dwell_${dedupKey}_${now}`,
      minutes: estWait,
      verifiedLocation: true,
      timestamp: now,
      expiresAt: now + CROWD_REPORT_TTL_MS,
    });
  }

  // Firestore sync if available
  if (isConfigured && db) {
    try {
      await setDoc(doc(db, "dwell_signals", dedupKey), {
        ...storedSignal,
        timestamp: Timestamp.fromMillis(now),
      });
    } catch (e) {
      console.warn("Firestore dwell write error:", e);
    }
  }

  const updatedState = await recalculateMandalState(mandalId);
  return { success: true, state: updatedState };
}

