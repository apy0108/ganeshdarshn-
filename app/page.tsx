"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  MapPin,
  ArrowRight,
  Compass,
  Footprints,
  Calendar,
  Sparkles,
  AlertTriangle,
  Users,
  Navigation,
  Utensils,
  BookOpen,
  Info,
  Car,
} from "lucide-react";
import { MANDALS, CURATED_ROUTES } from "@/lib/mandals";
import { LiveCrowd } from "@/lib/types";
import { subscribeToLiveCrowd } from "@/lib/firebase";
import MandalCard from "@/components/MandalCard";
import CrowdBadge, { CROWD_CONFIG } from "@/components/CrowdBadge";
import { MAHAPRASAD_LIST } from "@/lib/mahaprasad";

// Festival Day counter calculation (Festival: Sep 27 - Oct 8, 12 days)
function getFestivalDayInfo() {
  const now = new Date();
  const year = now.getFullYear();
  const festivalStart = new Date(year, 8, 27); // Sep 27
  const festivalEnd = new Date(year, 9, 8, 23, 59, 59); // Oct 8

  const startMs = festivalStart.getTime();
  const endMs = festivalEnd.getTime();
  const currentMs = now.getTime();

  if (currentMs < startMs) {
    const diffDays = Math.ceil((startMs - currentMs) / (1000 * 60 * 60 * 24));
    return {
      pill: `Festival in ${diffDays} day${diffDays > 1 ? "s" : ""}`,
      banner: `Festival begins in ${diffDays} days (Sep 27 – Oct 8)`,
      status: "upcoming",
    };
  } else if (currentMs <= endMs) {
    const dayNumber = Math.min(
      12,
      Math.max(1, Math.floor((currentMs - startMs) / (1000 * 60 * 60 * 24)) + 1)
    );
    return {
      pill: `Day ${dayNumber} of 12`,
      banner: `Day ${dayNumber} of 12 · Pune Ganeshotsav Active`,
      status: "active",
    };
  } else {
    return {
      pill: "Festival Ended",
      banner: "Festival has ended for this year.",
      status: "ended",
    };
  }
}

