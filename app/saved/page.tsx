"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Bookmark, Heart, MapPin, Trash2, Footprints, Clock, ArrowRight, Sparkles } from "lucide-react";
import { MANDALS, getMandalById, haversine } from "@/lib/mandals";
import { Mandal, LiveCrowd, CrowdStatus } from "@/lib/types";
import { subscribeToLiveCrowd } from "@/lib/firebase";
import MandalCard from "@/components/MandalCard";
import { CROWD_CONFIG } from "@/components/CrowdBadge";

export default function SavedPage() {
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [planIds, setPlanIds] = useState<string[]>([]);
  const [crowdData, setCrowdData] = useState<Record<string, LiveCrowd>>({});

  const loadData = () => {
    try {
      const favs = JSON.parse(
        localStorage.getItem("pg.favorites") ||
          localStorage.getItem("saved_mandals") ||
          "[]"
      );
      setSavedIds(favs);

      const plan = JSON.parse(localStorage.getItem("pg.plan") || "[]");
      setPlanIds(plan);
    } catch {
      setSavedIds([]);
      setPlanIds([]);
    }
  };

  useEffect(() => {
    loadData();
    const handleStorage = () => loadData();
    window.addEventListener("storage", handleStorage);

    fetch("/api/crowd")
      .then((res) => res.json())
      .then((data) => setCrowdData((prev) => ({ ...prev, ...data })))
      .catch(() => {});

    const unsubscribe = subscribeToLiveCrowd((data) => {
      setCrowdData((prev) => ({ ...prev, ...(data || {}) }));
    });

    return () => {
      window.removeEventListener("storage", handleStorage);
      unsubscribe();
    };
  }, []);

  const savedMandals = savedIds
    .map((id) => getMandalById(id))
    .filter(Boolean) as Mandal[];

  const planMandals = planIds
    .map((id) => getMandalById(id))
    .filter(Boolean) as Mandal[];

  // Calculate plan time estimate
  const planMinutesEstimate = planMandals.reduce((sum, mandal, i) => {
    let legWalk = 4;
    if (i > 0) {
      const prev = planMandals[i - 1];
      const d = haversine({ lat: prev.lat, lng: prev.lng }, { lat: mandal.lat, lng: mandal.lng });
      legWalk = Math.max(1, Math.round(d / 1.2 / 60));
    }
    const crowd = crowdData[mandal.id];
    let queue = 10;
    if (crowd?.waitMinutes) queue = crowd.waitMinutes;
    else if (crowd?.status === "short") queue = 5;
    else if (crowd?.status === "heavy") queue = 35;
    return sum + legWalk + queue + 10; // walk + queue + 10m dwell
  }, 0);

  const clearSaved = () => {
    localStorage.removeItem("pg.favorites");
    localStorage.removeItem("saved_mandals");
    setSavedIds([]);
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[var(--bg)] px-4 py-5 space-y-6 pb-28 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-extrabold font-baloo text-[var(--text)] leading-tight">
            Saved & Darshan Plan
          </h1>
          <p className="text-xs font-marathi text-[var(--muted)]">
            जतन केलेले गणपती व दर्शन नियोजन
          </p>
        </div>
      </div>

      {/* "YOUR DARSHAN PLAN" SECTION */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="p-1 rounded-md bg-[var(--accent-bg)] text-[var(--accent)]">
              <Sparkles size={14} />
            </span>
            <h2 className="text-base font-extrabold font-baloo text-[var(--text)]">
              Your Darshan Route ({planMandals.length} Stops)
            </h2>
          </div>

          <Link
            href="/plan"
            className="text-xs font-extrabold font-baloo text-[var(--accent)] hover:underline flex items-center gap-0.5"
          >
            Open Plan →
          </Link>
        </div>

        {planMandals.length > 0 ? (
          <Link
            href="/plan"
            className="block p-4 rounded-[20px] bg-[var(--surface)] border-[1.5px] border-[var(--border)] shadow-sm space-y-3 hover:border-[var(--accent)]/40 transition-all active:scale-[0.99]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[var(--accent-bg)] text-[var(--accent)] text-[11px] font-extrabold font-baloo">
                  <Footprints size={12} /> {planMandals.length} stops in sequence
                </span>

                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold font-baloo">
                  <Clock size={11} /> ~{planMinutesEstimate} min total
                </span>
              </div>

              <ArrowRight size={16} className="text-[var(--muted)]" />
            </div>

            {/* Sequence preview pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              {planMandals.map((m, idx) => (
                <span
                  key={m.id}
                  className="flex-shrink-0 px-2.5 py-1 rounded-full bg-[var(--bg)] border border-[var(--border)] text-xs font-bold font-baloo text-[var(--text)] flex items-center gap-1"
                >
                  <span className="w-4 h-4 rounded-full bg-[var(--accent)] text-white text-[10px] font-extrabold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="truncate max-w-[120px]">{m.name}</span>
                </span>
              ))}
            </div>

            <div className="text-[11px] font-baloo text-[var(--muted)] border-t border-[var(--border)] pt-2 flex items-center justify-between">
              <span>Optimized turn-by-turn route ready</span>
              <span className="text-[var(--accent)] font-bold">View full itinerary →</span>
            </div>
          </Link>
        ) : (
          <div className="p-4 rounded-[18px] bg-[var(--surface)] border border-[var(--border)] text-center space-y-2">
            <p className="text-xs font-baloo text-[var(--muted)]">
              You haven't built or added stops to your darshan plan yet.
            </p>
            <Link
              href="/start"
              className="inline-flex h-9 px-4 rounded-full bg-[var(--accent)] text-white text-xs font-extrabold font-baloo items-center justify-center gap-1 shadow-sm"
            >
              <span>✦</span> Build My Route
            </Link>
          </div>
        )}
      </div>

      {/* "SAVED MANDALS" SECTION */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Heart size={16} className="text-[var(--accent)] fill-[var(--accent)]" />
            <h2 className="text-base font-extrabold font-baloo text-[var(--text)]">
              Saved Mandals ({savedMandals.length})
            </h2>
          </div>

          {savedMandals.length > 0 && (
            <button
              type="button"
              onClick={clearSaved}
              className="text-xs font-bold font-baloo text-[var(--muted)] hover:text-red-600 transition-colors"
            >
              Clear saved
            </button>
          )}
        </div>

        {savedMandals.length === 0 ? (
          <div className="p-8 text-center rounded-[20px] bg-[var(--surface)] border border-[var(--border)] space-y-3">
            <div className="w-12 h-12 rounded-full bg-[var(--accent-bg)] text-[var(--accent)] mx-auto flex items-center justify-center">
              <Heart size={24} />
            </div>
            <p className="text-base font-extrabold font-baloo text-[var(--text)]">
              No saved mandals yet
            </p>
            <p className="text-xs text-[var(--muted)] font-baloo max-w-xs mx-auto">
              Tap the heart on any mandal page or card to save it for quick access.
            </p>
            <Link
              href="/explore"
              className="inline-flex h-[44px] px-6 rounded-[14px] bg-[var(--accent)] text-white text-sm font-extrabold font-baloo items-center justify-center mt-2 shadow-sm"
            >
              Explore 30 Mandals
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {savedMandals.map((mandal) => (
              <MandalCard
                key={mandal.id}
                mandal={mandal}
                crowd={crowdData[mandal.id]}
                badgePosition="content-top"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
