"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  X,
  Navigation,
  Compass,
  MapPin,
  Heart,
  SlidersHorizontal,
} from "lucide-react";
import {
  MANDALS,
  haversine,
  sortByDistance,
  getAllAreas,
} from "@/lib/mandals";
import { Mandal, LiveCrowd, CrowdStatus } from "@/lib/types";
import { subscribeToLiveCrowd } from "@/lib/firebase";
import GanpatiIcon from "@/components/GanpatiIcon";

const MAIN_FILTER_OPTIONS = [
  { id: "all", label: "All" },
  { id: "manache", label: "Manache Paach" },
  { id: "famous", label: "Famous" },
  { id: "historic", label: "Historic" },
  { id: "neighbourhood", label: "Neighbourhood" },
  { id: "saved", label: "Saved" },
];

const AREA_FILTER_OPTIONS = [
  "Kasba Peth",
  "Budhwar Peth",
  "Shukrawar Peth",
  "Sadashiv Peth",
  "Narayan Peth",
  "Ganesh Peth",
];

const CROWD_DOT_MAP: Record<CrowdStatus, { color: string; label: string }> = {
  short: { color: "#166534", label: "Short" },
  moving: { color: "#92400E", label: "Moving" },
  heavy: { color: "#991B1B", label: "Heavy" },
  none: { color: "#6B7280", label: "No data" },
};

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [crowdData, setCrowdData] = useState<Record<string, LiveCrowd>>({});

  // Sync saved list from localStorage
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("saved_mandals") || "[]");
      setSavedIds(stored);
    } catch {
      setSavedIds([]);
    }
    fetch("/api/crowd")
      .then((res) => res.json())
      .then((data) => setCrowdData((prev) => ({ ...prev, ...(data || {}) })))
      .catch(() => {});

    const unsubscribe = subscribeToLiveCrowd((data) => {
      setCrowdData((prev) => ({ ...prev, ...(data || {}) }));
    });
    return () => unsubscribe();
  }, []);

  // Request user location for "Sort by nearest"
  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }
    setIsLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setIsLocating(false);
      },
      (err) => {
        setLocationError("Could not get location. Showing default order.");
        setIsLocating(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const toggleSave = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const list: string[] = JSON.parse(
        localStorage.getItem("saved_mandals") || "[]"
      );
      let updated: string[];
      if (list.includes(id)) {
        updated = list.filter((item) => item !== id);
      } else {
        updated = [...list, id];
      }
      setSavedIds(updated);
      localStorage.setItem("saved_mandals", JSON.stringify(updated));
      window.dispatchEvent(new Event("storage"));
    } catch {
      // Ignore
    }
  };

  // Filter & sort mandals
  const displayedMandals = useMemo(() => {
    let list = MANDALS;

    // Category filter
    if (selectedCategory === "saved") {
      list = list.filter((m) => savedIds.includes(m.id));
    } else if (selectedCategory === "manache") {
      list = list.filter((m) => m.categories.includes("manache"));
    } else if (selectedCategory === "famous") {
      list = list.filter((m) => m.categories.includes("famous"));
    } else if (selectedCategory === "historic") {
      list = list.filter((m) => m.categories.includes("historic"));
    } else if (selectedCategory === "neighbourhood") {
      list = list.filter((m) => m.categories.includes("neighbourhood"));
    }

    // Area filter
    if (selectedArea) {
      list = list.filter((m) => m.area === selectedArea);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.nameMarathi.toLowerCase().includes(q) ||
          m.area.toLowerCase().includes(q)
      );
    }

    // Sort by nearest if userLocation is available
    if (userLocation) {
      list = sortByDistance(list, userLocation);
    }

    return list;
  }, [selectedCategory, selectedArea, searchQuery, userLocation, savedIds]);

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[var(--bg)] px-4 py-5 space-y-4 pb-28">
      {/* Top Header */}
      <div>
        <h1 className="text-[28px] font-extrabold font-baloo text-[var(--text)] leading-tight">
          Explore Mandals
        </h1>
        <p className="text-xs font-marathi text-[var(--muted)]">
          पुण्यातील सर्व ३० गणपती मंडळे
        </p>
      </div>

      {/* Live Search Bar */}
      <div className="relative flex items-center bg-[var(--surface)] border-[1.5px] border-[var(--border)] rounded-[14px] overflow-hidden h-[50px] shadow-sm">
        <Search size={20} className="absolute left-3.5 text-[var(--muted)]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, area (e.g. Kasba)..."
          className="w-full pl-11 pr-10 h-full text-base font-baloo font-bold text-[var(--text)] placeholder-[var(--muted)] bg-transparent focus:outline-none"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute right-3 tap-target p-1 text-[var(--muted)] hover:text-[var(--text)]"
            aria-label="Clear search"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
        {MAIN_FILTER_OPTIONS.map((opt) => {
          const isSelected = selectedCategory === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setSelectedCategory(opt.id)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-extrabold font-baloo transition-all tap-target ${
                isSelected
                  ? "bg-[var(--accent)] text-white shadow-sm border border-[var(--accent)]"
                  : "bg-[var(--surface)] text-[var(--muted)] border border-[var(--border)] hover:text-[var(--text)]"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Area Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        <button
          type="button"
          onClick={() => setSelectedArea(null)}
          className={`flex-shrink-0 px-3 py-1 rounded-full text-[11px] font-bold font-baloo transition-all ${
            selectedArea === null
              ? "bg-[var(--text)] text-white"
              : "bg-[var(--surface)] text-[var(--muted)] border border-[var(--border)]"
          }`}
        >
          All Areas
        </button>
        {AREA_FILTER_OPTIONS.map((area) => {
          const isSelected = selectedArea === area;
          return (
            <button
              key={area}
              type="button"
              onClick={() => setSelectedArea(isSelected ? null : area)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-[11px] font-bold font-baloo transition-all ${
                isSelected
                  ? "bg-[var(--text)] text-white"
                  : "bg-[var(--surface)] text-[var(--muted)] border border-[var(--border)] hover:text-[var(--text)]"
              }`}
            >
              {area}
            </button>
          );
        })}
      </div>

      {/* Sort By Nearest Button & Stats Row */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-xs font-extrabold font-baloo text-[var(--muted)]">
          {displayedMandals.length} mandals
        </span>

        <button
          type="button"
          onClick={requestLocation}
          disabled={isLocating}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold font-baloo transition-all border ${
            userLocation
              ? "bg-[#DCFCE7] text-[#166534] border-[#BBF7D0]"
              : "bg-[var(--surface)] text-[var(--accent)] border-[var(--accent)] hover:bg-[var(--accent-bg)]"
          }`}
        >
          <Navigation size={13} className={isLocating ? "animate-spin" : ""} />
          {isLocating
            ? "Finding location..."
            : userLocation
            ? "Sorted by nearest ✓"
            : "Sort by nearest"}
        </button>
      </div>

      {locationError && (
        <p className="text-xs text-red-600 font-baloo">{locationError}</p>
      )}

      {/* Mandal Cards List */}
      {displayedMandals.length === 0 ? (
        <div className="p-8 text-center rounded-[20px] bg-[var(--card-bg)] border border-[var(--border)] space-y-2">
          <p className="text-base font-extrabold font-baloo text-[var(--text)]">
            No mandals match your search
          </p>
          <p className="text-xs text-[var(--muted)]">
            Try adjusting your search terms or filter chips
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {displayedMandals.map((mandal) => {
            const crowd = crowdData[mandal.id];
            const status: CrowdStatus = crowd?.status || "none";
            const crowdInfo = CROWD_DOT_MAP[status] || CROWD_DOT_MAP.none;
            const isSaved = savedIds.includes(mandal.id);

            // Compute distance in meters/km if userLocation is known
            let distanceStr = "";
            if (userLocation) {
              const meters = haversine(userLocation, {
                lat: mandal.lat,
                lng: mandal.lng,
              });
              if (meters < 1000) {
                distanceStr = `${Math.round(meters)} m`;
              } else {
                distanceStr = `${(meters / 1000).toFixed(1)} km`;
              }
            }

            return (
              <Link
                key={mandal.id}
                href={`/ganpati/${mandal.id}`}
                className="flex items-center gap-3.5 p-3.5 rounded-[18px] bg-[var(--card-bg)] border-[1.5px] border-[var(--border)] active:scale-[0.99] transition-transform"
              >
                {/* Ganpati Illustration Icon */}
                <div className="flex-shrink-0">
                  <GanpatiIcon size={44} />
                </div>

                {/* Mandal Info */}
                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-extrabold font-baloo text-[var(--text)] leading-tight truncate">
                      {mandal.name}
                    </h2>
                  </div>

                  <p className="text-xs text-[var(--muted)] font-marathi truncate">
                    {mandal.nameMarathi}
                  </p>

                  <div className="flex items-center gap-2 pt-0.5 text-xs text-[var(--muted)] font-baloo font-medium">
                    <span>{mandal.area}</span>
                    {distanceStr && (
                      <>
                        <span>•</span>
                        <span className="text-[var(--accent)] font-bold">
                          {distanceStr}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Right side: Crowd Status Badge + Heart */}
                <div className="flex flex-col items-end justify-between self-stretch flex-shrink-0 pl-1">
                  <button
                    type="button"
                    onClick={(e) => toggleSave(e, mandal.id)}
                    className="tap-target -mt-1 -mr-1 p-1 text-[var(--muted)] hover:text-[var(--accent)]"
                    aria-label={isSaved ? "Saved" : "Save"}
                  >
                    <Heart
                      size={17}
                      className={
                        isSaved ? "fill-[var(--accent)] text-[var(--accent)]" : ""
                      }
                    />
                  </button>

                  {/* Crowd Status Badge with Dot */}
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--bg)] border border-[var(--border)] text-[11px] font-extrabold font-baloo">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: crowdInfo.color }}
                    />
                    <span style={{ color: crowdInfo.color }}>
                      {crowdInfo.label}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
