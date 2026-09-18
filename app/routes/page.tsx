"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Compass,
  Footprints,
  Clock,
  ArrowRight,
  Sun,
  Sunset,
  Sparkles,
  MapPin,
  ChevronRight,
  Filter,
} from "lucide-react";
import {
  CURATED_ROUTES_DATA,
  CuratedRoute,
  getRouteTime,
  formatMinutes,
} from "@/lib/curatedRoutes";
import { LiveCrowd } from "@/lib/types";
import { subscribeToLiveCrowd } from "@/lib/firebase";

export default function RoutesPage() {
  const [crowdData, setCrowdData] = useState<Record<string, LiveCrowd>>({});
  const [viewMode, setViewMode] = useState<"recommended" | "all">("recommended");

  // Determine current time period:
  // 6am-12pm -> morning
  // 6pm-11pm (18-23) -> evening / night
  // Otherwise -> anytime / other
  const timeContext = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) {
      return {
        type: "morning" as const,
        label: "Good for Morning (6am – 12pm)",
        description: "Morning walking trails with shorter queues and fresh breeze.",
        icon: Sun,
      };
    } else if (hour >= 18 && hour < 23) {
      return {
        type: "evening" as const,
        label: "Good for Evening & Night (6pm – 11pm)",
        description: "Illuminated pandals, dekhavas, and lively evening atmosphere.",
        icon: Sunset,
      };
    } else {
      return {
        type: "anytime" as const,
        label: "All-Day Recommended Routes",
        description: "Curated walking trails suitable throughout the day.",
        icon: Compass,
      };
    }
  }, []);

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

  // Filter or sort routes based on time of day
  const displayedRoutes = useMemo(() => {
    if (viewMode === "all") {
      return CURATED_ROUTES_DATA;
    }

    if (timeContext.type === "morning") {
      // Show morning routes first, then anytime, then others
      return [...CURATED_ROUTES_DATA].sort((a, b) => {
        if (a.bestTime === "morning" && b.bestTime !== "morning") return -1;
        if (b.bestTime === "morning" && a.bestTime !== "morning") return 1;
        if (a.bestTime === "anytime" && b.bestTime === "evening") return -1;
        if (b.bestTime === "anytime" && a.bestTime === "evening") return 1;
        return 0;
      });
    } else if (timeContext.type === "evening") {
      // Show evening and night routes first, then anytime, then others
      return [...CURATED_ROUTES_DATA].sort((a, b) => {
        const isAEve = a.bestTime === "evening" || a.bestTime === "night";
        const isBEve = b.bestTime === "evening" || b.bestTime === "night";
        if (isAEve && !isBEve) return -1;
        if (isBEve && !isAEve) return 1;
        if (a.bestTime === "anytime" && b.bestTime === "morning") return -1;
        if (b.bestTime === "anytime" && a.bestTime === "morning") return 1;
        return 0;
      });
    }

    return CURATED_ROUTES_DATA;
  }, [viewMode, timeContext]);

  const TimeIcon = timeContext.icon;

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[var(--bg)] px-4 py-5 space-y-5 pb-28 font-sans">
      {/* Title Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-extrabold font-baloo text-[var(--text)] leading-none">
            Curated Routes
          </h1>
          <p className="text-sm font-bold font-marathi text-[var(--accent)] mt-1">
            दर्शन मार्ग
          </p>
        </div>

        <Link
          href="/start"
          className="inline-flex items-center gap-1 px-3.5 py-2 rounded-full bg-[var(--accent)] text-white text-xs font-extrabold font-baloo shadow-sm active:scale-95 transition-transform"
        >
          <span>✦</span> Custom Wizard
        </Link>
      </div>

      {/* "Good for right now" banner */}
      <div className="p-4 rounded-[20px] bg-[var(--surface)] border-[1.5px] border-[var(--border)] shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[var(--accent-bg)] text-[var(--accent)]">
              <TimeIcon size={18} />
            </div>
            <div>
              <h2 className="text-sm font-extrabold font-baloo text-[var(--text)]">
                Good for right now
              </h2>
              <span className="text-[11px] font-baloo text-[var(--muted)]">
                {timeContext.label}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setViewMode(viewMode === "recommended" ? "all" : "recommended")}
            className="text-xs font-extrabold font-baloo text-[var(--accent)] hover:underline flex items-center gap-1"
          >
            {viewMode === "recommended" ? "See all →" : "Show recommended"}
          </button>
        </div>
        <p className="text-xs font-baloo text-[var(--muted)] leading-relaxed pt-1 border-t border-[var(--border)]">
          {timeContext.description} Queue times dynamically adjusted from live reports.
        </p>
      </div>

      {/* Routes List */}
      <div className="space-y-3.5">
        {displayedRoutes.map((route) => {
          const liveMinutes = getRouteTime(route, crowdData);
          const timeStr = formatMinutes(liveMinutes);
          const distKm = (route.distanceMetres / 1000).toFixed(1);

          return (
            <Link
              key={route.id}
              href={`/routes/${route.id}`}
              className="block p-4 rounded-[20px] bg-[var(--card-bg)] border-[1.5px] border-[var(--border)] active:scale-[0.99] transition-transform space-y-3 shadow-sm hover:border-[var(--accent)]/40"
            >
              {/* Badges Row */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[var(--accent-bg)] text-[var(--accent)] text-[11px] font-extrabold font-baloo">
                    <Footprints size={12} /> {route.stopIds.length} stops
                  </span>

                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-extrabold font-baloo">
                    <Clock size={11} /> {timeStr}
                  </span>

                  {route.bestTime && route.bestTime !== "anytime" && (
                    <span className="px-2 py-0.5 rounded-full bg-[var(--bg)] border border-[var(--border)] text-[10px] font-extrabold font-baloo text-[var(--muted)] capitalize">
                      Best in {route.bestTime}
                    </span>
                  )}
                </div>

                <ChevronRight size={18} className="text-[var(--muted)] flex-shrink-0" />
              </div>

              {/* Title & Description */}
              <div className="space-y-1">
                <h3 className="text-lg font-extrabold font-baloo text-[var(--text)] leading-snug">
                  {route.name}
                </h3>
                <p className="text-xs font-baloo leading-relaxed text-[var(--muted)]">
                  {route.description}
                </p>
              </div>

              {/* Bottom Row Stats */}
              <div className="pt-2.5 border-t border-[var(--border)] flex items-center justify-between text-xs font-bold font-baloo text-[var(--muted)]">
                <span>{distKm} km walk</span>
                <span>•</span>
                <span>Live queue: {liveMinutes}m total</span>
                <span>•</span>
                <span className="text-[var(--accent)] font-extrabold">View route →</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
