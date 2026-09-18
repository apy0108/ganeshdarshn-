"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  MapPin,
  Footprints,
  Compass,
  Sparkles,
  Loader2,
  Navigation,
} from "lucide-react";
import { buildRoute } from "@/lib/routeBuilder";
import { useUserLocation } from "@/hooks/useUserLocation";

const TIME_OPTIONS = [
  { label: "1 hour", minutes: 60, sub: "Quick Darshan" },
  { label: "1½ hours", minutes: 90, sub: "Essential Loop" },
  { label: "2 hours", minutes: 120, sub: "Most Popular" },
  { label: "3 hours", minutes: 180, sub: "Complete Peth Trail" },
  { label: "4 hours", minutes: 240, sub: "Extended Immersion" },
  { label: "6 hours", minutes: 360, sub: "Full Day Experience" },
];

const PREFERENCE_OPTIONS = [
  {
    id: "manache",
    title: "मानाचे गणपती (Manache Paach)",
    sub: "The 5 ceremonial honored mandals in sequence",
  },
  {
    id: "dagdusheth",
    title: "श्रीमंत दगडूशेठ (Dagdusheth)",
    sub: "Must-visit iconic mandal in Budhwar Peth",
  },
  {
    id: "famous",
    title: "The famous ones",
    sub: "Grandest idols and marquee pandals",
  },
  {
    id: "dekhava",
    title: "Dekhava & light shows",
    sub: "Elaborate moving sets, best after dusk",
  },
  {
    id: "historic",
    title: "Historic mandals",
    sub: "Oldest 1890s freedom movement shrines",
  },
  {
    id: "calm",
    title: "Calm temples",
    sub: "Year-round temples with shorter queues",
  },
  {
    id: "surprise",
    title: "Surprise me",
    sub: "A balanced, diverse mix of all 30 mandals",
  },
];

const TRANSPORT_OPTIONS = [
  { id: "walk", emoji: "🚶", label: "Walking", sub: "Best for Peths" },
  { id: "metro", emoji: "🚇", label: "Metro", sub: "Fast connections" },
  { id: "two-wheeler", emoji: "🛵", label: "Two-wheeler", sub: "Quick hops" },
];

