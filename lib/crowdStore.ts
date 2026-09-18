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
import { MANDALS } from "./mandals";

export interface StoredCrowdReport {
  mandalId: string;
  status: CrowdStatus;
  deviceId: string;
  atMandal: boolean;
  requestId: string;
  minutes?: number;
  timestamp: number; // epoch ms
  expiresAt: number; // epoch ms
}

export interface MandalCrowdState {
  mandalId: string;
  status: CrowdStatus;
  waitMinutes?: number;
  lastReportAt: number;
  reportCount: number;
  isEstimated: boolean;
}

// In-memory store (active in dev/fallback mode or alongside Firestore)
const inMemoryReports: StoredCrowdReport[] = [];
const inMemoryState: Record<string, MandalCrowdState> = {};
const usedRequestIds = new Set<string>();

const COOLDOWN_MS = 60 * 60 * 1000; // 60 minutes
const EXPIRY_MS = 90 * 60 * 1000; // 90 minutes

// Helper to get time of day status estimate
export function getTimeOfDayEstimate(): CrowdStatus {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 9) return "short";
  if (hour >= 9 && hour < 17) return "moving";
  if (hour >= 17 && hour < 23) return "moving";
  return "short";
}

// Helper to compute median
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

  // Try Firestore if available
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
        const ts = data.timestamp instanceof Timestamp ? data.timestamp.toMillis() : data.timestamp;
        if (ts > latestTimestamp) latestTimestamp = ts;
      });

      if (latestTimestamp && now - latestTimestamp < COOLDOWN_MS) {
        const secondsRemaining = Math.ceil((COOLDOWN_MS - (now - latestTimestamp)) / 1000);
        return { onCooldown: true, secondsRemaining };
      }
    } catch (e) {
      console.warn("Firestore cooldown check error, falling back to memory:", e);
    }
  }

  // Memory check
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

// Get all cooldowns for a device
export async function getAllDeviceCooldowns(
  deviceId: string
): Promise<Record<string, number>> {
  const now = Date.now();
  const cooldowns: Record<string, number> = {};

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

// Submit a crowd status report
export async function addCrowdReport(report: {
  mandalId: string;
  status: CrowdStatus;
  deviceId: string;
  atMandal: boolean;
  requestId: string;
}): Promise<{
  success: boolean;
  reason?: string;
  retryAfter?: number;
  crowd?: MandalCrowdState;
}> {
  const { mandalId, status, deviceId, atMandal, requestId } = report;

  if (!deviceId || deviceId.trim() === "") {
    return { success: false, reason: "invalid_device_id" };
  }

  if (!["short", "moving", "heavy"].includes(status)) {
    return { success: false, reason: "invalid_status" };
  }

  // Deduplication check
  if (usedRequestIds.has(requestId)) {
    const current = await getMandalCrowdState(mandalId);
    return { success: true, crowd: current };
  }

  // Cooldown check (60 mins)
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
    atMandal: Boolean(atMandal),
    requestId,
    timestamp: now,
    expiresAt: now + EXPIRY_MS,
  };

  usedRequestIds.add(requestId);
  inMemoryReports.push(storedReport);

  // If Firestore is available, save doc
  if (isConfigured && db) {
    try {
      await setDoc(doc(db, "crowd_reports", requestId), {
        ...storedReport,
        timestamp: Timestamp.fromMillis(now),
        expiresAt: Timestamp.fromMillis(storedReport.expiresAt),
      });
    } catch (e) {
      console.warn("Firestore write error:", e);
    }
  }

  // Recalculate crowd state for this mandal
  const newState = await recalculateMandalState(mandalId);
  return { success: true, crowd: newState };
}

// Submit a wait time report
export async function addWaitTimeReport(report: {
  mandalId: string;
  minutes: number;
  deviceId: string;
  requestId: string;
}): Promise<{ success: boolean; waitMinutes?: number; reason?: string }> {
  const { mandalId, minutes, deviceId, requestId } = report;
  const validMinutes = [5, 10, 15, 20, 30, 45, 60, 90];

  if (!validMinutes.includes(minutes)) {
    return { success: false, reason: "invalid_minutes" };
  }

  if (usedRequestIds.has(requestId)) {
    const current = await getMandalCrowdState(mandalId);
    return { success: true, waitMinutes: current.waitMinutes };
  }

  const now = Date.now();
  const storedReport: StoredCrowdReport = {
    mandalId,
    status: minutes <= 15 ? "short" : minutes <= 40 ? "moving" : "heavy",
    deviceId,
    atMandal: true,
    requestId,
    minutes,
    timestamp: now,
    expiresAt: now + EXPIRY_MS,
  };

  usedRequestIds.add(requestId);
  inMemoryReports.push(storedReport);

  const updatedState = await recalculateMandalState(mandalId);
  return { success: true, waitMinutes: updatedState.waitMinutes };
}

// Recalculate crowd_state for a mandal based on active reports (last 90 min)
export async function recalculateMandalState(mandalId: string): Promise<MandalCrowdState> {
  const now = Date.now();
  const activeReports = inMemoryReports.filter(
    (r) => r.mandalId === mandalId && r.expiresAt > now
  );

  if (activeReports.length === 0) {
    const fallbackState: MandalCrowdState = {
      mandalId,
      status: getTimeOfDayEstimate(),
      lastReportAt: 0,
      reportCount: 0,
      isEstimated: true,
    };
    inMemoryState[mandalId] = fallbackState;
    return fallbackState;
  }

  // Status aggregation: weighted by recency / majority
  const counts: Record<CrowdStatus, number> = { short: 0, moving: 0, heavy: 0, none: 0 };
  const waitTimes: number[] = [];
  let latestTs = 0;

  activeReports.forEach((r) => {
    counts[r.status] = (counts[r.status] || 0) + 1;
    if (r.minutes) waitTimes.push(r.minutes);
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

  // Sync to Firestore if available
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
  if (inMemoryState[mandalId]) {
    const state = inMemoryState[mandalId];
    if (!state.isEstimated && Date.now() - state.lastReportAt > EXPIRY_MS) {
      return recalculateMandalState(mandalId);
    }
    return state;
  }
  return recalculateMandalState(mandalId);
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

  // Allow one primary signal per device per mandal per dwell type per day
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
    // Determine implicit queue time from seconds
    const estWait = dwellSeconds > 1800 ? 45 : dwellSeconds > 900 ? 30 : 20;
    const crowdStatus: CrowdStatus = estWait >= 35 ? "heavy" : "moving";

    inMemoryReports.push({
      mandalId,
      status: crowdStatus,
      deviceId: `dwell_${deviceId}`,
      atMandal: true,
      requestId: `dwell_${dedupKey}_${now}`,
      minutes: estWait,
      timestamp: now,
      expiresAt: now + EXPIRY_MS,
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

// Get crowd state for ALL mandals
export async function getAllCrowdStates(): Promise<Record<string, MandalCrowdState>> {
  const result: Record<string, MandalCrowdState> = {};
  for (const m of MANDALS) {
    result[m.id] = await getMandalCrowdState(m.id);
  }
  return result;
}

