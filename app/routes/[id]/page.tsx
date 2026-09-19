"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Navigation,
  Clock,
  Footprints,
  Check,
  Plus,
  Compass,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import dynamic from "next/dynamic";
import { getCuratedRouteById, getRouteTime, formatMinutes } from "@/lib/curatedRoutes";
import { getMandalById, haversine } from "@/lib/mandals";
import { Mandal, LiveCrowd, CrowdStatus } from "@/lib/types";
import { subscribeToLiveCrowd } from "@/lib/firebase";
import CrowdBadge, { CROWD_CONFIG } from "@/components/CrowdBadge";
import { RouteStop, buildGoogleMapsURL } from "@/lib/routeBuilder";

const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#120800] flex items-center justify-center text-xs text-orange-200 font-baloo">
      Loading route map...
    </div>
  ),
});

export default function RouteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const routeId = Array.isArray(params.id) ? params.id[0] : params.id;

  const route = useMemo(() => (routeId ? getCuratedRouteById(routeId) : undefined), [routeId]);
  const [crowdData, setCrowdData] = useState<Record<string, LiveCrowd>>({});
  const [isSavedInPlan, setIsSavedInPlan] = useState(false);
  const [planToast, setPlanToast] = useState<string | null>(null);

  // Poll /api/crowd
  useEffect(() => {
    fetch("/api/crowd")
      .then((res) => res.json())
      .then((data) => setCrowdData((prev) => ({ ...prev, ...data })))
      .catch(() => {});

    const unsubscribe = subscribeToLiveCrowd((data) => {
      setCrowdData((prev) => ({ ...prev, ...(data || {}) }));
    });
    return () => unsubscribe();
  }, []);

  // Check if all stopIds are already saved in pg.plan
  useEffect(() => {
    if (!route) return;
    try {
      const plan: string[] = JSON.parse(localStorage.getItem("pg.plan") || "[]");
      const allIn = route.stopIds.every((id) => plan.includes(id));
      setIsSavedInPlan(allIn);
    } catch {}
  }, [route]);

  if (!route) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-[var(--bg)] p-6 flex flex-col items-center justify-center text-center space-y-4">
        <p className="text-xl font-extrabold font-baloo text-[var(--text)]">
          Route not found
        </p>
        <Link
          href="/routes"
          className="h-[52px] px-6 rounded-[14px] bg-[var(--accent)] text-white text-base font-extrabold font-baloo inline-flex items-center justify-center"
        >
          View All Routes
        </Link>
      </div>
    );
  }

  // Build RouteStops with leg walking times
  const mandalStops: Mandal[] = route.stopIds
    .map((id) => getMandalById(id))
    .filter(Boolean) as Mandal[];

  const routeStops: RouteStop[] = mandalStops.map((mandal, index) => {
    let walkMins = 4;
    let distM = 200;
    if (index > 0) {
      const prev = mandalStops[index - 1];
      distM = Math.round(haversine({ lat: prev.lat, lng: prev.lng }, { lat: mandal.lat, lng: mandal.lng }));
      walkMins = Math.max(1, Math.round(distM / 1.2 / 60));
    }

    const crowd = crowdData[mandal.id];
    let queueMins = 10;
    if (crowd?.waitMinutes) queueMins = crowd.waitMinutes;
    else if (crowd?.status === "short") queueMins = 5;
    else if (crowd?.status === "heavy") queueMins = 35;

    return {
      mandal,
      walkMinutesToNext: walkMins,
      queueMinutes: queueMins,
      totalTimeAtStop: queueMins + 10,
      distanceMeters: distM,
    };
  });

  const totalMinutes = getRouteTime(route, crowdData);
  const totalDurationStr = formatMinutes(totalMinutes);
  const totalDistKm = (route.distanceMetres / 1000).toFixed(1);

  // Google Maps Export URL
  const googleMapsUrl = buildGoogleMapsURL(null, routeStops);

  // Add all stopIds to pg.plan
  const handleAddAllToPlan = () => {
    try {
      localStorage.setItem("pg.plan", JSON.stringify(route.stopIds));
      localStorage.setItem(
        "pg.plan_meta",
        JSON.stringify({
          routeId: route.id,
          title: route.name,
        })
      );
      setIsSavedInPlan(true);
      setPlanToast("Added all stops to your darshan plan! ✦");
      setTimeout(() => setPlanToast(null), 2500);
    } catch {}
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[var(--bg)] pb-36 font-sans relative">
      {/* Toast */}
      {planToast && (
        <div className="fixed bottom-24 inset-x-4 z-50 max-w-sm mx-auto p-3.5 rounded-[16px] bg-[var(--accent)] text-white font-baloo font-bold text-sm flex items-center justify-center gap-2 shadow-2xl animate-in fade-in duration-150">
          <Check size={18} />
          <span>{planToast}</span>
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

        <h1 className="text-base font-extrabold font-baloo text-[var(--text)] truncate max-w-[200px]">
          {route.name}
        </h1>

        <Link
          href="/routes"
          className="text-xs font-extrabold font-baloo text-[var(--accent)] hover:underline"
        >
          All routes
        </Link>
      </div>

      {/* Small Map Section (~200px) */}
      <div className="relative w-full h-[200px] bg-[#120800] border-y border-[var(--border)] overflow-hidden">
        <Map
          mandals={mandalStops}
          showNumbers={true}
          center={mandalStops[0] ? [mandalStops[0].lng, mandalStops[0].lat] : [73.8567, 18.5204]}
          zoom={14.5}
          className="w-full h-full"
        />

        <div className="absolute top-2.5 left-2.5 z-10 px-3 py-1 rounded-full bg-black/75 backdrop-blur-sm text-white text-[11px] font-bold font-baloo shadow">
          {mandalStops.length} Stops Sequence
        </div>
      </div>

      {/* Route Info & Stats Bar */}
      <div className="p-4 space-y-3">
        <div className="space-y-1">
          <h2 className="text-2xl font-extrabold font-baloo text-[var(--text)] leading-tight">
            {route.name}
          </h2>
          <p className="text-xs font-baloo leading-relaxed text-[var(--muted)]">
            {route.description}
          </p>
        </div>

        {/* Stats card */}
        <div className="p-4 rounded-[18px] bg-[var(--surface)] border-[1.5px] border-[var(--border)] flex items-center justify-around text-center shadow-sm">
          <div>
            <div className="text-xl font-extrabold font-baloo text-[var(--text)]">
              {totalDistKm} km
            </div>
            <div className="text-[11px] font-baloo text-[var(--muted)]">Total Walk</div>
          </div>

          <div className="w-[1px] h-8 bg-[var(--border)]" />

          <div>
            <div className="text-xl font-extrabold font-baloo text-[var(--accent)]">
              {totalDurationStr}
            </div>
            <div className="text-[11px] font-baloo text-[var(--muted)]">Est. Total Time</div>
          </div>

          <div className="w-[1px] h-8 bg-[var(--border)]" />

          <div>
            <div className="text-xl font-extrabold font-baloo text-[var(--text)]">
              {mandalStops.length}
            </div>
            <div className="text-[11px] font-baloo text-[var(--muted)]">Mandals</div>
          </div>
        </div>

        {/* Add All To Darshan Plan Button */}
        <button
          type="button"
          onClick={handleAddAllToPlan}
          className={`w-full h-[50px] rounded-[14px] border-2 text-sm font-extrabold font-baloo flex items-center justify-center gap-2 active:scale-[0.98] transition-all ${
            isSavedInPlan
              ? "bg-emerald-50 border-emerald-500 text-emerald-800"
              : "bg-[var(--surface)] border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent-bg)]"
          }`}
        >
          {isSavedInPlan ? (
            <>
              <Check size={16} /> Stops Saved in Your Darshan Plan
            </>
          ) : (
            <>
              <Plus size={16} /> Add All {mandalStops.length} Stops to My Darshan
            </>
          )}
        </button>
      </div>

      {/* Stops Sequence List */}
      <div className="px-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold font-baloo text-[var(--text)]">
            Stops in Visit Order ({mandalStops.length})
          </h3>
          <span className="text-[11px] font-baloo text-[var(--muted)]">
            Live crowd & wait times
          </span>
        </div>

        <div className="space-y-2">
          {routeStops.map((stop, index) => {
            const crowd = crowdData[stop.mandal.id];
            const st: CrowdStatus = crowd?.status || "none";

            return (
              <Link
                key={stop.mandal.id}
                href={`/ganpati/${stop.mandal.id}`}
                className="flex items-center gap-3 p-3.5 rounded-[16px] bg-[var(--card-bg)] border-[1.5px] border-[var(--border)] active:scale-[0.99] transition-transform"
              >
                {/* Number Badge */}
                <div className="w-7 h-7 rounded-full bg-[var(--accent)] text-white font-baloo font-extrabold text-xs flex items-center justify-center flex-shrink-0">
                  {index + 1}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 space-y-0.5">
                  <h4 className="text-sm font-extrabold font-baloo text-[var(--text)] truncate">
                    {stop.mandal.name}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] font-baloo text-[var(--muted)]">
                    <span>{stop.mandal.area}</span>
                    <span>•</span>
                    <span className="text-[var(--accent)] font-bold">
                      {index === 0 ? "Start" : `~${stop.walkMinutesToNext}m walk leg`}
                    </span>
                  </div>
                </div>

                {/* Crowd Badge */}
                <div className="flex flex-col items-end flex-shrink-0 space-y-0.5">
                  <CrowdBadge status={st} isEstimated={crowd?.isEstimated} size="sm" />
                  {crowd?.waitMinutes && !crowd.isEstimated ? (
                    <span className="text-[10px] font-baloo text-[var(--muted)]">
                      ~{crowd.waitMinutes}m wait
                    </span>
                  ) : null}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Sticky Bottom Google Maps Button */}
      <div className="fixed bottom-0 inset-x-0 z-50 bg-[var(--surface)] border-t-[1.5px] border-[var(--border)] p-3.5 pb-[max(env(safe-area-inset-bottom,0px)+12px,16px)] max-w-md mx-auto shadow-2xl">
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full h-[56px] rounded-[16px] bg-[#4285F4] hover:bg-[#3367D6] text-white text-[18px] font-extrabold font-baloo flex items-center justify-center gap-2.5 active:scale-[0.98] transition-all shadow-lg"
        >
          <Navigation size={20} className="fill-white" />
          Open Route in Google Maps →
        </a>
      </div>
    </div>
  );
}
