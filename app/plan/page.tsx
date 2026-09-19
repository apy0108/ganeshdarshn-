"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Navigation,
  Sparkles,
  Footprints,
  RotateCcw,
  Trash2,
  CheckCircle2,
  ExternalLink,
  MapPin,
  Clock,
  Layers,
  Zap,
  Share2,
  AlertCircle,
} from "lucide-react";
import dynamic from "next/dynamic";
import { MANDALS, getMandalById, haversine } from "@/lib/mandals";
import { Mandal, LiveCrowd, CrowdStatus } from "@/lib/types";
import { formatMinutes } from "@/lib/curatedRoutes";
import {
  RouteStop,
  buildRoute,
  buildGoogleMapsURL,
  splitIntoLegs,
} from "@/lib/routeBuilder";
import CrowdBadge, { CROWD_CONFIG } from "@/components/CrowdBadge";
import { PUNE_METRO_STATIONS, getMetroTransitPlan } from "@/lib/metro";
import { useUserLocation } from "@/hooks/useUserLocation";

const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#120800] flex items-center justify-center text-xs text-orange-200 font-baloo">
      Loading tour map...
    </div>
  ),
});

function PlanPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Plan configuration state
  const [mandalIds, setMandalIds] = useState<string[]>([]);
  const [crowdData, setCrowdData] = useState<Record<string, LiveCrowd>>({});
  const [dwellStyle, setDwellStyle] = useState<"full" | "mixed" | "quick">("full");
  const [transport, setTransport] = useState<"walk" | "metro" | "two-wheeler">("walk");
  const locationState = useUserLocation();
  const [activeLegIndex, setActiveLegIndex] = useState(0);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [shareToast, setShareToast] = useState(false);

  // Load saved plan from localStorage OR from URL query params (?plan=id1,id2,...)
  useEffect(() => {
    try {
      const urlPlan = searchParams.get("plan");
      const urlTransport = searchParams.get("transport");

      if (urlTransport && ["walk", "metro", "two-wheeler"].includes(urlTransport)) {
        setTransport(urlTransport as any);
      }

      if (urlPlan) {
        const ids = urlPlan.split(",").filter((id) => getMandalById(id));
        if (ids.length > 0) {
          setMandalIds(ids);
          localStorage.setItem("pg.plan", JSON.stringify(ids));
          return;
        }
      }

      const savedPlan = JSON.parse(localStorage.getItem("pg.plan") || "[]");
      const meta = JSON.parse(localStorage.getItem("pg.plan_meta") || "{}");

      if (meta.transport) setTransport(meta.transport);

      if (savedPlan && savedPlan.length > 0) {
        setMandalIds(savedPlan);
      } else {
        // Default Manache Paach sequence
        setMandalIds([
          "kasba-ganpati",
          "tambdi-jogeshwari",
          "guruji-talim",
          "tulshibaug-ganpati",
          "kesariwada-ganpati",
        ]);
      }
    } catch {
      setMandalIds([
        "kasba-ganpati",
        "tambdi-jogeshwari",
        "guruji-talim",
        "tulshibaug-ganpati",
        "kesariwada-ganpati",
      ]);
    }
  }, [searchParams]);

  // Handle sharing of the darshan plan URL
  const handleShareRoute = async () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const shareUrl = `${origin}/plan?plan=${mandalIds.join(",")}&transport=${transport}`;
    const shareText = `Check out my Pune Ganpati Darshan route (${mandalIds.length} stops) on Ganpati Darshan!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Pune Ganpati Darshan Route",
          text: shareText,
          url: shareUrl,
        });
      } catch {}
    } else {
      navigator.clipboard.writeText(shareUrl);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2500);
    }
  };

  // Poll /api/crowd
  useEffect(() => {
    const fetchCrowd = async () => {
      try {
        const res = await fetch("/api/crowd");
        if (res.ok) {
          const data = await res.json();
          setCrowdData((prev) => ({ ...prev, ...data }));
        }
      } catch {}
    };

    fetchCrowd();
    const interval = setInterval(fetchCrowd, 60000);
    return () => clearInterval(interval);
  }, []);

  // Handle location request
  const handleUseLocation = () => {
    locationState.requestLocation();
  };

  // Auto re-optimize if location is obtained
  useEffect(() => {
    if (locationState.location) {
      handleOptimizeWithOrigin(locationState.location);
    }
  }, [locationState.location]);

  // Build RouteStops list from current mandalIds
  const routeStops: RouteStop[] = useMemo(() => {
    const stops: RouteStop[] = [];
    const origin = locationState.location || { lat: 18.5204, lng: 73.8567 };

    let prevPoint = origin;
    mandalIds.forEach((id) => {
      const mandal = getMandalById(id);
      if (!mandal) return;

      const meters = haversine(prevPoint, { lat: mandal.lat, lng: mandal.lng });
      const mult = transport === "two-wheeler" ? 0.45 : transport === "metro" ? 0.7 : 1.0;
      const walkMins = Math.max(1, Math.round((meters / 1.2 / 60) * mult));

      const crowd = crowdData[mandal.id];
      let queueMins = 5;
      if (crowd?.waitMinutes) {
        queueMins = crowd.waitMinutes;
      } else if (crowd?.status === "heavy") {
        queueMins = 35;
      } else if (crowd?.status === "moving") {
        queueMins = 15;
      }

      const dwellMins = dwellStyle === "quick" ? 2 : dwellStyle === "mixed" ? 5 : 10;

      stops.push({
        mandal,
        walkMinutesToNext: walkMins,
        queueMinutes: queueMins,
        totalTimeAtStop: queueMins + dwellMins,
        distanceMeters: Math.round(meters),
      });

      prevPoint = { lat: mandal.lat, lng: mandal.lng };
    });

    return stops;
  }, [mandalIds, crowdData, dwellStyle, transport, locationState.location]);

  // Total summary statistics
  const totalStats = useMemo(() => {
    let totalWalkMins = 0;
    let totalDwellMins = 0;
    let totalDistM = 0;

    routeStops.forEach((s) => {
      totalWalkMins += s.walkMinutesToNext;
      totalDwellMins += s.totalTimeAtStop;
      totalDistM += s.distanceMeters;
    });

    return {
      distanceKm: (totalDistM / 1000).toFixed(1),
      totalMinutes: totalWalkMins + totalDwellMins,
      walkMinutes: totalWalkMins,
      dwellMinutes: totalDwellMins,
      stopCount: routeStops.length,
    };
  }, [routeStops]);

  // Re-run greedy optimization
  const handleOptimizeWithOrigin = async (originLoc?: { lat: number; lng: number }) => {
    setIsOptimizing(true);
    try {
      const result = await buildRoute({
        budgetMinutes: 360,
        preferences: ["surprise"],
        transport,
        startLocation: originLoc || locationState.location || undefined,
        crowdStates: crowdData,
        dwellStyle,
      });

      // Filter to keep currently selected mandal set or optimized sequence
      const newIds = result.stops
        .map((s) => s.mandal.id)
        .filter((id) => mandalIds.includes(id));

      if (newIds.length > 0) {
        // Add any missing
        mandalIds.forEach((id) => {
          if (!newIds.includes(id)) newIds.push(id);
        });
        setMandalIds(newIds);
        localStorage.setItem("pg.plan", JSON.stringify(newIds));
      }
    } catch {} finally {
      setIsOptimizing(false);
    }
  };

  // Split into Google Maps legs if > 10 stops
  const legs = useMemo(() => {
    return splitIntoLegs(routeStops, Boolean(locationState.location));
  }, [routeStops, locationState.location]);

  const activeStops = legs[activeLegIndex] || routeStops;
  const googleMapsUrl = buildGoogleMapsURL(locationState.location, activeStops);

  const clearPlan = () => {
    localStorage.setItem("pg.plan", "[]");
    setMandalIds([]);
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[var(--bg)] pb-36 font-sans">
      {/* Toast Notification */}
      {shareToast && (
        <div className="fixed bottom-24 inset-x-4 z-50 max-w-sm mx-auto p-3.5 rounded-[16px] bg-[#166534] text-white font-baloo font-bold text-sm flex items-center justify-center gap-2 shadow-2xl animate-in fade-in">
          <CheckCircle2 size={18} />
          <span>Route link copied! Share it with friends.</span>
        </div>
      )}

      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          className="tap-target p-2 -ml-2 text-[var(--muted)] hover:text-[var(--text)]"
          aria-label="Back"
        >
          <ArrowLeft size={22} />
        </button>

        <div className="text-center">
          <h1 className="text-lg font-extrabold font-baloo text-[var(--text)]">
            Your Darshan
          </h1>
          <p className="text-xs font-baloo text-[var(--muted)]">
            {totalStats.stopCount} stops · from {locationState.location ? "Your location" : "City centre"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {mandalIds.length > 0 && (
            <button
              type="button"
              onClick={handleShareRoute}
              className="tap-target p-2 rounded-full bg-[var(--surface)] text-[var(--accent)] border border-[var(--border)] hover:bg-[var(--accent-bg)] active:scale-95 transition-all shadow-sm"
              aria-label="Share Route"
              title="Share Route"
            >
              <Share2 size={16} />
            </button>
          )}

          <Link
            href="/start"
            className="text-xs font-extrabold font-baloo text-[var(--accent)] hover:underline"
          >
            Build new
          </Link>
        </div>
      </div>

      {/* Embedded Map Section (~200px) */}
      <div className="relative w-full h-[210px] bg-[#120800] border-y border-[var(--border)] overflow-hidden">
        <Map
          mandals={routeStops.map((s) => s.mandal)}
          showNumbers={true}
          center={
            routeStops[0]
              ? [routeStops[0].mandal.lng, routeStops[0].mandal.lat]
              : [73.8567, 18.5204]
          }
          zoom={14.5}
          className="w-full h-full"
        />

        <div className="absolute top-2.5 left-2.5 z-10 px-3 py-1 rounded-full bg-black/75 backdrop-blur-sm text-white text-[11px] font-bold font-baloo shadow">
          {totalStats.stopCount} Stops Route
        </div>
      </div>

      {/* Metro Multi-Leg Journey Guide if transport is metro */}
      {transport === "metro" && routeStops.length > 0 && (
        <div className="px-4 pt-3">
          {(() => {
            const startLoc = locationState.location || { lat: 18.5204, lng: 73.8567 };
            const transitPlan = getMetroTransitPlan(startLoc, routeStops[0].mandal);

            return (
              <div className="p-4 rounded-[18px] bg-purple-50 border-2 border-purple-200 text-purple-950 space-y-2.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-purple-700 text-white font-baloo font-black text-xs flex items-center justify-center">
                      M
                    </span>
                    <div>
                      <h3 className="text-xs font-extrabold font-baloo uppercase tracking-wider text-purple-900">
                        Metro Transit Itinerary
                      </h3>
                      <p className="text-[11px] text-purple-700 font-baloo">
                        {locationState.location ? "From your GPS location" : "From Pune Central"} → {routeStops[0].mandal.name}
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-purple-200 text-purple-900 text-xs font-black font-baloo">
                    ~{transitPlan.totalTransitMinutes} min
                  </span>
                </div>

                <div className="space-y-2 pt-1 border-t border-purple-200 text-xs font-baloo text-purple-900">
                  {transitPlan.steps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      <span className="text-base flex-shrink-0">{step.icon}</span>
                      <div className="flex-1 space-y-0.5">
                        <div className="font-extrabold text-purple-950 flex items-center justify-between">
                          <span>{step.title}</span>
                          <span className="text-[11px] text-purple-700">~{step.durationMinutes}m</span>
                        </div>
                        <p className="text-[11px] text-purple-900/80 leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Stats Bar */}
      <div className="p-4">
        <div className="p-4 rounded-[18px] bg-[var(--surface)] border-[1.5px] border-[var(--border)] shadow-sm space-y-1.5">
          <div className="flex items-center justify-around text-center">
            <div>
              <div className="text-xl font-extrabold font-baloo text-[var(--text)]">
                {totalStats.distanceKm} km
              </div>
              <div className="text-[11px] font-baloo text-[var(--muted)]">Distance</div>
            </div>

            <div className="w-[1px] h-8 bg-[var(--border)]" />

            <div>
              <div className="text-xl font-extrabold font-baloo text-[var(--accent)]">
                {formatMinutes(totalStats.totalMinutes)}
              </div>
              <div className="text-[11px] font-baloo text-[var(--muted)]">Total Time</div>
            </div>

            <div className="w-[1px] h-8 bg-[var(--border)]" />

            <div>
              <div className="text-xl font-extrabold font-baloo text-[var(--text)]">
                {totalStats.stopCount}
              </div>
              <div className="text-[11px] font-baloo text-[var(--muted)]">Stops</div>
            </div>
          </div>

          <div className="text-center pt-2 border-t border-[var(--border)] text-[11px] font-baloo text-[var(--muted)]">
            ~{formatMinutes(totalStats.walkMinutes)} transit + ~{formatMinutes(totalStats.dwellMinutes)} darshan & queues from live reports
          </div>
        </div>
      </div>

      {/* HOW YOU'LL DO IT Section */}
      <div className="px-4 space-y-3">
        <div className="p-4 rounded-[18px] bg-[var(--surface)] border border-[var(--border)] space-y-3">
          <h2 className="text-xs font-extrabold font-baloo text-[var(--muted)] uppercase tracking-wider">
            How You'll Do It
          </h2>

          {/* Darshan Dwell Style Radio */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-[var(--bg)] rounded-[12px]">
            {[
              { id: "full", label: "Queue at all" },
              { id: "mixed", label: "Bit of both" },
              { id: "quick", label: "Fast darshan" },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setDwellStyle(opt.id as any)}
                className={`py-2 px-1 text-center rounded-[10px] text-xs font-extrabold font-baloo transition-all ${
                  dwellStyle === opt.id
                    ? "bg-[var(--accent)] text-white shadow-sm"
                    : "text-[var(--muted)] hover:text-[var(--text)]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Transport Mode Switcher */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-bold font-baloo text-[var(--muted)]">
              Transport:
            </span>
            <div className="flex items-center gap-1.5">
              {[
                { id: "walk", label: "🚶 Walk" },
                { id: "metro", label: "🚇 Metro" },
                { id: "two-wheeler", label: "🛵 2-Wheeler" },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTransport(t.id as any)}
                  className={`px-2.5 py-1 rounded-full text-xs font-extrabold font-baloo border ${
                    transport === t.id
                      ? "bg-[var(--text)] text-white border-[var(--text)]"
                      : "bg-[var(--surface)] text-[var(--muted)] border-[var(--border)]"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Prominent Starting Point Location Section */}
          <div className="pt-2 border-t border-[var(--border)] space-y-2">
            <div className="flex items-center justify-between">
              {locationState.status === "granted" && locationState.location ? (
                <div className="inline-flex items-center gap-1.5 text-xs font-extrabold font-baloo text-emerald-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>📍 Location detected</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleUseLocation}
                  disabled={locationState.status === "requesting"}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-[var(--accent-bg)] text-[var(--accent)] border border-[var(--accent)] text-xs font-extrabold font-baloo hover:bg-orange-100 transition-colors"
                >
                  <Navigation
                    size={13}
                    className={locationState.status === "requesting" ? "animate-spin" : ""}
                  />
                  <span>
                    {locationState.status === "requesting"
                      ? "📍 Detecting..."
                      : "📍 Use Current Location"}
                  </span>
                </button>
              )}

              <button
                type="button"
                disabled={isOptimizing}
                onClick={() => handleOptimizeWithOrigin()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--accent-bg)] text-[var(--accent)] text-xs font-extrabold font-baloo hover:bg-orange-100 transition-colors"
              >
                <Zap size={13} />
                {isOptimizing ? "Optimizing..." : "Optimize order"}
              </button>
            </div>

            {locationState.errorMessage && (
              <p className="text-xs text-amber-800 bg-amber-50 p-2 rounded-[10px] border border-amber-200 font-baloo">
                {locationState.errorMessage}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Multi-Leg Navigation Tabs if > 10 stops */}
      {legs.length > 1 && (
        <div className="px-4 pt-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {legs.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveLegIndex(idx)}
                className={`px-4 py-2 rounded-full text-xs font-extrabold font-baloo transition-all ${
                  activeLegIndex === idx
                    ? "bg-[var(--accent)] text-white shadow-sm"
                    : "bg-[var(--surface)] text-[var(--muted)] border border-[var(--border)]"
                }`}
              >
                Leg {idx + 1} ({legs[idx].length} stops)
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ROUTE ORDER List — Numbered Stops */}
      <div className="px-4 pt-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold font-baloo text-[var(--text)]">
            Route Stops ({routeStops.length})
          </h2>
          <span className="text-xs font-baloo text-[var(--muted)]">
            Numbered in visit order
          </span>
        </div>

        {routeStops.length === 0 ? (
          <div className="p-8 rounded-[20px] bg-[var(--surface)] border border-[var(--border)] text-center space-y-3">
            <p className="text-base font-extrabold font-baloo text-[var(--text)]">
              Your darshan plan is empty
            </p>
            <Link
              href="/start"
              className="inline-flex h-[48px] px-6 rounded-[14px] bg-[var(--accent)] text-white text-sm font-extrabold font-baloo items-center justify-center"
            >
              Build a New Route
            </Link>
          </div>
        ) : (
          <div className="space-y-2.5">
            {routeStops.map((stop, index) => {
              const crowd = crowdData[stop.mandal.id];
              const st: CrowdStatus = crowd?.status || "none";

              return (
                <Link
                  key={stop.mandal.id}
                  href={`/ganpati/${stop.mandal.id}`}
                  className="flex items-center gap-3 p-3.5 rounded-[18px] bg-[var(--card-bg)] border-[1.5px] border-[var(--border)] active:scale-[0.99] transition-transform"
                >
                  {/* Number Badge (1, 2, 3...) */}
                  <div className="w-8 h-8 rounded-full bg-[var(--accent)] text-white font-baloo font-extrabold text-sm flex items-center justify-center flex-shrink-0 shadow-sm">
                    {index + 1}
                  </div>

                  {/* Mandal info */}
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <h3 className="text-sm font-extrabold font-baloo text-[var(--text)] truncate">
                      {stop.mandal.name}
                    </h3>

                    <div className="flex items-center gap-2 text-[11px] font-baloo text-[var(--muted)]">
                      <span>{stop.mandal.area}</span>
                      <span>•</span>
                      <span className="text-[var(--accent)] font-bold">
                        {index === 0
                          ? "Starting point"
                          : `~${stop.walkMinutesToNext} min walk leg`}
                      </span>
                    </div>
                  </div>

                  {/* Queue Wait Time & Status */}
                  <div className="flex flex-col items-end flex-shrink-0 space-y-0.5">
                    <CrowdBadge status={st} isEstimated={crowd?.isEstimated} size="sm" />
                    {crowd?.waitMinutes && !crowd.isEstimated ? (
                      <span className="text-[10px] font-baloo text-[var(--muted)]">
                        ~{formatMinutes(crowd.waitMinutes)} wait
                      </span>
                    ) : null}
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Clear Darshan Option */}
        {routeStops.length > 0 && (
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={clearPlan}
              className="inline-flex items-center gap-1.5 text-xs font-bold font-baloo text-[var(--muted)] hover:text-red-600 transition-colors"
            >
              <Trash2 size={13} />
              Clear darshan plan
            </button>
          </div>
        )}
      </div>

      {/* Sticky Bottom Google Maps Button */}
      {routeStops.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-50 bg-[var(--surface)] border-t-[1.5px] border-[var(--border)] p-3.5 pb-[max(env(safe-area-inset-bottom,0px)+12px,16px)] max-w-md mx-auto shadow-2xl">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-[58px] rounded-[16px] bg-[#4285F4] hover:bg-[#3367D6] text-white text-[18px] font-extrabold font-baloo flex items-center justify-center gap-2.5 active:scale-[0.98] transition-all shadow-lg"
          >
            <Navigation size={20} className="fill-white" />
            {legs.length > 1
              ? `Open Leg ${activeLegIndex + 1} in Google Maps →`
              : "Open Route in Google Maps →"}
          </a>
        </div>
      )}
    </div>
  );
}

export default function PlanPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto min-h-screen bg-[var(--bg)] flex items-center justify-center text-sm font-bold font-baloo">
          Loading darshan plan...
        </div>
      }
    >
      <PlanPageContent />
    </Suspense>
  );
}
