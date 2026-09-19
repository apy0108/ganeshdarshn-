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
  Menu,
  CheckCircle2,
  Car,
  Shield,
  Bath,
} from "lucide-react";
import { MANDALS } from "@/lib/mandals";
import { LiveCrowd, Mandal } from "@/lib/types";
import { subscribeToLiveCrowd } from "@/lib/firebase";
import MandalCard from "@/components/MandalCard";
import CrowdBadge from "@/components/CrowdBadge";
import { getFestivalDayInfo } from "@/lib/festival";
import { useLanguage } from "@/context/LanguageContext";

import HomeHeroCarousel from "@/components/HomeHeroCarousel";

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

  const handlePendingFeature = (type: "police" | "washroom") => {
    setToast({
      show: true,
      message:
        type === "police"
          ? t("police_stations_pending")
          : t("washrooms_pending"),
    });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 4500);
  };

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

      {/* Integrated Top Bar with Menu Trigger, Festival Countdown Pill & Title (NO OVERLAP) */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {/* Top-Left Menu Trigger Button */}
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("open-sidenav"))}
            className="w-10 h-10 rounded-full bg-[var(--surface)] text-[var(--text)] border-[1.5px] border-[var(--border)] flex items-center justify-center hover:border-[var(--accent)] active:scale-95 transition-all shadow-sm flex-shrink-0"
            aria-label="Open Side Navigation Menu"
            title="Menu"
          >
            <Menu size={20} className="text-[var(--text)]" />
          </button>

          {/* Festival Day Pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent-bg)] text-[var(--accent)] font-baloo font-bold text-[11px] sm:text-[12px] border border-orange-200 truncate">
            <Calendar size={13} className="flex-shrink-0" />
            <span suppressHydrationWarning className="truncate">
              {festivalInfo.status === "active" && festivalInfo.dayNumber
                ? t("festival_banner_active", { day: festivalInfo.dayNumber })
                : festivalInfo.status === "upcoming"
                ? t("festival_banner_upcoming", { days: festivalInfo.pill.replace(/\D/g, "") || "1" })
                : t("festival_banner_ended")}
            </span>
          </div>
        </div>

        <div className="flex-shrink-0">
          <span className="text-xs sm:text-[13px] font-marathi font-semibold text-[var(--muted)]">
            {t("festival_header_title")}
          </span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="px-4 py-3 space-y-4">
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

        {/* New Ganpati Hero Carousel with Integrated Search */}
        <HomeHeroCarousel
          mandals={MANDALS}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchResults={searchResults}
          onClearSearch={() => setSearchQuery("")}
        />

        {/* Plan Your Darshan Action Button */}
        <div className="pt-0.5">
          <Link
            href="/start"
            className="w-full h-[54px] sm:h-[56px] rounded-[18px] bg-[var(--surface)] border-2 border-[var(--accent)] text-[var(--accent)] text-[18px] font-extrabold font-baloo flex items-center justify-center gap-2 active:scale-[0.98] hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-all shadow-sm"
          >
            <span>🙏</span> {t("plan_darshan")}
          </Link>
        </div>
      </section>

      {/* More Section */}
      <section className="px-4 py-4 space-y-3">
        <div>
          <h2 className="text-[20px] font-extrabold font-baloo text-[var(--text)] leading-tight">
            {t("more_section_title")}
          </h2>
          <p className="text-xs font-marathi text-[var(--muted)]">
            {t("more_section_sub")}
          </p>
        </div>

        {/* 2x2 Grid of the 4 requested options ONLY */}
        <div className="grid grid-cols-2 gap-3">
          {/* 1. Curated Routes */}
          <Link
            href="/routes"
            className="p-3.5 sm:p-4 rounded-[20px] bg-[var(--card-bg)] border-[1.5px] border-[var(--border)] shadow-sm hover:border-[var(--accent)] active:scale-[0.98] transition-all flex flex-col justify-between min-h-[100px] group"
          >
            <div className="w-10 h-10 rounded-[14px] bg-orange-100 dark:bg-orange-950/40 text-[var(--accent)] flex items-center justify-center flex-shrink-0">
              <Footprints size={22} />
            </div>
            <div className="pt-2">
              <div className="text-[15px] font-extrabold font-baloo text-[var(--text)] group-hover:text-[var(--accent)] leading-tight transition-colors">
                {t("more_curated_routes")}
              </div>
            </div>
          </Link>

          {/* 2. Parking */}
          <Link
            href="/parking"
            className="p-3.5 sm:p-4 rounded-[20px] bg-[var(--card-bg)] border-[1.5px] border-[var(--border)] shadow-sm hover:border-[var(--accent)] active:scale-[0.98] transition-all flex flex-col justify-between min-h-[100px] group"
          >
            <div className="w-10 h-10 rounded-[14px] bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
              <Car size={22} />
            </div>
            <div className="pt-2">
              <div className="text-[15px] font-extrabold font-baloo text-[var(--text)] group-hover:text-[var(--accent)] leading-tight transition-colors">
                {t("more_parking")}
              </div>
            </div>
          </Link>

          {/* 3. Police Stations Near You */}
          <button
            type="button"
            onClick={() => handlePendingFeature("police")}
            className="p-3.5 sm:p-4 rounded-[20px] bg-[var(--card-bg)] border-[1.5px] border-[var(--border)] shadow-sm hover:border-[var(--accent)] active:scale-[0.98] transition-all flex flex-col justify-between min-h-[100px] text-left group"
          >
            <div className="w-10 h-10 rounded-[14px] bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
              <Shield size={22} />
            </div>
            <div className="pt-2">
              <div className="text-[14px] sm:text-[15px] font-extrabold font-baloo text-[var(--text)] group-hover:text-[var(--accent)] leading-tight transition-colors">
                {t("more_police_stations")}
              </div>
            </div>
          </button>

          {/* 4. Washrooms Near You */}
          <button
            type="button"
            onClick={() => handlePendingFeature("washroom")}
            className="p-3.5 sm:p-4 rounded-[20px] bg-[var(--card-bg)] border-[1.5px] border-[var(--border)] shadow-sm hover:border-[var(--accent)] active:scale-[0.98] transition-all flex flex-col justify-between min-h-[100px] text-left group"
          >
            <div className="w-10 h-10 rounded-[14px] bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
              <Bath size={22} />
            </div>
            <div className="pt-2">
              <div className="text-[14px] sm:text-[15px] font-extrabold font-baloo text-[var(--text)] group-hover:text-[var(--accent)] leading-tight transition-colors">
                {t("more_washrooms")}
              </div>
            </div>
          </button>
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
