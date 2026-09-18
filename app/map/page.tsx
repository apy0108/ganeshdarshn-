"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, X, Activity, Car, AlertTriangle, Navigation, ExternalLink } from "lucide-react";
import dynamic from "next/dynamic";
import { MANDALS, CURATED_ROUTES, getAllAreas } from "@/lib/mandals";
import { Mandal, LiveCrowd } from "@/lib/types";
import { subscribeToLiveCrowd } from "@/lib/firebase";
import MandalBottomSheet from "@/components/MandalBottomSheet";
import { PARKING_SPOTS, ROAD_CLOSURES, FOOT_CORRIDORS, ParkingSpot } from "@/lib/parking";
import { useDwellSignal } from "@/hooks/useDwellSignal";

const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#120800] flex items-center justify-center text-sm font-bold font-baloo text-orange-200">
      Loading Pune map...
    </div>
  ),
});

function MapViewContent() {
  const searchParams = useSearchParams();
  const initialMandalId = searchParams.get("mandal");
  const initialRouteId = searchParams.get("route");
  const initialFilter = searchParams.get("filter");

  // Passive dwell signal tracking
  useDwellSignal();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>(
    initialFilter || (initialRouteId ? `route-${initialRouteId}` : "all")
  );
  const [selectedMandal, setSelectedMandal] = useState<Mandal | null>(null);
  const [crowdData, setCrowdData] = useState<Record<string, LiveCrowd>>({});
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Traffic / Parking toggle state
  const [showTrafficLayers, setShowTrafficLayers] = useState(false);
  const [selectedParkingSpot, setSelectedParkingSpot] = useState<ParkingSpot | null>(null);

  // Poll GET /api/crowd every 60 seconds
  useEffect(() => {
    const fetchCrowd = async () => {
      try {
        const res = await fetch("/api/crowd");
        if (res.ok) {
          const data = await res.json();
          setCrowdData((prev) => ({ ...prev, ...data }));
          setLastUpdated(new Date());
        }
      } catch (e) {
        console.warn("Could not fetch live crowd state:", e);
      }
    };

    fetchCrowd();
    const interval = setInterval(fetchCrowd, 60000); // 60s polling

    const unsubscribe = subscribeToLiveCrowd((data) => {
      setCrowdData((prev) => ({ ...prev, ...(data || {}) }));
      setLastUpdated(new Date());
    });

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (initialMandalId) {
      const mandal = MANDALS.find((m) => m.id === initialMandalId);
      if (mandal) setSelectedMandal(mandal);
    }
  }, [initialMandalId]);

  // Build filter options
  const filterOptions = useMemo(() => {
    const areas = getAllAreas();
    const list = [
      { id: "all", label: "All Mandals", count: MANDALS.length },
      {
        id: "manache",
        label: "Manache Paach",
        count: MANDALS.filter((m) => m.categories.includes("manache")).length,
      },
      {
        id: "famous",
        label: "Famous",
        count: MANDALS.filter((m) => m.categories.includes("famous")).length,
      },
      {
        id: "historic",
        label: "Historic",
        count: MANDALS.filter((m) => m.categories.includes("historic")).length,
      },
      {
        id: "neighbourhood",
        label: "Neighbourhood",
        count: MANDALS.filter((m) => m.categories.includes("neighbourhood")).length,
      },
    ];

    areas.forEach((area) => {
      list.push({
        id: `area-${area}`,
        label: area,
        count: MANDALS.filter((m) => m.area === area).length,
      });
    });

    return list;
  }, []);

  // Filtered mandals
  const filteredMandals = useMemo(() => {
    let result = MANDALS;

    if (selectedFilter.startsWith("route-")) {
      const routeId = selectedFilter.replace("route-", "");
      const route = CURATED_ROUTES.find((r) => r.id === routeId);
      if (route) {
        result = result.filter((m) => route.mandalIds.includes(m.id));
      }
    } else if (selectedFilter === "manache") {
      result = result.filter((m) => m.categories.includes("manache"));
    } else if (selectedFilter === "famous") {
      result = result.filter((m) => m.categories.includes("famous"));
    } else if (selectedFilter === "historic") {
      result = result.filter((m) => m.categories.includes("historic"));
    } else if (selectedFilter === "neighbourhood") {
      result = result.filter((m) => m.categories.includes("neighbourhood"));
    } else if (selectedFilter.startsWith("area-")) {
      const area = selectedFilter.replace("area-", "");
      result = result.filter((m) => m.area === area);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(query) ||
          m.nameMarathi.toLowerCase().includes(query) ||
          m.area.toLowerCase().includes(query)
      );
    }

    return result;
  }, [selectedFilter, searchQuery]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#120800]">
      {/* Floating search bar & filter chips */}
      <div className="absolute top-0 left-0 right-0 z-20 p-3 pointer-events-none">
        <div className="max-w-md mx-auto space-y-2 pointer-events-auto">
          <div
            className="relative flex items-center bg-white border border-[var(--border)] rounded-[14px] overflow-hidden"
            style={{ height: "48px", boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}
          >
            <Search size={20} className="absolute left-3.5 text-[var(--muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Pune mandals, areas..."
              className="w-full pl-11 pr-10 h-full text-sm font-baloo font-bold text-[var(--text)] placeholder-[var(--muted)] bg-transparent focus:outline-none"
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

          {/* Filter chips & Traffic toggle */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {/* Traffic Layer Toggle Button */}
            <button
              type="button"
              onClick={() => setShowTrafficLayers(!showTrafficLayers)}
              className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold font-baloo transition-all shadow-md tap-target ${
                showTrafficLayers
                  ? "bg-blue-600 text-white border border-blue-600 ring-2 ring-blue-300"
                  : "bg-white text-blue-700 border border-blue-300 hover:bg-blue-50"
              }`}
            >
              <Car size={13} />
              <span>Traffic & Parking {showTrafficLayers ? "ON" : "OFF"}</span>
            </button>

            {filterOptions.map((opt) => {
              const isSelected = selectedFilter === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedFilter(opt.id)}
                  className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-extrabold font-baloo transition-all tap-target ${
                    isSelected
                      ? "bg-[var(--accent)] text-white shadow-md border border-[var(--accent)]"
                      : "bg-white text-[var(--muted)] border border-[var(--border)] hover:text-[var(--text)]"
                  }`}
                >
                  {opt.label}
                  {opt.count !== undefined && (
                    <span className={`ml-1 opacity-80 font-normal`}>({opt.count})</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Floating Live Indicator & Traffic Advisory pill */}
      <div className="absolute top-[125px] left-3 z-20 pointer-events-none space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-sm text-white text-[11px] font-bold font-baloo shadow">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Live Queue Status Active</span>
        </div>

        {showTrafficLayers && (
          <div>
            <Link
              href="/parking"
              className="pointer-events-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-700/90 hover:bg-blue-800 backdrop-blur-sm text-white text-[11px] font-extrabold font-baloo shadow transition-colors"
            >
              <span>🅿️ 23 Lots · 13 Closures</span>
              <ExternalLink size={11} />
            </Link>
          </div>
        )}
      </div>

      {/* Full-Screen Map Component */}
      <Map
        mandals={filteredMandals}
        selectedMandalId={selectedMandal?.id}
        onSelectMandal={(mandal) => {
          setSelectedParkingSpot(null);
          setSelectedMandal(mandal);
        }}
        onMapClick={() => {
          setSelectedMandal(null);
          setSelectedParkingSpot(null);
        }}
        crowdData={crowdData}
        className="w-full h-full"
        showParking={showTrafficLayers}
        parkingSpots={PARKING_SPOTS}
        selectedParkingId={selectedParkingSpot?.id}
        onSelectParking={(spot) => {
          setSelectedMandal(null);
          setSelectedParkingSpot(spot);
        }}
        showRoadClosures={showTrafficLayers}
        roadClosures={ROAD_CLOSURES}
        showFootCorridors={showTrafficLayers}
        footCorridors={FOOT_CORRIDORS}
      />

      {/* Selected Parking Spot Card Drawer */}
      {selectedParkingSpot && (
        <div className="absolute bottom-20 inset-x-3 z-30 max-w-md mx-auto p-4 rounded-[20px] bg-white border border-[var(--border)] shadow-2xl space-y-2.5 animate-in slide-in-from-bottom duration-200">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-baloo font-extrabold text-sm flex items-center justify-center">
                P
              </div>
              <div>
                <h3 className="text-sm font-extrabold font-baloo text-[var(--text)]">
                  {selectedParkingSpot.name}
                </h3>
                <span className="text-[11px] font-baloo text-[var(--muted)]">
                  {selectedParkingSpot.capacityType || "Designated Parking"}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedParkingSpot(null)}
              className="p-1 text-[var(--muted)] hover:text-[var(--text)]"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-[var(--border)] text-xs font-baloo">
            <span className="text-[var(--muted)]">
              {selectedParkingSpot.nearestMandalDistanceM}m from core mandals
            </span>

            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${selectedParkingSpot.lat},${selectedParkingSpot.lng}&travelmode=driving`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-[10px] bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold font-baloo shadow-sm"
            >
              <Navigation size={12} className="fill-white" />
              Drive Directions →
            </a>
          </div>
        </div>
      )}

      {/* Bottom Sheet Slide-Up on Mandal Pin tap */}
      <MandalBottomSheet
        mandal={selectedMandal}
        crowd={selectedMandal ? crowdData[selectedMandal.id] : undefined}
        onClose={() => setSelectedMandal(null)}
      />
    </div>
  );
}

export default function MapPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-screen bg-[#120800] flex items-center justify-center text-sm font-bold font-baloo text-orange-200">
          Loading map...
        </div>
      }
    >
      <MapViewContent />
    </Suspense>
  );
}
