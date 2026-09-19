import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore, collection, onSnapshot, query, where } from "firebase/firestore";
import { getDatabase, Database, ref, onValue } from "firebase/database";
import { LiveCrowd } from "./types";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "",
};

const isConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let rtdb: Database | null = null;

if (isConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    db = getFirestore(app);
    if (firebaseConfig.databaseURL) {
      rtdb = getDatabase(app);
    }
  } catch (err) {
    console.warn("Firebase initialization skipped or failed:", err);
  }
}

export { app, db, rtdb, isConfigured };

const EXPIRY_MS = 90 * 60 * 1000; // 90 minutes

/**
 * Real-time subscription to authoritative crowd state.
 * If Firebase is not configured or empty, returns an empty map cleanly.
 * Expired reports (>90 min) are dynamically returned as status: 'none'.
 */
export function subscribeToLiveCrowd(
  onUpdate: (crowdMap: Record<string, LiveCrowd>) => void
): () => void {
  if (!isConfigured) {
    onUpdate({});
    return () => {};
  }

  // 1. Try Realtime Database first if configured
  if (rtdb) {
    try {
      const crowdRef = ref(rtdb, "crowd_state");
      const unsubscribe = onValue(
        crowdRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const rawData = snapshot.val() as Record<string, any>;
            const now = Date.now();
            const crowdMap: Record<string, LiveCrowd> = {};

            Object.entries(rawData || {}).forEach(([mandalId, data]) => {
              const lastReportAt = typeof data.lastReportAt === "number" ? data.lastReportAt : 0;
              const isExpired = lastReportAt > 0 && now - lastReportAt > EXPIRY_MS;

              if (isExpired || data.status === "none" || !data.status) {
                crowdMap[mandalId] = {
                  mandalId,
                  status: "none",
                  reportedAt: 0,
                  reportCount: 0,
                  isEstimated: false,
                };
              } else {
                crowdMap[mandalId] = {
                  mandalId,
                  status: data.status,
                  reportedAt: lastReportAt,
                  reportCount: data.reportCount || 0,
                  waitMinutes: data.waitMinutes,
                  isEstimated: Boolean(data.isEstimated),
                };
              }
            });

            onUpdate(crowdMap);
          } else {
            onUpdate({});
          }
        },
        (error) => {
          console.warn("RTDB subscription error:", error);
          onUpdate({});
        }
      );
      return () => unsubscribe();
    } catch (e) {
      console.warn("RTDB listener failed:", e);
    }
  }

  // 2. Fallback to Firestore listener
  if (db) {
    try {
      const crowdCollection = collection(db, "crowd_state");
      const unsubscribe = onSnapshot(
        crowdCollection,
        (snapshot) => {
          const now = Date.now();
          const crowdMap: Record<string, LiveCrowd> = {};

          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const lastReportAt =
              data.lastReportAt && typeof data.lastReportAt.toMillis === "function"
                ? data.lastReportAt.toMillis()
                : typeof data.lastReportAt === "number"
                ? data.lastReportAt
                : 0;

            const isExpired = lastReportAt > 0 && now - lastReportAt > EXPIRY_MS;

            if (isExpired || data.status === "none" || !data.status) {
              crowdMap[docSnap.id] = {
                mandalId: docSnap.id,
                status: "none",
                reportedAt: 0,
                reportCount: 0,
                isEstimated: false,
              };
            } else {
              crowdMap[docSnap.id] = {
                mandalId: docSnap.id,
                status: data.status,
                reportedAt: lastReportAt,
                reportCount: data.reportCount || 0,
                waitMinutes: data.waitMinutes,
                isEstimated: Boolean(data.isEstimated),
              };
            }
          });

          onUpdate(crowdMap);
        },
        (error) => {
          console.warn("Firestore subscription error:", error);
          onUpdate({});
        }
      );
      return () => unsubscribe();
    } catch (e) {
      console.warn("Firestore listener failed:", e);
    }
  }

  onUpdate({});
  return () => {};
}
