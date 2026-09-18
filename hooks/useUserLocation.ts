"use client";

import { useState, useCallback } from "react";

export type LocationStatus = "idle" | "requesting" | "granted" | "denied" | "unavailable";

export interface UserLocationState {
  location: { lat: number; lng: number } | null;
  status: LocationStatus;
  errorMessage: string | null;
  requestLocation: () => void;
  resetLocation: () => void;
}

export function useUserLocation(initialLoc?: { lat: number; lng: number } | null): UserLocationState {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(initialLoc || null);
  const [status, setStatus] = useState<LocationStatus>(initialLoc ? "granted" : "idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const requestLocation = useCallback(() => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setStatus("unavailable");
      setErrorMessage("Geolocation is not supported by your browser. You can continue manually.");
      return;
    }

    setStatus("requesting");
    setErrorMessage(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setLocation(coords);
        setStatus("granted");
        setErrorMessage(null);
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setStatus("denied");
          setErrorMessage("Could not access your location. You can continue by choosing a location manually.");
        } else {
          setStatus("unavailable");
          setErrorMessage("Could not detect location. You can continue by choosing a location manually.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }, []);

  const resetLocation = useCallback(() => {
    setLocation(null);
    setStatus("idle");
    setErrorMessage(null);
  }, []);

  return {
    location,
    status,
    errorMessage,
    requestLocation,
    resetLocation,
  };
}
