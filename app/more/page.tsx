"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Footprints,
  Car,
  Bath,
  Shield,
  ChevronRight,
  ChevronLeft,
  X,
  CheckCircle2,
  Info,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface ToastState {
  show: boolean;
  message: string;
}

export default function MorePage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [toast, setToast] = useState<ToastState>({ show: false, message: "" });

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

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[var(--bg)] pb-28 font-sans">
      {/* Toast Notification for Pending Features */}
      {toast.show && (
        <aside
          aria-label="Feature notice"
          className="fixed bottom-20 inset-x-4 z-50 max-w-sm mx-auto p-3.5 rounded-[18px] bg-[var(--surface)] text-[var(--text)] border-[1.5px] border-[var(--accent)] shadow-2xl flex items-start justify-between gap-3 animate-in slide-in-from-bottom-5 duration-200"
        >
          <div className="flex items-start gap-2.5">
            <Info size={20} className="text-[var(--accent)] flex-shrink-0 mt-0.5" />
            <p className="text-xs font-baloo font-bold text-[var(--text)] leading-snug">
              {toast.message}
            </p>
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

      {/* Header with Back Navigation & Subtitle */}
      <div className="px-4 pt-5 pb-4 border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-9 h-9 rounded-full bg-[var(--card-bg)] border border-[var(--border)] flex items-center justify-center text-[var(--text)] hover:border-[var(--accent)] active:scale-95 transition-all shadow-sm flex-shrink-0"
            aria-label="Go back"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold font-baloo text-[var(--text)] leading-tight">
              {t("more_page_title")}
            </h1>
            <p className="text-xs font-baloo text-[var(--muted)]">
              {t("more_page_subtitle")}
            </p>
          </div>
        </div>
      </div>

      {/* 4 Dedicated Navigation Cards */}
      <div className="p-4 space-y-3">
        {/* 1. Curated Routes */}
        <Link
          href="/routes"
          className="flex items-center justify-between p-4 rounded-[20px] bg-[var(--card-bg)] border-[1.5px] border-[var(--border)] shadow-sm hover:border-[var(--accent)] active:scale-[0.98] transition-all group"
        >
          <div className="flex items-center gap-3.5 pr-2">
            <div className="w-12 h-12 rounded-[16px] bg-orange-100 dark:bg-orange-950/40 text-[var(--accent)] flex items-center justify-center flex-shrink-0">
              <Footprints size={24} />
            </div>
            <div className="space-y-0.5">
              <h2 className="text-base font-extrabold font-baloo text-[var(--text)] leading-snug group-hover:text-[var(--accent)] transition-colors">
                {t("more_curated_routes_title")}
              </h2>
              <p className="text-xs text-[var(--muted)] font-baloo leading-snug">
                {t("more_curated_routes_desc")}
              </p>
            </div>
          </div>
          <div className="text-[var(--muted)] group-hover:text-[var(--accent)] transition-colors flex-shrink-0">
            <ChevronRight size={20} />
          </div>
        </Link>

        {/* 2. Parking */}
        <Link
          href="/parking"
          className="flex items-center justify-between p-4 rounded-[20px] bg-[var(--card-bg)] border-[1.5px] border-[var(--border)] shadow-sm hover:border-[var(--accent)] active:scale-[0.98] transition-all group"
        >
          <div className="flex items-center gap-3.5 pr-2">
            <div className="w-12 h-12 rounded-[16px] bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
              <Car size={24} />
            </div>
            <div className="space-y-0.5">
              <h2 className="text-base font-extrabold font-baloo text-[var(--text)] leading-snug group-hover:text-[var(--accent)] transition-colors">
                {t("more_parking_title")}
              </h2>
              <p className="text-xs text-[var(--muted)] font-baloo leading-snug">
                {t("more_parking_desc")}
              </p>
            </div>
          </div>
          <div className="text-[var(--muted)] group-hover:text-[var(--accent)] transition-colors flex-shrink-0">
            <ChevronRight size={20} />
          </div>
        </Link>

        {/* 3. Washrooms Near You */}
        <button
          type="button"
          onClick={() => handlePendingFeature("washroom")}
          className="w-full flex items-center justify-between p-4 rounded-[20px] bg-[var(--card-bg)] border-[1.5px] border-[var(--border)] shadow-sm hover:border-[var(--accent)] active:scale-[0.98] transition-all text-left group"
        >
          <div className="flex items-center gap-3.5 pr-2">
            <div className="w-12 h-12 rounded-[16px] bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
              <Bath size={24} />
            </div>
            <div className="space-y-0.5">
              <h2 className="text-base font-extrabold font-baloo text-[var(--text)] leading-snug group-hover:text-[var(--accent)] transition-colors">
                {t("more_washrooms_title")}
              </h2>
              <p className="text-xs text-[var(--muted)] font-baloo leading-snug">
                {t("more_washrooms_desc")}
              </p>
            </div>
          </div>
          <div className="text-[var(--muted)] group-hover:text-[var(--accent)] transition-colors flex-shrink-0">
            <ChevronRight size={20} />
          </div>
        </button>

        {/* 4. Police Stations Near You */}
        <button
          type="button"
          onClick={() => handlePendingFeature("police")}
          className="w-full flex items-center justify-between p-4 rounded-[20px] bg-[var(--card-bg)] border-[1.5px] border-[var(--border)] shadow-sm hover:border-[var(--accent)] active:scale-[0.98] transition-all text-left group"
        >
          <div className="flex items-center gap-3.5 pr-2">
            <div className="w-12 h-12 rounded-[16px] bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
              <Shield size={24} />
            </div>
            <div className="space-y-0.5">
              <h2 className="text-base font-extrabold font-baloo text-[var(--text)] leading-snug group-hover:text-[var(--accent)] transition-colors">
                {t("more_police_title")}
              </h2>
              <p className="text-xs text-[var(--muted)] font-baloo leading-snug">
                {t("more_police_desc")}
              </p>
            </div>
          </div>
          <div className="text-[var(--muted)] group-hover:text-[var(--accent)] transition-colors flex-shrink-0">
            <ChevronRight size={20} />
          </div>
        </button>
      </div>

      {/* Subtle Footer Note */}
      <div className="px-6 py-6 text-center space-y-1.5">
        <p className="text-xs font-baloo text-[var(--muted)] leading-relaxed">
          Pune Ganpati Darshan • Built for Pune Ganeshotsav Devotees
        </p>
        <p className="text-[11px] font-baloo text-[var(--muted)]/70">
          100% Free · Community Real-time Guide · Zero tracking
        </p>
      </div>
    </div>
  );
}
