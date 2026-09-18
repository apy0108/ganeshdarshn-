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

/**
 * Real-time subscription to crowd status.
 * If Firebase is not configured or empty, returns an empty map cleanly.
 */
export function subscribeToLiveCrowd(
  onUpdate: (crowdMap: Record<string, LiveCrowd>) => void
): () => void {
  if (!isConfigured) {
    onUpdate({});
    return () => {};
  }

  // 1. Try Realtime Database first if available
  if (rtdb) {
    try {
      const crowdRef = ref(rtdb, "live_crowd");
      const unsubscribe = onValue(
        crowdRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val() as Record<string, LiveCrowd>;
            onUpdate(data || {});
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

  // 2. Fallback to Firestore listener if RTDB is not configured
  if (db) {
    try {
      const crowdCollection = collection(db, "live_crowd");
      const unsubscribe = onSnapshot(
        crowdCollection,
        (snapshot) => {
          const crowdMap: Record<string, LiveCrowd> = {};
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as LiveCrowd;
            crowdMap[docSnap.id] = {
              mandalId: docSnap.id,
              status: data.status || 'none',
              reportedAt: data.reportedAt || 0,
              reportCount: data.reportCount || 0,
              waitMinutes: data.waitMinutes,
            };
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
