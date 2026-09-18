"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Shield,
  Lock,
  EyeOff,
  MapPin,
  Trash2,
  RefreshCw,
  CheckCircle2,
  HelpCircle,
  Footprints,
  Train,
  Heart,
  Sparkles,
  Layers,
} from "lucide-react";
import GanpatiIcon from "@/components/GanpatiIcon";

export default function AboutPage() {
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const clearDarshanAndSaved = () => {
    try {
      localStorage.removeItem("pg.plan");
      localStorage.removeItem("pg.plan_meta");
      localStorage.removeItem("pg.favorites");
      localStorage.removeItem("saved_mandals");
      window.dispatchEvent(new Event("storage"));
      showToast("Cleared your darshan plan and saved mandals.");
    } catch {}
  };

  const clearThisVisit = () => {
    try {
      sessionStorage.removeItem("pg.session");
      localStorage.removeItem("pg.session");
      localStorage.removeItem("pg.referrer");
      localStorage.removeItem("ganpati_crowd_snapshot");
      showToast("Cleared session and temporary visit cache.");
    } catch {}
  };

  const resetEverything = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      showToast("Reset everything! New anonymous device ID will be created.");
    } catch {}
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[var(--bg)] pb-28 font-sans relative">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-24 inset-x-4 z-50 max-w-sm mx-auto p-3.5 rounded-[16px] bg-[#166534] text-white font-baloo font-bold text-sm flex items-center justify-center gap-2 shadow-2xl animate-in fade-in duration-200">
          <CheckCircle2 size={18} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="px-4 pt-5 pb-3 flex items-center justify-between">
        <Link
          href="/"
          className="tap-target p-2 -ml-2 text-[var(--muted)] hover:text-[var(--text)]"
        >
          <ArrowLeft size={22} />
        </Link>
        <h1 className="text-base font-extrabold font-baloo text-[var(--text)]">
          About Ganpati Darshan
        </h1>
        <div className="w-8" />
      </div>

      <div className="px-4 py-2 space-y-4">
        {/* Header Branding Box */}
        <div className="p-6 rounded-[24px] bg-gradient-to-b from-[#1E1008] to-[#120800] text-white text-center space-y-2 shadow-md">
          <div className="flex justify-center">
            <GanpatiIcon size={52} />
          </div>
          <h2 className="text-2xl font-extrabold font-baloo text-white">
            Ganpati Darshan
          </h2>
          <p className="text-xs font-marathi text-orange-200">
            पुणे गणेशोत्सव दर्शन मार्गदर्शक
          </p>
        </div>

        {/* 1. WHY WE BUILT THIS */}
        <div className="p-4 rounded-[20px] bg-[var(--surface)] border border-[var(--border)] shadow-sm space-y-2">
          <h3 className="text-sm font-extrabold font-baloo text-[var(--text)] flex items-center gap-2">
            <Sparkles size={16} className="text-[var(--accent)]" />
            Why We Built This
          </h3>
          <blockquote className="text-xs font-baloo italic text-[var(--muted)] border-l-2 border-[var(--accent)] pl-3 py-1 leading-relaxed bg-[var(--bg)] rounded-r-lg">
            "Ganeshotsav is a crowd problem before it is a walking problem. At the big mandals the queue is most of the evening."
          </blockquote>
          <p className="text-xs font-baloo text-[var(--text)] leading-relaxed pt-1">
            Pune's historic peths host millions during Ganeshotsav. We built Ganpati Darshan to give devotees clear, live queue visibility, pedestrian-first routing, and traffic clarity without commercial clutter or intrusive tracking.
          </p>
        </div>

        {/* 2. WHAT IT DOES */}
        <div className="p-4 rounded-[20px] bg-[var(--surface)] border border-[var(--border)] shadow-sm space-y-2.5">
          <h3 className="text-sm font-extrabold font-baloo text-[var(--text)] flex items-center gap-2">
            <Layers size={16} className="text-[var(--accent)]" />
            What It Does
          </h3>

          <div className="space-y-2 text-xs font-baloo text-[var(--muted)]">
            <div className="flex items-start gap-2">
              <span className="text-[var(--accent)] font-bold text-sm leading-none">•</span>
              <span>
                <strong>Curated & Custom Routes:</strong> Time-budgeted walking paths optimized across Pune's Manache Paach, Dekhavas, and Peths.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[var(--accent)] font-bold text-sm leading-none">•</span>
              <span>
                <strong>Live Crowd Status:</strong> Real-time Short / Moving / Heavy queue reports submitted directly by devotees on the ground.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[var(--accent)] font-bold text-sm leading-none">•</span>
              <span>
                <strong>Metro-Aware & Parking Advisory:</strong> Direct awareness of Pune Metro stations (Mandai, Budhwar Peth, Civil Court, Swargate) and 23 police-designated parking zones.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[var(--accent)] font-bold text-sm leading-none">•</span>
              <span>
                <strong>100% Free & Non-Commercial:</strong> Open community resource built for Pune Ganeshotsav devotees with zero advertisements.
              </span>
            </div>
          </div>
        </div>

        {/* 3. YOUR DATA (Interactive Data Management) */}
        <div className="p-4 rounded-[20px] bg-[var(--surface)] border border-[var(--border)] shadow-sm space-y-3">
          <h3 className="text-sm font-extrabold font-baloo text-[var(--text)] flex items-center gap-2">
            <Shield size={16} className="text-[var(--accent)]" />
            Your Data & Control
          </h3>
          <p className="text-xs font-baloo text-[var(--muted)]">
            Everything you save lives on your phone. You have absolute control to inspect or wipe it anytime:
          </p>

          <div className="space-y-2.5 pt-1">
            {/* Clear Darshan & Saved */}
            <div className="p-3 rounded-[16px] bg-[var(--bg)] border border-[var(--border)] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold font-baloo text-[var(--text)]">
                  Darshan Plan & Bookmarks
                </span>
                <button
                  type="button"
                  onClick={clearDarshanAndSaved}
                  className="px-2.5 py-1 rounded-lg bg-red-50 text-red-700 border border-red-200 text-[11px] font-extrabold font-baloo hover:bg-red-100 active:scale-95 transition-all"
                >
                  Clear Plan & Saved
                </button>
              </div>
              <p className="text-[11px] font-baloo text-[var(--muted)] leading-tight">
                Holds: <code>pg.plan</code>, <code>pg.favorites</code> in browser localStorage.
              </p>
            </div>

            {/* Clear This Visit */}
            <div className="p-3 rounded-[16px] bg-[var(--bg)] border border-[var(--border)] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold font-baloo text-[var(--text)]">
                  Session & Visit Cache
                </span>
                <button
                  type="button"
                  onClick={clearThisVisit}
                  className="px-2.5 py-1 rounded-lg bg-orange-50 text-orange-800 border border-orange-200 text-[11px] font-extrabold font-baloo hover:bg-orange-100 active:scale-95 transition-all"
                >
                  Clear This Visit
                </button>
              </div>
              <p className="text-[11px] font-baloo text-[var(--muted)] leading-tight">
                Holds: <code>pg.session</code>, <code>pg.referrer</code>, temporary crowd snapshot.
              </p>
            </div>

            {/* Reset Everything */}
            <div className="p-3 rounded-[16px] bg-[var(--bg)] border border-[var(--border)] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold font-baloo text-red-700">
                  Reset Everything
                </span>
                <button
                  type="button"
                  onClick={resetEverything}
                  className="px-2.5 py-1 rounded-lg bg-red-600 text-white text-[11px] font-extrabold font-baloo hover:bg-red-700 active:scale-95 transition-all shadow-sm"
                >
                  Reset All
                </button>
              </div>
              <p className="text-[11px] font-baloo text-[var(--muted)] leading-tight">
                Wipes anonymous <code>ganpati_device_id</code> and all stored settings.
              </p>
            </div>
          </div>
        </div>

        {/* 4. PRIVACY EXPLANATION */}
        <div className="p-4 rounded-[20px] bg-[var(--surface)] border border-[var(--border)] shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <Lock size={16} className="text-emerald-700" />
            <h3 className="text-sm font-extrabold font-baloo text-[var(--text)]">
              Privacy by Design
            </h3>
          </div>

          <div className="p-3 rounded-[14px] bg-emerald-50 text-emerald-950 text-xs font-baloo leading-relaxed border border-emerald-200">
            "When the map is open, the app notices on your phone whether you walked past a mandal or stopped there, and sends one of two words — stopped or slowed — with the mandal ID and nothing else. It never sends where you are. Your location stays on your device."
          </div>

          <div className="space-y-2 text-xs font-baloo text-[var(--muted)] pt-1">
            <div className="flex items-start gap-2">
              <span className="text-emerald-700 font-bold">•</span>
              <span>
                <strong>Location:</strong> Never sent to the server. Geofences are calculated locally in your browser.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-emerald-700 font-bold">•</span>
              <span>
                <strong>Queue reports:</strong> Stored with an anonymous random device ID, never your name, phone, or identity.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-emerald-700 font-bold">•</span>
              <span>
                <strong>IP addresses:</strong> One-way hashed for anti-spam rate limiting only. Address strings are never stored.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-emerald-700 font-bold">•</span>
              <span>
                <strong>Dwell tracking:</strong> Sends only "stopped" or "passed" with the mandal ID — never coordinates.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-emerald-700 font-bold">•</span>
              <span>
                <strong>Analytics:</strong> City-level aggregated counts only. No cross-site or user tracking.
              </span>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="pt-2 grid grid-cols-2 gap-2 text-center text-xs font-extrabold font-baloo">
          <Link
            href="/how-to-use"
            className="p-3 rounded-[14px] bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] hover:bg-[var(--accent-bg)] hover:text-[var(--accent)] transition-all shadow-sm"
          >
            How to Use Guide →
          </Link>
          <Link
            href="/parking"
            className="p-3 rounded-[14px] bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] hover:bg-[var(--accent-bg)] hover:text-[var(--accent)] transition-all shadow-sm"
          >
            Parking & Traffic →
          </Link>
        </div>
      </div>
    </div>
  );
}
