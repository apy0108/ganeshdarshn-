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
  BookOpen,
  Info,
  Search,
  X,
  Menu,
} from "lucide-react";
import { MANDALS, CURATED_ROUTES } from "@/lib/mandals";
import { LiveCrowd } from "@/lib/types";
import { subscribeToLiveCrowd } from "@/lib/firebase";
import MandalCard from "@/components/MandalCard";
import CrowdBadge, { CROWD_CONFIG } from "@/components/CrowdBadge";
import { getFestivalDayInfo } from "@/lib/festival";

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [festivalInfo, setFestivalInfo] = useState(() => getFestivalDayInfo());
  const [crowdData, setCrowdData] = useState<Record<string, LiveCrowd>>({});
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setMounted(true);
    setFestivalInfo(getFestivalDayInfo());

    // Fetch live crowd state
    fetch("/api/crowd")
      .then((res) => res.json())
      .then((data) => setCrowdData((prev) => ({ ...prev, ...data })))
      .catch(() => {});

    // Realtime Firebase subscription
    const unsubscribe = subscribeToLiveCrowd((data) => {
      setCrowdData((prev) => ({ ...prev, ...(data || {}) }));
    });
    return () => unsubscribe();
  }, []);

  // Filter search results across all mandals
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();

    return MANDALS.filter((m) => {
      const nameMatch = m.name.toLowerCase().includes(q);
      const marathiMatch = m.nameMarathi.includes(q);
      const areaMatch = m.area.toLowerCase().includes(q);
      const catMatch = m.categories.some((c) => c.toLowerCase().includes(q));
      return nameMatch || marathiMatch || areaMatch || catMatch;
    }).slice(0, 6);
  }, [searchQuery]);

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
      {/* Top Bar with Festival Countdown / Status Banner & Menu */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent-bg)] text-[var(--accent)] font-baloo font-bold text-[12px] border border-orange-200">
          <Calendar size={13} />
          <span suppressHydrationWarning>{festivalInfo.banner}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[13px] font-marathi font-semibold text-[var(--muted)]">
            पुणे गणेशोत्सव
          </span>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("open-sidenav"))}
            className="w-8 h-8 rounded-full bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] flex items-center justify-center hover:bg-[var(--accent-bg)] active:scale-95 transition-all shadow-sm"
            aria-label="Open Menu"
            title="Menu"
          >
            <Menu size={16} />
          </button>
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

        {/* Homepage Quick Search Bar */}
        <div className="relative pt-1">
          <div className="relative flex items-center">
            <Search size={18} className="absolute left-3.5 text-[var(--muted)] pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 Search Ganpati, area or mandal"
              className="w-full h-[50px] pl-10 pr-10 rounded-[14px] bg-[var(--surface)] border-[1.5px] border-[var(--border)] text-[var(--text)] font-baloo text-sm placeholder:text-[var(--muted)] placeholder:font-medium focus:outline-none focus:border-[var(--accent)] shadow-sm transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 p-1 rounded-full text-[var(--muted)] hover:text-[var(--text)]"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Instant Search Results Dropdown */}
          {searchQuery.trim() && (
            <div className="absolute top-full inset-x-0 mt-1.5 z-30 max-h-80 overflow-y-auto rounded-[18px] bg-[var(--surface)] border-[1.5px] border-[var(--border)] shadow-2xl p-2 space-y-1">
              {searchResults.length > 0 ? (
                <>
                  {searchResults.map((m) => (
                    <Link
                      key={m.id}
                      href={`/ganpati/${m.id}`}
                      onClick={() => setSearchQuery("")}
                      className="flex items-center justify-between p-2.5 rounded-[12px] hover:bg-[var(--accent-bg)] active:scale-[0.99] transition-all"
                    >
                      <div className="space-y-0.5">
                        <div className="text-sm font-extrabold font-baloo text-[var(--text)] leading-tight">
                          {m.name}
                        </div>
                        <div className="text-xs font-marathi text-[var(--muted)]">
                          {m.nameMarathi} • {m.area}
                        </div>
                      </div>
                      <CrowdBadge
                        status={crowdData[m.id]?.status}
                        isEstimated={crowdData[m.id]?.isEstimated}
                        size="sm"
                      />
                    </Link>
                  ))}
                  <div className="pt-2 border-t border-[var(--border)] px-2 pb-1 text-center">
                    <Link
                      href={`/explore?q=${encodeURIComponent(searchQuery)}`}
                      onClick={() => setSearchQuery("")}
                      className="text-xs font-extrabold font-baloo text-[var(--accent)] hover:underline"
                    >
                      View all results in Explore →
                    </Link>
                  </div>
                </>
              ) : (
                <div className="py-6 text-center text-xs font-baloo text-[var(--muted)]">
                  No mandals found matching "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* Two BIG Action Buttons */}
        <div className="space-y-2.5 pt-2">
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