export default function HomePage() {
  const festivalInfo = useMemo(() => getFestivalDayInfo(), []);
  const [crowdData, setCrowdData] = useState<Record<string, LiveCrowd>>({});

  useEffect(() => {
    // Fetch initial state from /api/crowd
    fetch("/api/crowd")
      .then((res) => res.json())
      .then((data) => {
        setCrowdData((prev) => ({ ...prev, ...data }));
      })
      .catch(() => {});

    // Realtime Firebase subscription
    const unsubscribe = subscribeToLiveCrowd((data) => {
      setCrowdData((prev) => ({ ...prev, ...(data || {}) }));
    });
    return () => unsubscribe();
  }, []);

  // Shortest queues: top 3 mandals with 'short' status, most recently reported
  const shortestQueues = useMemo(() => {
    const mandalsWithReports = MANDALS.map((m) => ({
      mandal: m,
      report: crowdData[m.id] || { mandalId: m.id, status: "none" as const, reportCount: 0, reportedAt: 0 },
    }));

    const shorts = mandalsWithReports.filter((item) => item.report.status === "short");
    if (shorts.length > 0) {
      return shorts
        .sort((a, b) => (b.report.reportedAt || 0) - (a.report.reportedAt || 0))
        .slice(0, 3);
    }

    return mandalsWithReports.slice(0, 3);
  }, [crowdData]);

  // Heavy queue count
  const heavyCount = useMemo(() => {
    return Object.values(crowdData).filter((c) => c.status === "heavy").length;
  }, [crowdData]);

  // Famous mandals for grid
  const famousList = useMemo(() => {
    return MANDALS.filter(
      (m) => m.categories.includes("famous") || m.categories.includes("manache")
    ).slice(0, 6);
  }, []);

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[var(--bg)] pb-28 font-sans">
      {/* Top Bar with Festival Countdown / Status Banner */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent-bg)] text-[var(--accent)] font-baloo font-bold text-[12px] border border-orange-200">
          <Calendar size={13} />
          <span>{festivalInfo.banner}</span>
        </div>

        <div className="text-[13px] font-marathi font-semibold text-[var(--muted)]">
          पुणे गणेशोत्सव
        </div>
      </div>

      {/* Hero Section */}
      <section className="px-4 py-5 space-y-4">
        <div className="space-y-1">
          <p className="text-sm font-marathi text-[var(--muted)] font-medium">
            पुण्याचा गणपती
          </p>
          <h1 className="text-[34px] font-extrabold font-baloo text-[var(--text)] leading-[1.1] tracking-tight">
            Experience Pune's Ganpati
          </h1>
          <p className="text-[15px] font-baloo text-[var(--muted)] pt-0.5">
            Find what's near you, check queues & plan a walkable darshan.
          </p>
        </div>

        {/* Two BIG Action Buttons */}
        <div className="space-y-2.5 pt-1">
          <Link
            href="/map"
            className="w-full h-[56px] rounded-[16px] bg-[var(--accent)] text-white text-[18px] font-extrabold font-baloo flex items-center justify-center gap-2.5 active:scale-[0.98] transition-transform shadow-md"
          >
            <span>🗺</span> Open Map
          </Link>

          <Link
            href="/start"
            className="w-full h-[56px] rounded-[16px] bg-[var(--surface)] border-2 border-[var(--accent)] text-[var(--accent)] text-[18px] font-extrabold font-baloo flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-sm"
          >
            <span>✦</span> Build My Route
          </Link>
        </div>

        {/* Quick Traffic & How to Use Grid */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <Link
            href="/parking"
            className="p-3 rounded-[16px] bg-blue-50/90 border border-blue-200 active:scale-[0.98] transition-transform space-y-1"
          >
            <div className="flex items-center gap-1.5 text-blue-900 font-extrabold font-baloo text-xs">
              <Car size={14} className="text-blue-700" />
              <span>Parking & Traffic</span>
            </div>
            <p className="text-[10px] font-baloo text-blue-700/80 leading-tight">
              23 lots · 13 road closures
            </p>
          </Link>

          <Link
            href="/how-to-use"
            className="p-3 rounded-[16px] bg-orange-50/90 border border-orange-200 active:scale-[0.98] transition-transform space-y-1"
          >
            <div className="flex items-center gap-1.5 text-orange-900 font-extrabold font-baloo text-xs">
              <BookOpen size={14} className="text-[var(--accent)]" />
              <span>How to Use</span>
            </div>
            <p className="text-[10px] font-baloo text-orange-700/80 leading-tight">
              5-step darshan guide
            </p>
          </Link>
        </div>
      </section>

      {/* LIVE CROWD Section */}
      <section className="px-4 py-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[20px] font-extrabold font-baloo text-[var(--text)] leading-tight">
              Live Queue Status
            </h2>
            <p className="text-xs font-marathi text-[var(--muted)]">
              थेट दर्शन रांग स्थिती • Shortest queues
            </p>
          </div>

          {heavyCount > 0 && (
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 text-red-800 text-xs font-extrabold font-baloo">
              <AlertTriangle size={12} /> {heavyCount} heavy queue{heavyCount > 1 ? "s" : ""}
            </div>
          )}
        </div>

        {/* Status Legend */}
        <div className="p-3 rounded-[14px] bg-[var(--surface)] border border-[var(--border)] flex items-center justify-around text-xs font-baloo text-[var(--muted)]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#166534]" />
            <span>Short: Straight in</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#92400E]" />
            <span>Moving: Flowing</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#991B1B]" />
            <span>Heavy: 30+ min</span>
          </div>
        </div>

        {/* 3 Rows Shortest Queues */}
        <div className="space-y-2">
          {shortestQueues.map(({ mandal, report }) => {
            const config = CROWD_CONFIG[report.status] || CROWD_CONFIG.none;

            return (
              <Link
                key={mandal.id}
                href={`/ganpati/${mandal.id}`}
                className="flex items-center justify-between p-3.5 rounded-[16px] bg-[var(--card-bg)] border border-[var(--border)] active:scale-[0.99] transition-transform"
                style={{ borderLeftWidth: "4px", borderLeftColor: config.color }}
              >
                <div className="space-y-0.5 pr-2">
                  <div className="text-base font-extrabold font-baloo text-[var(--text)] leading-tight">
                    {mandal.name}
                  </div>
                  <div className="text-xs text-[var(--muted)] font-marathi">
                    {mandal.nameMarathi} • {mandal.area}
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <CrowdBadge status={report.status} size="sm" />
                </div>
              </Link>
            );
          })}
        </div>

        <div className="pt-1">
          <Link
            href="/explore"
            className="inline-flex items-center gap-1 text-sm font-extrabold font-baloo text-[var(--accent)] hover:underline"
          >
            View all 30 mandals →
          </Link>
        </div>
      </section>

      {/* Plan Your Visit ("Curated Routes" Section) */}
      <section className="py-4 space-y-3">
        <div className="px-4 flex items-center justify-between">
          <div>
            <h2 className="text-[20px] font-extrabold font-baloo text-[var(--text)] leading-tight">
              Plan Your Visit
            </h2>
            <p className="text-xs font-marathi text-[var(--muted)]">
              निवडक दर्शन मार्ग
            </p>
          </div>
          <Link
            href="/routes"
            className="text-xs font-extrabold font-baloo text-[var(--accent)] hover:underline"
          >
            See all 6 routes →
          </Link>
        </div>

        {/* Horizontal scroll of route cards */}
        <div className="flex items-stretch gap-3 overflow-x-auto no-scrollbar px-4 pt-1 pb-2">
          {CURATED_ROUTES.map((route) => (
            <Link
              key={route.id}
              href={`/plan?route=${route.id}`}
              className="flex-shrink-0 w-[260px] p-4 rounded-[20px] bg-[var(--card-bg)] border-[1.5px] border-[var(--border)] flex flex-col justify-between space-y-3 active:scale-[0.98] transition-transform"
            >
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--accent-bg)] text-[var(--accent)] text-[11px] font-bold font-baloo">
                  <Footprints size={12} /> {route.mandalCount} Stops
                </div>
                <h3 className="text-base font-extrabold font-baloo text-[var(--text)] leading-snug">
                  {route.title}
                </h3>
                <p className="text-xs text-[var(--muted)] line-clamp-2 font-baloo">
                  {route.tagline}
                </p>
              </div>

              <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between text-xs font-bold font-baloo text-[var(--muted)]">
                <span>{route.approxDistance}</span>
                <span>•</span>
                <span>{route.approxWalkTime}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* MAHAPRASAD SECTION */}
      <section className="px-4 py-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[20px] font-extrabold font-baloo text-[var(--text)] leading-tight flex items-center gap-2">
              <Utensils size={18} className="text-[var(--accent)]" />
              Mahaprasad
            </h2>
            <p className="text-xs font-marathi text-[var(--muted)]">
              महाप्रसाद व अन्नछत्र माहिती
            </p>
          </div>
        </div>

        {/* Mahaprasad List */}
        <div className="space-y-2.5">
          {MAHAPRASAD_LIST.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-[18px] bg-[var(--surface)] border border-[var(--border)] shadow-sm space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-extrabold font-baloo text-[var(--text)]">
                    {item.mandalName}
                  </h3>
                  <div className="text-[11px] font-marathi text-[var(--muted)]">
                    {item.mandalNameMarathi} • {item.area}
                  </div>
                </div>

                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${item.lat},${item.lng}&travelmode=walking`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--accent-bg)] text-[var(--accent)] text-xs font-extrabold font-baloo hover:bg-orange-100 active:scale-95 transition-all flex-shrink-0"
                >
                  <Navigation size={11} /> Directions
                </a>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold font-baloo text-amber-900 bg-amber-50/80 px-2.5 py-1 rounded-[10px] border border-amber-200/60">
                <span>🕒 {item.timeRange}</span>
                <span>•</span>
                <span className="truncate">{item.frequency}</span>
              </div>

              {item.itemDescription && (
                <p className="text-[11px] font-baloo text-[var(--muted)] leading-snug">
                  {item.itemDescription}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <p className="text-[11px] font-baloo text-[var(--muted)] italic pt-1 text-center">
          "As announced by the mandals. Mahaprasad ends when it ends — this is not a live view."
        </p>
      </section>

      {/* Famous Mandals Section */}
      <section className="px-4 py-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[20px] font-extrabold font-baloo text-[var(--text)] leading-tight">
              Famous Mandals
            </h2>
            <p className="text-xs font-marathi text-[var(--muted)]">
              प्रसिद्ध व मानाचे गणपती
            </p>
          </div>
          <Link
            href="/explore"
            className="text-xs font-extrabold font-baloo text-[var(--accent)] hover:underline"
          >
            See all ({MANDALS.length})
          </Link>
        </div>

        {/* 2-Column Grid of Mandal Cards with Real Photos */}
        <div className="grid grid-cols-2 gap-3">
          {famousList.map((mandal) => (
            <MandalCard
              key={mandal.id}
              mandal={mandal}
              crowd={crowdData[mandal.id]}
              badgePosition="content-top"
            />
          ))}
        </div>
      </section>

      {/* Footer Info Links */}
      <footer className="px-4 pt-6 pb-4 border-t border-[var(--border)] text-center space-y-2">
        <div className="flex items-center justify-center gap-4 text-xs font-bold font-baloo text-[var(--muted)]">
          <Link href="/about" className="hover:text-[var(--accent)]">
            About & Privacy
          </Link>
          <span>•</span>
          <Link href="/how-to-use" className="hover:text-[var(--accent)]">
            How to Use
          </Link>
          <span>•</span>
          <Link href="/parking" className="hover:text-[var(--accent)]">
            Parking
          </Link>
          <span>•</span>
          <Link href="/routes" className="hover:text-[var(--accent)]">
            Routes
          </Link>
        </div>
        <p className="text-[11px] font-baloo text-[var(--muted)]">
          Built for Pune Ganeshotsav Devotees • Non-commercial
        </p>
      </footer>
    </div>
  );
}
