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
  Search,
  X,
  CheckCircle2,
} from "lucide-react";
import { MANDALS, CURATED_ROUTES } from "@/lib/mandals";
import { LiveCrowd, Mandal } from "@/lib/types";
import { subscribeToLiveCrowd } from "@/lib/firebase";
import MandalCard from "@/components/MandalCard";
import CrowdBadge from "@/components/CrowdBadge";
import { getFestivalDayInfo } from "@/lib/festival";
import { useLanguage } from "@/context/LanguageContext";

interface ToastState {
  show: boolean;
  message: string;
  mandalName?: string;
}

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [festivalInfo, setFestivalInfo] = useState(() => getFestivalDayInfo());
  const [crowdData, setCrowdData] = useState<Record<string, LiveCrowd>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState<ToastState>({ show: false, message: "" });
  const { t, language } = useLanguage();

  useEffect(() => {
    setMounted(true);
    setFestivalInfo(getFestivalDayInfo());

    // Fetch live crowd state for badges
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

  // Listen to mandal-plan-update custom event from MandalCards
  useEffect(() => {
    const handlePlanUpdate = (e: any) => {
      const { mandal, isAdded } = e.detail || {};
      if (!mandal) return;

      if (isAdded) {
        setToast({
          show: true,
          message: t("toast_added", { name: mandal.name }),
          mandalName: mandal.name,
        });
      } else {
        setToast({
          show: true,
          message: t("toast_removed", { name: mandal.name }),
          mandalName: mandal.name,
        });
      }

      // Auto-hide after 4 seconds
      setTimeout(() => {
        setToast((prev) => ({ ...prev, show: false }));
      }, 4000);
    };

    window.addEventListener("mandal-plan-update", handlePlanUpdate);
    return () => window.removeEventListener("mandal-plan-update", handlePlanUpdate);
  }, [t]);

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

  // Famous mandals for grid
  const famousList = useMemo(() => {
    return MANDALS.filter(
      (m) => m.categories.includes("famous") || m.categories.includes("manache")
    ).slice(0, 6);
  }, []);

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[var(--bg)] pb-28 font-sans">
      {/* Toast Notification for Adding to Darshan */}
      {toast.show && (
        <aside
          aria-label="Darshan notification"
          className="fixed bottom-20 inset-x-4 z-50 max-w-sm mx-auto p-3.5 rounded-[18px] bg-[var(--surface)] text-[var(--text)] border-[1.5px] border-[var(--accent)] shadow-2xl flex items-start justify-between gap-3 animate-in slide-in-from-bottom-5 duration-200"
        >
          <div className="flex items-start gap-2.5">
            <CheckCircle2 size={20} className="text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-baloo font-bold text-[var(--text)] leading-snug">
                {toast.message}
              </p>
              <Link
                href="/saved"
                className="inline-flex items-center gap-1 text-[11px] font-extrabold font-baloo text-[var(--accent)] hover:underline"
              >
                <span>{t("view_saved")}</span>
                <ArrowRight size={12} />
              </Link>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setToast((prev) => ({ ...prev, show: false }))}
            className="text-[var(--muted)] hover:text-[var(--text)] p-1 -mr-1 -mt-1"
            aria-label="Close notification"
          >
            <X size={15} />
          </button>
        </aside>
      )}

      {/* Top Bar with Festival Countdown / Status Banner (NO DUPLICATE MENU BUTTON) */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent-bg)] text-[var(--accent)] font-baloo font-bold text-[12px] border border-orange-200">
          <Calendar size={13} />
          <span suppressHydrationWarning>
            {festivalInfo.status === "active" && festivalInfo.dayNumber
              ? t("festival_banner_active", { day: festivalInfo.dayNumber })
              : festivalInfo.status === "upcoming"
              ? t("festival_banner_upcoming", { days: festivalInfo.pill.replace(/\D/g, "") || "1" })
              : t("festival_banner_ended")}
          </span>
        </div>

        <div>
          <span className="text-[13px] font-marathi font-semibold text-[var(--muted)]">
            {t("festival_header_title")}
          </span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="px-4 py-5 space-y-4">
        <div className="space-y-1">
          <p className="text-sm font-marathi text-[var(--muted)] font-medium">
            पुण्याचा गणपती
          </p>
          <h1 className="text-[34px] font-extrabold font-baloo text-[var(--text)] leading-[1.1] tracking-tight">
            {t("festival_tagline")}
          </h1>
          <p className="text-[15px] font-baloo text-[var(--muted)] pt-0.5">
            {t("festival_subtagline")}
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
              placeholder={t("search_placeholder")}
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
                      {t("view_all_explore")}
                    </Link>
                  </div>
                </>
              ) : (
                <div className="py-6 text-center text-xs font-baloo text-[var(--muted)]">
                  {t("no_results")} "{searchQuery}"
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
            <span>🗺</span> {t("open_map")}
          </Link>

          <Link
            href="/start"
            className="w-full h-[56px] rounded-[16px] bg-[var(--surface)] border-2 border-[var(--accent)] text-[var(--accent)] text-[18px] font-extrabold font-baloo flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-sm"
          >
            <span>🙏</span> {t("plan_darshan")}
          </Link>
        </div>
      </section>

      {/* Darshan Plans ("Curated Routes" Section) */}
      <section className="py-4 space-y-3">
        <div className="px-4 flex items-center justify-between">
          <div>
            <h2 className="text-[20px] font-extrabold font-baloo text-[var(--text)] leading-tight">
              {t("darshan_plans")}
            </h2>
            <p className="text-xs font-marathi text-[var(--muted)]">
              {t("darshan_plans_sub")}
            </p>
          </div>
          <Link
            href="/routes"
            className="text-xs font-extrabold font-baloo text-[var(--accent)] hover:underline"
          >
            {t("see_all_routes")}
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
                  <Footprints size={12} /> {route.mandalCount} {t("stops_label")}
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
              {t("famous_mandals")}
            </h2>
            <p className="text-xs font-marathi text-[var(--muted)]">
              {t("famous_mandals_sub")}
            </p>
          </div>
          <Link
            href="/explore"
            className="text-xs font-extrabold font-baloo text-[var(--accent)] hover:underline"
          >
            {t("see_all_mandals")}
          </Link>
        </div>

        {/* 2-Column Grid of Mandal Cards with Real Photos & "+ Add" */}
        <div className="grid grid-cols-2 gap-3">
          {famousList.map((mandal) => (
            <MandalCard
              key={mandal.id}
              mandal={mandal}
              crowd={crowdData[mandal.id]}
              badgePosition="content-top"
              actionVariant="add-button"
            />
          ))}
        </div>
      </section>

      {/* Footer Info Links */}
      <footer className="px-4 pt-6 pb-4 border-t border-[var(--border)] text-center space-y-2">
        <div className="flex items-center justify-center gap-4 text-xs font-bold font-baloo text-[var(--muted)]">
          <Link href="/about" className="hover:text-[var(--accent)]">
            {t("about_privacy")}
          </Link>
          <span>•</span>
          <Link href="/how-to-use" className="hover:text-[var(--accent)]">
            {t("how_to_use")}
          </Link>
          <span>•</span>
          <Link href="/parking" className="hover:text-[var(--accent)]">
            {t("parking_closures")}
          </Link>
          <span>•</span>
          <Link href="/routes" className="hover:text-[var(--accent)]">
            {t("curated_routes")}
          </Link>
        </div>
        <p className="text-[11px] font-baloo text-[var(--muted)]">
          {t("footer_tagline")} • {t("footer_subtagline")}
        </p>
      </footer>
    </div>
  );
}