export default function RouteBuilderWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Form selections
  const [selectedMinutes, setSelectedMinutes] = useState<number>(120);
  const [selectedPrefs, setSelectedPrefs] = useState<string[]>(["manache", "dagdusheth"]);
  const [selectedTransport, setSelectedTransport] = useState<"walk" | "metro" | "two-wheeler">("walk");
  const locationState = useUserLocation();
  const [isBuilding, setIsBuilding] = useState(false);

  const togglePref = (id: string) => {
    if (id === "surprise") {
      setSelectedPrefs(["surprise"]);
      return;
    }

    let updated = selectedPrefs.filter((p) => p !== "surprise");
    if (updated.includes(id)) {
      if (updated.length > 1) {
        updated = updated.filter((p) => p !== id);
      }
    } else {
      updated = [...updated, id];
    }
    setSelectedPrefs(updated);
  };

  const handleBuildRoute = async () => {
    setIsBuilding(true);

    try {
      // Fetch live crowd state to inform wait calculations
      let crowdStates = {};
      try {
        const crowdRes = await fetch("/api/crowd");
        if (crowdRes.ok) {
          crowdStates = await crowdRes.json();
        }
      } catch {}

      const result = await buildRoute({
        budgetMinutes: selectedMinutes,
        preferences: selectedPrefs,
        transport: selectedTransport,
        startLocation: locationState.location || undefined,
        crowdStates,
      });

      // Save plan stops to localStorage
      const stopIds = result.stops.map((s) => s.mandal.id);
      localStorage.setItem("pg.plan", JSON.stringify(stopIds));
      localStorage.setItem("pg.plan_meta", JSON.stringify({
        budgetMinutes: selectedMinutes,
        transport: selectedTransport,
        preferences: selectedPrefs,
        userLocation: locationState.location,
      }));

      // Navigate to /plan
      router.push(`/plan?budget=${selectedMinutes}&transport=${selectedTransport}`);
    } catch (err) {
      console.error("Failed to build route:", err);
      router.push(`/plan`);
    } finally {
      setIsBuilding(false);
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[var(--bg)] flex flex-col justify-between pb-36 font-sans">
      {/* Top Thin Orange Progress Line */}
      <div className="w-full bg-[var(--border)] h-1 fixed top-0 left-0 right-0 z-50">
        <div
          className="bg-[var(--accent)] h-full transition-all duration-300"
          style={{ width: `${(step / 2) * 100}%` }}
        />
      </div>

      {/* Header */}
      <div className="px-4 pt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => (step > 1 ? setStep(step - 1) : router.back())}
          className="tap-target p-2 -ml-2 text-[var(--muted)] hover:text-[var(--text)]"
          aria-label="Back"
        >
          <ArrowLeft size={22} />
        </button>

        <span className="text-xs font-extrabold font-baloo px-3 py-1 rounded-full bg-[var(--accent-bg)] text-[var(--accent)]">
          Step {step} of 2
        </span>
      </div>

      {/* Content Container */}
      <div className="px-4 py-4 flex-1 space-y-6">
        {/* STEP 1: TIME BUDGET */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <h1 className="text-[28px] font-extrabold font-baloo text-[var(--text)] leading-tight">
                How long do you have?
              </h1>
              <p className="text-sm font-marathi text-[var(--muted)] pt-1">
                दर्शनासाठी एकूण उपलब्ध वेळ निवडा
              </p>
            </div>

            {/* 6 Options as Large Tap Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {TIME_OPTIONS.map((opt) => {
                const isSelected = selectedMinutes === opt.minutes;
                return (
                  <button
                    key={opt.minutes}
                    type="button"
                    onClick={() => setSelectedMinutes(opt.minutes)}
                    className={`h-[94px] rounded-[18px] p-3 flex flex-col items-center justify-center border-2 transition-all tap-target ${
                      isSelected
                        ? "border-[var(--accent)] bg-[var(--accent-bg)] shadow-md"
                        : "border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:border-[var(--muted)] active:scale-[0.98]"
                    }`}
                  >
                    <span className="text-[22px] font-extrabold font-baloo text-[var(--text)] leading-tight">
                      {opt.label}
                    </span>
                    <span className="text-xs font-baloo font-bold text-[var(--accent)] mt-0.5">
                      {opt.sub}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2: PREFERENCES, TRANSPORT, START POINT */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h1 className="text-[28px] font-extrabold font-baloo text-[var(--text)] leading-tight">
                What do you want to see?
              </h1>
              <p className="text-sm font-marathi text-[var(--muted)] pt-1">
                आवडीची ठिकाणे व प्रवास माध्यम निवडा
              </p>
            </div>

            {/* Multi-Select Chips */}
            <div className="space-y-2 pt-1">
              <span className="text-xs font-extrabold font-baloo text-[var(--muted)] uppercase tracking-wider">
                Mandal Preferences (Pick multiple)
              </span>
              <div className="flex flex-col gap-2">
                {PREFERENCE_OPTIONS.map((pref) => {
                  const isSelected = selectedPrefs.includes(pref.id);
                  return (
                    <button
                      key={pref.id}
                      type="button"
                      onClick={() => togglePref(pref.id)}
                      className={`p-3.5 rounded-[16px] flex items-center justify-between border-2 transition-all text-left tap-target ${
                        isSelected
                          ? "border-[var(--accent)] bg-[var(--accent-bg)] shadow-sm"
                          : "border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:border-[var(--muted)]"
                      }`}
                    >
                      <div className="space-y-0.5 pr-2">
                        <div className="text-sm font-extrabold font-baloo text-[var(--text)]">
                          {pref.title}
                        </div>
                        <div className="text-xs text-[var(--muted)] font-baloo">
                          {pref.sub}
                        </div>
                      </div>

                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 border ${
                          isSelected
                            ? "bg-[var(--accent)] border-[var(--accent)] text-white"
                            : "border-[var(--border)] bg-white"
                        }`}
                      >
                        {isSelected && <Check size={14} />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Transport Mode Selection */}
            <div className="space-y-2">
              <span className="text-xs font-extrabold font-baloo text-[var(--muted)] uppercase tracking-wider">
                Transport Mode
              </span>
              <div className="grid grid-cols-3 gap-2">
                {TRANSPORT_OPTIONS.map((t) => {
                  const isSelected = selectedTransport === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedTransport(t.id as any)}
                      className={`h-[84px] rounded-[16px] p-2 flex flex-col items-center justify-center border-2 transition-all tap-target ${
                        isSelected
                          ? "border-[var(--accent)] bg-[var(--accent-bg)] shadow-sm"
                          : "border-[var(--border)] bg-[var(--surface)] text-[var(--text)]"
                      }`}
                    >
                      <span className="text-2xl">{t.emoji}</span>
                      <span className="text-xs font-extrabold font-baloo text-[var(--text)] mt-1">
                        {t.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Starting Point Selection */}
            <div className="p-4 rounded-[18px] bg-[var(--surface)] border-2 border-[var(--border)] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold font-baloo text-[var(--muted)] uppercase tracking-wider">
                  Starting Point
                </span>
                {locationState.location && (
                  <button
                    type="button"
                    onClick={locationState.resetLocation}
                    className="text-xs font-bold font-baloo text-[var(--muted)] hover:underline"
                  >
                    Reset to City Centre
                  </button>
                )}
              </div>

              {/* Prominent Location CTA Button */}
              <div>
                {locationState.status === "granted" && locationState.location ? (
                  <div className="flex items-center gap-2 p-2.5 rounded-[12px] bg-emerald-50 border border-emerald-200 text-emerald-900">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-extrabold font-baloo">
                      📍 Location detected
                    </span>
                    <span className="text-[11px] text-emerald-700 ml-auto font-baloo">
                      GPS Active ✓
                    </span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={locationState.requestLocation}
                    disabled={locationState.status === "requesting"}
                    className="w-full py-2.5 px-3 rounded-[12px] bg-[var(--accent-bg)] border border-[var(--accent)] text-[var(--accent)] hover:bg-orange-100 flex items-center justify-center gap-2 text-xs font-extrabold font-baloo transition-all shadow-sm"
                  >
                    <Navigation
                      size={14}
                      className={locationState.status === "requesting" ? "animate-spin" : ""}
                    />
                    <span>
                      {locationState.status === "requesting"
                        ? "📍 Detecting location..."
                        : "📍 Use Current Location"}
                    </span>
                  </button>
                )}

                {locationState.errorMessage && (
                  <p className="text-xs text-amber-800 bg-amber-50 p-2 rounded-[10px] border border-amber-200 mt-2 font-baloo">
                    {locationState.errorMessage}
                  </p>
                )}
              </div>

              <div className="text-xs font-baloo text-[var(--muted)] pt-1">
                {locationState.location ? (
                  <span>
                    Your route and walk times will start directly from your live position.
                  </span>
                ) : (
                  <span>
                    Default origin: <strong>Pune city centre (Budhwar Chowk)</strong>
                  </span>
                )}
              </div>
            </div>

            {/* Metro Routing Guidance Banner when Metro selected */}
            {selectedTransport === "metro" && (
              <div className="p-3.5 rounded-[16px] bg-purple-50 border border-purple-200 text-purple-900 text-xs font-baloo space-y-1">
                <div className="flex items-center gap-1.5 font-extrabold text-purple-950">
                  <span className="w-4 h-4 rounded-full bg-purple-700 text-white flex items-center justify-center text-[10px] font-black">
                    M
                  </span>
                  <span>Metro Route Assistant Active</span>
                </div>
                <p className="text-purple-900/90 text-[11px]">
                  {locationState.location
                    ? "Will guide you to your nearest boarding station and optimal exit station near mandals."
                    : "Will route you from the nearest central station (Civil Court / Budhwar Peth / Mandai)."}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sticky Bottom Next / Build Button */}
      <div className="fixed bottom-0 inset-x-0 z-50 bg-[var(--surface)] border-t-[1.5px] border-[var(--border)] p-3.5 pb-[max(env(safe-area-inset-bottom,0px)+12px,16px)] max-w-md mx-auto shadow-2xl">
        {step === 1 ? (
          <button
            type="button"
            onClick={() => setStep(2)}
            className="w-full h-[58px] rounded-[16px] bg-[var(--accent)] text-white text-[19px] font-extrabold font-baloo flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.98] transition-all shadow-md"
          >
            Continue to Preferences <ArrowRight size={20} />
          </button>
        ) : (
          <button
            type="button"
            disabled={isBuilding}
            onClick={handleBuildRoute}
            className="w-full h-[58px] rounded-[16px] bg-[var(--accent)] text-white text-[20px] font-extrabold font-baloo flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.98] transition-all shadow-md"
          >
            {isBuilding ? (
              <>
                <Loader2 size={22} className="animate-spin" />
                Optimizing your route...
              </>
            ) : (
              <>
                <span>✦</span> Build My Route
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
