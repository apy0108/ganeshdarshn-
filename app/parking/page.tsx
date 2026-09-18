"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Car,
  AlertTriangle,
  ArrowRight,
  Navigation,
  ShieldAlert,
  Footprints,
  Ban,
  Compass,
  ExternalLink,
  MapPin,
  Info,
  Clock,
} from "lucide-react";
import dynamic from "next/dynamic";
import {
  PARKING_SPOTS,
  ROAD_CLOSURES,
  FOOT_CORRIDORS,
  TRAFFIC_JUNCTIONS,
  ParkingSpot,
} from "@/lib/parking";
import { getMandalById, MANDALS } from "@/lib/mandals";

const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#120800] flex items-center justify-center text-xs text-orange-200 font-baloo">
      Loading traffic & parking map...
    </div>
  ),
});

type TabType = "parking" | "closed" | "oneway" | "junctions";

export default function ParkingPage() {
  const [activeTab, setActiveTab] = useState<TabType>("parking");
  const [selectedSpot, setSelectedSpot] = useState<ParkingSpot | null>(null);

  const getGoogleMapsDirections = (lat: number, lng: number) => {
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[var(--bg)] pb-28 font-sans">
      {/* Top Header */}
      <div className="px-4 pt-5 pb-3 space-y-1">
        <h1 className="text-[26px] font-extrabold font-baloo text-[var(--text)] leading-tight">
          Parking & Road Closures
        </h1>
        <p className="text-xs font-baloo text-[var(--muted)] leading-relaxed">
          As published by the Pune City Traffic Police. A plan, not a live view.
        </p>
      </div>

      {/* Prominent Official Disclaimer Box */}
      <div className="px-4 pb-3">
        <div className="p-3.5 rounded-[16px] bg-amber-50 border border-amber-200 text-amber-900 space-y-1.5 shadow-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-700 flex-shrink-0" />
            <span className="text-xs font-extrabold font-baloo uppercase tracking-wide text-amber-800">
              Traffic Advisory & Plan
            </span>
          </div>
          <p className="text-[11px] font-baloo leading-relaxed text-amber-900/90">
            This is a published plan, not a live view. It does not say how many vehicles fit, what it
            costs, or whether a place is open or already full tonight. Police arrangements can change
            on the day. Follow the barricades and the constable in front of you.
          </p>
        </div>
      </div>

      {/* Embedded Small Map with Parking Pins, Closures, and Foot Corridors */}
      <div className="relative w-full h-[220px] bg-[#120800] border-y border-[var(--border)] overflow-hidden">
        <Map
          mandals={MANDALS.slice(0, 10)}
          center={[73.8545, 18.516]}
          zoom={13.8}
          className="w-full h-full"
          showParking={true}
          parkingSpots={PARKING_SPOTS}
          selectedParkingId={selectedSpot ? selectedSpot.id : null}
          onSelectParking={(spot) => setSelectedSpot(spot)}
          showRoadClosures={true}
          roadClosures={ROAD_CLOSURES}
          showFootCorridors={true}
          footCorridors={FOOT_CORRIDORS}
        />

        {/* Floating Map Legend Pill */}
        <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-[10px] font-bold font-baloo border border-white/10 shadow">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#2563EB] text-center leading-none text-[8px] font-black text-white">
            P
          </span>
          <span>Parking</span>
          <span className="text-white/40">•</span>
          <span className="inline-block w-3 h-0.5 bg-red-500 rounded" />
          <span>Closed</span>
          <span className="text-white/40">•</span>
          <span className="inline-block w-3 h-0.5 bg-sky-400 rounded" />
          <span>One-way</span>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="px-4 pt-4">
        <div className="grid grid-cols-4 gap-1 p-1 bg-[var(--surface)] border border-[var(--border)] rounded-[14px] shadow-sm">
          {[
            { id: "parking", label: `Parking (${PARKING_SPOTS.length})` },
            { id: "closed", label: `Closed (${ROAD_CLOSURES.length})` },
            { id: "oneway", label: `One-way (${FOOT_CORRIDORS.length})` },
            { id: "junctions", label: `Junctions (${TRAFFIC_JUNCTIONS.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`py-2 text-center rounded-[10px] text-[11px] font-extrabold font-baloo transition-all ${
                activeTab === tab.id
                  ? "bg-[var(--accent)] text-white shadow-sm"
                  : "text-[var(--muted)] hover:text-[var(--text)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content Areas */}
      <div className="p-4 space-y-3">
        {/* 1. PARKING TAB */}
        {activeTab === "parking" && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-baloo text-[var(--muted)] px-1">
              <span>{PARKING_SPOTS.length} Designated Parking Lots</span>
              <span>Near Core Peths</span>
            </div>

            {PARKING_SPOTS.map((spot) => {
              const nearestMandal = getMandalById(spot.nearestMandalId);
              const isSelected = selectedSpot?.id === spot.id;

              return (
                <div
                  key={spot.id}
                  onClick={() => setSelectedSpot(spot)}
                  className={`p-3.5 rounded-[16px] bg-[var(--surface)] border transition-all space-y-2 cursor-pointer ${
                    isSelected
                      ? "border-blue-500 ring-2 ring-blue-100 shadow-md"
                      : "border-[var(--border)] shadow-sm hover:border-[var(--accent)]/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-baloo font-extrabold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                        {spot.id}
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold font-baloo text-[var(--text)] leading-snug">
                          {spot.name}
                        </h3>
                        {spot.capacityType && (
                          <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 text-[10px] font-bold font-baloo border border-blue-200">
                            {spot.capacityType}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Nearest Mandal Info */}
                  <div className="pt-1.5 border-t border-[var(--border)] flex items-center justify-between text-xs font-baloo text-[var(--muted)]">
                    <div className="truncate max-w-[210px]">
                      Nearest mandal:{" "}
                      <span className="font-bold text-[var(--text)]">
                        {nearestMandal ? nearestMandal.name : spot.nearestMandalId}
                      </span>
                      , {spot.nearestMandalDistanceM} m in a straight line
                    </div>

                    <a
                      href={getGoogleMapsDirections(spot.lat, spot.lng)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-[10px] bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold font-baloo shadow-sm active:scale-95 transition-all flex-shrink-0"
                    >
                      <Navigation size={12} className="fill-white" />
                      Directions
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 2. CLOSED ROADS TAB */}
        {activeTab === "closed" && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-baloo text-[var(--muted)] px-1">
              <span>{ROAD_CLOSURES.length} Stretches Closed to Vehicles</span>
              <span className="text-red-600 font-bold flex items-center gap-1">
                <Clock size={12} /> Closed after 17:00
              </span>
            </div>

            {ROAD_CLOSURES.map((road) => (
              <div
                key={road.id}
                className="p-3.5 rounded-[16px] bg-[var(--surface)] border border-[var(--border)] shadow-sm space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-md bg-red-100 text-red-600">
                      <Ban size={15} />
                    </div>
                    <h3 className="text-sm font-extrabold font-baloo text-[var(--text)]">
                      {road.name}
                    </h3>
                  </div>

                  <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 text-[10px] font-extrabold font-baloo">
                    Closed after {road.closedAfter}
                  </span>
                </div>

                <div className="space-y-1 text-xs font-baloo text-[var(--muted)] pt-1 border-t border-[var(--border)]">
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-bold text-[var(--text)]">Stretch:</span>
                    <span>
                      {road.startPoint} → {road.endPoint}
                    </span>
                  </div>
                  {road.alternateRoute && (
                    <div className="text-[11px] text-zinc-500">
                      <span className="font-semibold text-zinc-600">Diversion: </span>
                      {road.alternateRoute}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 3. ONE WAY FOOT CORRIDORS TAB */}
        {activeTab === "oneway" && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-baloo text-[var(--muted)] px-1">
              <span>{FOOT_CORRIDORS.length} One-Way Walking Egress Lanes</span>
              <span className="text-sky-700 font-bold">Strict Pedestrian Flow</span>
            </div>

            {FOOT_CORRIDORS.map((corridor) => (
              <div
                key={corridor.id}
                className="p-3.5 rounded-[16px] bg-[var(--surface)] border border-[var(--border)] shadow-sm space-y-2.5"
              >
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-sky-100 text-sky-700 mt-0.5 flex-shrink-0">
                    <Footprints size={16} />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-extrabold font-baloo text-[var(--text)]">
                      {corridor.direction}
                    </h3>
                    <p className="text-xs font-baloo leading-relaxed text-[var(--muted)]">
                      {corridor.description}
                    </p>
                  </div>
                </div>

                <div className="p-2.5 rounded-[12px] bg-red-50 border border-red-200 flex items-center gap-2 text-red-800 text-[11px] font-baloo font-bold">
                  <AlertTriangle size={14} className="text-red-600 flex-shrink-0" />
                  <span>{corridor.warning}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 4. JUNCTIONS TAB */}
        {activeTab === "junctions" && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-baloo text-[var(--muted)] px-1">
              <span>{TRAFFIC_JUNCTIONS.length} Police Checkpoints & Chowks</span>
              <span>Barricade Ring</span>
            </div>

            {TRAFFIC_JUNCTIONS.map((junc) => (
              <div
                key={junc.id}
                className="p-3.5 rounded-[16px] bg-[var(--surface)] border border-[var(--border)] shadow-sm space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-[var(--accent)] text-white font-baloo font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                      {junc.id}
                    </div>
                    <h3 className="text-sm font-extrabold font-baloo text-[var(--text)]">
                      {junc.name}
                    </h3>
                  </div>
                  <span className="text-[10px] font-baloo text-[var(--muted)]">{junc.area}</span>
                </div>

                <p className="text-xs font-baloo text-[var(--muted)] leading-relaxed pl-7">
                  {junc.restriction}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Footer Note & Official Police Link Button */}
        <div className="pt-4 space-y-3 text-center">
          <p className="text-[11px] font-baloo text-[var(--muted)]">
            Captured September 2026. Follow the barricades and constable in front of you.
          </p>

          <a
            href="https://punepolice.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-[48px] rounded-[14px] bg-[var(--surface)] border border-[var(--border)] text-xs font-extrabold font-baloo text-[var(--text)] flex items-center justify-center gap-2 shadow-sm hover:bg-[var(--accent-bg)] hover:text-[var(--accent)] active:scale-[0.98] transition-all"
          >
            <ExternalLink size={14} />
            Open the official police advisory & map ↗
          </a>
        </div>
      </div>
    </div>
  );
}
