"use client";

import { useState, useCallback, useEffect } from "react";

export type LocationStatus = "idle" | "requesting" | "granted" | "denied" | "unavailable";

export interface UserLocationState {
  location: { lat: number; lng: number } | null;
  status: LocationStatus;
  errorMessage: string | null;
  accuracy: number | null;
  requestLocation: () => void;
  resetLocation: () => void;
}

export function useUserLocation(initialLoc?: { lat: number; lng: number } | null): UserLocationState {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(initialLoc || null);
  const [status, setStatus] = useState<LocationStatus>(initialLoc ? "granted" : "idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);

  const requestLocation = useCallback(() => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setStatus("unavailable");
      setErrorMessage("Geolocation is not supported by your browser.");
      return;
    }

    setStatus("requesting");
    setErrorMessage(null);

    // Progressive location request: Try high-accuracy first, fallback to standard accuracy
    const tryLowAccuracy = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setLocation(coords);
          setAccuracy(pos.coords.accuracy || null);
          setStatus("granted");
          setErrorMessage(null);
        },
        (err) => {
          if (err.code === err.PERMISSION_DENIED) {
            setStatus("denied");
            setErrorMessage("Location permission was denied. Please allow location access in your browser settings.");
          } else {
            setStatus("unavailable");
            setErrorMessage("Could not detect location. Please ensure location/GPS is enabled on your device.");
          }
        },
        {
          enableHighAccuracy: false,
          timeout: 15000,
          maximumAge: 300000, // Accept 5 min cached position for mobile responsiveness
        }
      );
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setLocation(coords);
        setAccuracy(pos.coords.accuracy || null);
        setStatus("granted");
        setErrorMessage(null);
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setStatus("denied");
          setErrorMessage("Location permission was denied. Please allow location access in your browser settings.");
        } else {
          // Retry with low accuracy (Wi-Fi/Cellular network position)
          tryLowAccuracy();
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 60000,
      }
    );
  }, []);

  const resetLocation = useCallback(() => {
    setLocation(null);
    setAccuracy(null);
    setStatus("idle");
    setErrorMessage(null);
  }, []);

  return {
    location,
    status,
    errorMessage,
    accuracy,
    requestLocation,
    resetLocation,
  };
}
