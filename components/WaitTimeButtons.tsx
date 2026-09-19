"use client";

import React, { useState } from "react";
import { CheckCircle2, Clock, Loader2 } from "lucide-react";
import { getDeviceId } from "@/lib/deviceId";

interface WaitTimeButtonsProps {
  mandalId: string;
  onWaitReportSuccess?: (minutes: number) => void;
}

const WAIT_OPTIONS = [
  { label: "5 min", minutes: 5 },
  { label: "10 min", minutes: 10 },
  { label: "15 min", minutes: 15 },
  { label: "20 min", minutes: 20 },
  { label: "30 min", minutes: 30 },
  { label: "45 min", minutes: 45 },
  { label: "1 hr", minutes: 60 },
  { label: "1.5 hr", minutes: 90 },
];

export default function WaitTimeButtons({
  mandalId,
  onWaitReportSuccess,
}: WaitTimeButtonsProps) {
  const [selectedMinutes, setSelectedMinutes] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSelectWait = async (minutes: number) => {
    if (isSubmitting || submitted) return;

    setSelectedMinutes(minutes);
    setIsSubmitting(true);
    setErrorMessage(null);
    const deviceId = getDeviceId();
    const requestId = `wait_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Get current GPS coords if available
    let coords: { lat?: number; lng?: number; accuracyM?: number } | undefined = undefined;
    if (typeof window !== "undefined" && navigator.geolocation) {
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 6000,
            enableHighAccuracy: true,
          });
        });
        coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracyM: Math.round(pos.coords.accuracy || 50),
        };
      } catch (e) {
        // Location not acquired
      }
    }

    try {
      const res = await fetch(`/api/crowd/${mandalId}/wait`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId,
          minutes,
          requestId,
          coords,
          lat: coords?.lat,
          lng: coords?.lng,
          accuracyM: coords?.accuracyM,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitted(true);
        if (onWaitReportSuccess) {
          onWaitReportSuccess(minutes);
        }
      } else {
        setErrorMessage(data.error || "Could not submit wait time. You must be within 1 km of the mandal.");
      }
    } catch (err) {
      console.error("Failed to submit wait time report:", err);
      setErrorMessage("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-2.5 pt-1">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-extrabold font-baloo text-[var(--text)]">
          How long did you wait?
        </h3>
        <span className="text-[11px] font-baloo text-[var(--muted)]">
          Done darshan? Share queue time
        </span>
      </div>

      {submitted ? (
        <div className="p-3 rounded-[14px] bg-[#DCFCE7] border border-[#BBF7D0] text-[#166534] font-baloo font-bold text-xs flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>Thanks! Recorded {selectedMinutes} min wait time.</span>
        </div>
      ) : (
        <div className="space-y-2">
          {errorMessage && (
            <div className="p-2.5 rounded-[12px] bg-red-50 border border-red-200 text-red-800 font-baloo font-bold text-xs">
              ⚠️ {errorMessage}
            </div>
          )}

          <div className="grid grid-cols-4 gap-2">
            {WAIT_OPTIONS.map((opt) => {
              const isSelected = selectedMinutes === opt.minutes;
              return (
                <button
                  key={opt.minutes}
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleSelectWait(opt.minutes)}
                  className={`h-11 min-w-[68px] rounded-full text-xs font-extrabold font-baloo border transition-all tap-target flex items-center justify-center ${
                    isSelected
                      ? "bg-[var(--accent)] text-white border-[var(--accent)] shadow-sm"
                      : "bg-[var(--surface)] border-[var(--border)] text-[var(--text)] hover:border-[var(--accent)] active:scale-95"
                  }`}
                >
                  {isSubmitting && isSelected ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    opt.label
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
