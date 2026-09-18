"use client";

import { useEffect, useRef, useState } from "react";
import { findCurrentDwellZone, classifyDwell, DwellZone, DwellState } from "@/lib/dwell";
import { getDeviceId } from "@/lib/deviceId";
import { GPSState } from "@/lib/reportEligibility";

interface DwellTrackingState {
  mandalId: string | null;
  zone: DwellZone | null;
  enteredAtMs: number | null;
  leftAtMs: number | null;
  lastEmittedState: DwellState | null;
  lastEmittedAtMs: number | null;
}

export function useDwellSignal() {
  const [gpsState, setGpsState] = useState<GPSState>({
    status: "idle",
    position: { lat: 18.5204, lng: 73.8567 },
    accuracyM: 999,
  });

  const [activeZone, setActiveZone] = useState<DwellZone | null>(null);
  const [currentDwellState, setCurrentDwellState] = useState<DwellState>("passing");

  const trackingRef = useRef<DwellTrackingState>({
    mandalId: null,
    zone: null,
    enteredAtMs: null,
    leftAtMs: null,
    lastEmittedState: null,
    lastEmittedAtMs: null,
  });

  // Function to emit dwell signal silently to /api/crowd/dwell
  const emitDwellSignal = async (
    mandalId: string,
    dwell: "lingering" | "queueing",
    dwellSeconds: number,
    isFinal = false
  ) => {
    try {
      const deviceId = getDeviceId();
      if (!deviceId) return;

      // Note: Coordinates are NEVER sent to the server.
      await fetch("/api/crowd/dwell", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mandalId,
          dwell,
          dwellSeconds: Math.round(dwellSeconds),
          deviceId,
          isFinal,
        }),
      });
    } catch (e) {
      console.warn("Failed to emit anonymous dwell signal:", e);
    }
  };

  // 1. Geolocation watcher
  useEffect(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setGpsState((s) => ({ ...s, status: "error", error: "Geolocation unsupported" }));
      return;
    }

    setGpsState((s) => ({ ...s, status: "loading" }));

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setGpsState({
          status: "ready",
          position: {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          },
          accuracyM: Math.round(pos.coords.accuracy || 50),
        });
      },
      (err) => {
        setGpsState((s) => ({
          ...s,
          status: err.code === 1 ? "denied" : "error",
          error: err.message,
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 10000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  // 2. Periodic Dwell evaluation (every 10 seconds)
  useEffect(() => {
    if (gpsState.status !== "ready" || !gpsState.position) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const current = trackingRef.current;
      const match = findCurrentDwellZone(gpsState.position);

      if (match) {
        // User is currently inside a geofence zone
        const zone = match.zone;

        if (current.mandalId !== zone.mandalId) {
          // New zone entered!
          // If leaving an older zone that had lingering/queueing, emit its exit signal first
          if (
            current.mandalId &&
            current.enteredAtMs &&
            (current.lastEmittedState === "lingering" || current.lastEmittedState === "queueing")
          ) {
            const timeSpentS = (now - current.enteredAtMs) / 1000;
            emitDwellSignal(current.mandalId, current.lastEmittedState, timeSpentS, true);
          }

          // Start tracking new zone
          trackingRef.current = {
            mandalId: zone.mandalId,
            zone: zone,
            enteredAtMs: now,
            leftAtMs: null,
            lastEmittedState: "passing",
            lastEmittedAtMs: null,
          };
          setActiveZone(zone);
          setCurrentDwellState("passing");
        } else if (current.enteredAtMs) {
          // Continuing stay in current zone
          const secondsInZone = (now - current.enteredAtMs) / 1000;
          const classified = classifyDwell(secondsInZone, zone);
          setCurrentDwellState(classified);

          // Emit intermediate signal when status escalates or periodically
          if (
            (classified === "lingering" || classified === "queueing") &&
            (!current.lastEmittedAtMs || now - current.lastEmittedAtMs > 60000)
          ) {
            trackingRef.current.lastEmittedState = classified;
            trackingRef.current.lastEmittedAtMs = now;
            emitDwellSignal(zone.mandalId, classified, secondsInZone, false);
          }
        }
      } else {
        // User is not in any zone
        if (
          current.mandalId &&
          current.enteredAtMs &&
          (current.lastEmittedState === "lingering" || current.lastEmittedState === "queueing")
        ) {
          // Just left the zone after lingering or queueing -> send final exit signal
          const timeSpentS = (now - current.enteredAtMs) / 1000;
          emitDwellSignal(current.mandalId, current.lastEmittedState, timeSpentS, true);
        }

        trackingRef.current = {
          mandalId: null,
          zone: null,
          enteredAtMs: null,
          leftAtMs: now,
          lastEmittedState: null,
          lastEmittedAtMs: null,
        };
        setActiveZone(null);
        setCurrentDwellState("passing");
      }
    }, 10000); // Check every 10s

    return () => clearInterval(interval);
  }, [gpsState]);

  return {
    gpsState,
    activeZone,
    currentDwellState,
  };
}
