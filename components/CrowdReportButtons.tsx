"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, Clock, MapPin, Loader2, Sparkles } from "lucide-react";
import { CrowdStatus, Mandal } from "@/lib/types";
import { getDeviceId } from "@/lib/deviceId";
import { getReportEligibility, GPSState } from "@/lib/reportEligibility";

interface CrowdReportButtonsProps {
  mandal: Mandal;
  onReportSuccess?: (status: CrowdStatus, crowdData: any) => void;
}

export default function CrowdReportButtons({
  mandal,
  onReportSuccess,
}: CrowdReportButtonsProps) {
  const [gpsState, setGpsState] = useState<GPSState>({
    status: "idle",
    position: { lat: 18.5204, lng: 73.8567 },
    accuracyM: 999,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [lastReportedStatus, setLastReportedStatus] = useState<CrowdStatus | null>(null);
  const [confirmationMsg, setConfirmationMsg] = useState<string | null>(null);

  // Check user GPS position
  useEffect(() => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      setGpsState((s) => ({ ...s, status: "loading" }));
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsState({
            status: "ready",
            position: { lat: pos.coords.latitude, lng: pos.coords.longitude },
            accuracyM: Math.round(pos.coords.accuracy || 50),
          });
        },
        () => {
          setGpsState((s) => ({ ...s, status: "denied" }));
        },
        { timeout: 8000, enableHighAccuracy: true }
      );
    }
  }, [mandal]);

  const eligibility = getReportEligibility(gpsState, { lat: mandal.lat, lng: mandal.lng });
  const atMandal = eligibility.atMandal;

  // Check cooldown on mount
  useEffect(() => {
    const deviceId = getDeviceId();
    if (!deviceId) return;

    fetch("/api/crowd/cooldowns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deviceId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.cooldowns && data.cooldowns[mandal.id]) {
          setCooldownSeconds(data.cooldowns[mandal.id]);
        }
      })
      .catch(() => {});
  }, [mandal.id]);

  // Countdown timer for cooldown
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const interval = setInterval(() => {
      setCooldownSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownSeconds]);

  const handleReport = async (status: CrowdStatus) => {
    if (cooldownSeconds > 0 || isSubmitting) return;

    setIsSubmitting(true);
    setConfirmationMsg(null);
    const deviceId = getDeviceId();
    const requestId = `rep_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    try {
      const res = await fetch(`/api/crowd/${mandal.id}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId,
          status,
          requestId,
          atMandal,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setLastReportedStatus(status);
        setConfirmationMsg("Thanks for the update! This helps everyone.");
        setCooldownSeconds(3600); // 60 min cooldown
        if (onReportSuccess) {
          onReportSuccess(status, data.crowd);
        }
      } else if (data.reason === "cooldown") {
        setCooldownSeconds(data.retryAfter || 1800);
      }
    } catch (err) {
      console.error("Failed to submit crowd report:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const cooldownMinutes = Math.ceil(cooldownSeconds / 60);

  return (
    <div className="space-y-3">
      {/* Header with "You're here" badge if within 200m */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-extrabold font-baloo text-[var(--text)]">
            Report Crowd Status
          </h2>
          {atMandal ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold font-baloo animate-pulse border border-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              You're here
            </span>
          ) : eligibility.kind === "refining" ? (
            <span className="text-[10px] font-baloo text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
              GPS settling...
            </span>
          ) : null}
        </div>

        <span className="text-xs text-[var(--muted)] font-baloo">
          Live crowd feedback
        </span>
      </div>

      {/* Confirmation message */}
      {confirmationMsg && (
        <div className="p-3.5 rounded-[14px] bg-[#DCFCE7] border border-[#BBF7D0] text-[#166534] font-baloo font-bold text-sm flex items-center gap-2 animate-in fade-in shadow-sm">
          <CheckCircle2 size={18} className="flex-shrink-0" />
          <span>{confirmationMsg}</span>
        </div>
      )}

      {/* Cooldown state banner */}
      {cooldownSeconds > 0 ? (
        <div className="p-3.5 rounded-[14px] bg-[#FFF0E6] border border-[#F0E6DB] text-[var(--muted)] text-xs font-baloo space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-[var(--accent)] text-sm">
            <Clock size={16} />
            <span>You reported this mandal recently</span>
          </div>
          <p>
            Cooldown active: next report available in{" "}
            <span className="font-extrabold text-[var(--text)]">{cooldownMinutes} min</span> ({cooldownSeconds}s).
          </p>
        </div>
      ) : (
        /* Three Big Report Buttons (72px height, 14px radius) */
        <div className="grid grid-cols-3 gap-2">
          {/* Short Card */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleReport("short")}
            className={`h-[72px] rounded-[14px] flex flex-col items-center justify-center gap-0.5 border-2 border-[#BBF7D0] bg-[var(--surface)] text-[#166534] hover:bg-[#DCFCE7] active:scale-95 transition-all tap-target ${
              atMandal ? "shadow-md ring-1 ring-emerald-300 font-black" : ""
            }`}
          >
            {isSubmitting ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <>
                <span className="text-2xl leading-none">😊</span>
                <span className="text-sm font-extrabold font-baloo">Short</span>
              </>
            )}
          </button>

          {/* Moving Card */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleReport("moving")}
            className={`h-[72px] rounded-[14px] flex flex-col items-center justify-center gap-0.5 border-2 border-[#FDE68A] bg-[var(--surface)] text-[#92400E] hover:bg-[#FEF3C7] active:scale-95 transition-all tap-target ${
              atMandal ? "shadow-md ring-1 ring-amber-300 font-black" : ""
            }`}
          >
            {isSubmitting ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <>
                <span className="text-2xl leading-none">🚶</span>
                <span className="text-sm font-extrabold font-baloo">Moving</span>
              </>
            )}
          </button>

          {/* Heavy Card */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleReport("heavy")}
            className={`h-[72px] rounded-[14px] flex flex-col items-center justify-center gap-0.5 border-2 border-[#FECACA] bg-[var(--surface)] text-[#991B1B] hover:bg-[#FEE2E2] active:scale-95 transition-all tap-target ${
              atMandal ? "shadow-md ring-1 ring-red-300 font-black" : ""
            }`}
          >
            {isSubmitting ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <>
                <span className="text-2xl leading-none">😓</span>
                <span className="text-sm font-extrabold font-baloo">Heavy</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
