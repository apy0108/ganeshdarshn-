"use client";

import React, { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Mandal, LiveCrowd, CrowdStatus } from "@/lib/types";
import { CROWD_CONFIG } from "./CrowdBadge";

import { ParkingSpot, RoadClosure, FootCorridor } from "@/lib/parking";
import { PUNE_METRO_STATIONS, MetroStation } from "@/lib/metro";

interface MapProps {
  mandals: Mandal[];
  selectedMandalId?: string | null;
  onSelectMandal?: (mandal: Mandal) => void;
  onMapClick?: () => void;
  crowdData?: Record<string, LiveCrowd>;
  center?: [number, number]; // [lng, lat]
  zoom?: number;
  className?: string;
  showNumbers?: boolean;
  showRouteLine?: boolean;
  // Parking & Traffic features
  showParking?: boolean;
  parkingSpots?: ParkingSpot[];
  selectedParkingId?: number | null;
  onSelectParking?: (spot: ParkingSpot) => void;
  showRoadClosures?: boolean;
  roadClosures?: RoadClosure[];
  showFootCorridors?: boolean;
  footCorridors?: FootCorridor[];
  // Metro support
  showMetro?: boolean;
}

export default function Map({
  mandals,
  selectedMandalId,
  onSelectMandal,
  onMapClick,
  crowdData = {},
  center = [73.8567, 18.5204], // Pune center [lng, lat]
  zoom = 14,
  className = "w-full h-full",
  showNumbers = false,
  showRouteLine = false,
  showParking = false,
  parkingSpots = [],
  selectedParkingId = null,
  onSelectParking,
  showRoadClosures = false,
  roadClosures = [],
  showFootCorridors = false,
  footCorridors = [],
  showMetro = true,
}: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<{ [id: string]: maplibregl.Marker }>({});
  const parkingMarkersRef = useRef<{ [id: number]: maplibregl.Marker }>({});
  const metroMarkersRef = useRef<{ [id: string]: maplibregl.Marker }>({});

  // 1. Initialize MapLibre
  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://tiles.openfreemap.org/styles/dark",
      center: center,
      zoom: zoom,
      attributionControl: false,
    });

    map.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      "top-right"
    );

    map.on("click", () => {
      if (onMapClick) onMapClick();
    });

    map.on("load", () => {
      // 1. Route Polyline Layer
      if (!map.getSource("route-line-source")) {
        map.addSource("route-line-source", {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: { type: "LineString", coordinates: [] },
          },
        });

        map.addLayer({
          id: "route-line-glow",
          type: "line",
          source: "route-line-source",
          layout: { "line-join": "round", "line-cap": "round" },
          paint: {
            "line-color": "#E8621A",
            "line-width": 8,
            "line-opacity": 0.35,
          },
        });

        map.addLayer({
          id: "route-line-main",
          type: "line",
          source: "route-line-source",
          layout: { "line-join": "round", "line-cap": "round" },
          paint: {
            "line-color": "#FF8C42",
            "line-width": 3.5,
            "line-dasharray": [2, 1],
          },
        });
      }

      // 2. Road Closures Layer (Dashed Red)
      if (!map.getSource("closures-source")) {
        map.addSource("closures-source", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: [],
          },
        });

        map.addLayer({
          id: "closures-glow",
          type: "line",
          source: "closures-source",
          layout: { "line-join": "round", "line-cap": "round" },
          paint: {
            "line-color": "#DC2626",
            "line-width": 7,
            "line-opacity": 0.3,
          },
        });

        map.addLayer({
          id: "closures-main",
          type: "line",
          source: "closures-source",
          layout: { "line-join": "round", "line-cap": "round" },
          paint: {
            "line-color": "#EF4444",
            "line-width": 3.5,
            "line-dasharray": [3, 2],
          },
        });
      }

      // 3. One-way Foot Corridors Layer (Blue arrows / lines)
      if (!map.getSource("corridors-source")) {
        map.addSource("corridors-source", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: [],
          },
        });

        map.addLayer({
          id: "corridors-glow",
          type: "line",
          source: "corridors-source",
          layout: { "line-join": "round", "line-cap": "round" },
          paint: {
            "line-color": "#2563EB",
            "line-width": 6,
            "line-opacity": 0.35,
          },
        });

        map.addLayer({
          id: "corridors-main",
          type: "line",
          source: "corridors-source",
          layout: { "line-join": "round", "line-cap": "round" },
          paint: {
            "line-color": "#38BDF8",
            "line-width": 3,
            "line-dasharray": [2, 1.5],
          },
        });
      }
    });

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  // Update Route Polyline
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    const shouldDraw = (showRouteLine || showNumbers) && mandals.length > 1;
    const coords = shouldDraw ? mandals.map((m) => [m.lng, m.lat]) : [];

    const updateSource = () => {
      const src = map.getSource("route-line-source") as maplibregl.GeoJSONSource;
      if (src) {
        src.setData({
          type: "Feature",
          properties: {},
          geometry: { type: "LineString", coordinates: coords },
        });
      }
    };

    if (map.isStyleLoaded()) updateSource();
    else map.once("load", updateSource);
  }, [mandals, showRouteLine, showNumbers]);

  // Update Road Closures Layer
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    const features =
      showRoadClosures && roadClosures.length > 0
        ? roadClosures
            .filter((c) => c.coordinates && c.coordinates.length > 1)
            .map((c) => ({
              type: "Feature" as const,
              properties: { name: c.name, closedAfter: c.closedAfter },
              geometry: {
                type: "LineString" as const,
                coordinates: c.coordinates || [],
              },
            }))
        : [];

    const updateSource = () => {
      const src = map.getSource("closures-source") as maplibregl.GeoJSONSource;
      if (src) {
        src.setData({
          type: "FeatureCollection",
          features: features,
        });
      }
    };

    if (map.isStyleLoaded()) updateSource();
    else map.once("load", updateSource);
  }, [showRoadClosures, roadClosures]);

  // Update One-way Foot Corridors Layer
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    const features =
      showFootCorridors && footCorridors.length > 0
        ? footCorridors.map((fc) => ({
            type: "Feature" as const,
            properties: { direction: fc.direction, warning: fc.warning },
            geometry: {
              type: "LineString" as const,
              coordinates: fc.coordinates,
            },
          }))
        : [];

    const updateSource = () => {
      const src = map.getSource("corridors-source") as maplibregl.GeoJSONSource;
      if (src) {
        src.setData({
          type: "FeatureCollection",
          features: features,
        });
      }
    };

    if (map.isStyleLoaded()) updateSource();
    else map.once("load", updateSource);
  }, [showFootCorridors, footCorridors]);

  // Render / Update Mandal Markers
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    // Remove existing mandal markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    mandals.forEach((mandal, index) => {
      const crowd = crowdData[mandal.id];
      const status: CrowdStatus = crowd?.status || "none";
      const color = (CROWD_CONFIG[status] || CROWD_CONFIG.none).color;
      const isSelected = selectedMandalId === mandal.id;

      const el = document.createElement("div");
      el.className = "mandal-marker-pin group cursor-pointer select-none";

      const pinSize = showNumbers ? 26 : isSelected ? 24 : 16;
      el.style.width = `${pinSize}px`;
      el.style.height = `${pinSize}px`;
      el.style.borderRadius = "50%";
      el.style.backgroundColor = showNumbers ? "var(--accent, #D4520F)" : color;
      el.style.border = "2.5px solid #FFFFFF";
      el.style.boxShadow = isSelected
        ? `0 0 0 3px ${color}, 0 4px 12px rgba(0,0,0,0.5)`
        : "0 2px 8px rgba(0,0,0,0.4)";
      el.style.display = "flex";
      el.style.alignItems = "center";
      el.style.justifyContent = "center";
      el.style.cursor = "pointer";
      el.style.pointerEvents = "auto";
      el.style.transition = "transform 0.15s ease, box-shadow 0.15s ease";
      el.setAttribute("role", "button");
      el.setAttribute("aria-label", mandal.name);

      if (showNumbers) {
        el.style.color = "#FFFFFF";
        el.style.fontSize = "12px";
        el.style.fontWeight = "800";
        el.style.fontFamily = "var(--font-baloo), sans-serif";
        el.innerText = `${index + 1}`;
      }

      const handleClick = (e: Event) => {
        e.stopPropagation();
        if (onSelectMandal) onSelectMandal(mandal);
      };

      el.addEventListener("click", handleClick);
      el.addEventListener("touchend", handleClick);

      const marker = new maplibregl.Marker({ element: el, anchor: "center" })
        .setLngLat([mandal.lng, mandal.lat])
        .addTo(map);

      markersRef.current[mandal.id] = marker;
    });
  }, [mandals, crowdData, selectedMandalId, onSelectMandal, showNumbers]);

  // Render / Update Parking Markers (Blue "P" circle pins)
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    // Remove existing parking markers
    Object.values(parkingMarkersRef.current).forEach((marker) => marker.remove());
    parkingMarkersRef.current = {};

    if (!showParking) return;

    parkingSpots.forEach((spot) => {
      const isSelected = selectedParkingId === spot.id;
      const el = document.createElement("div");
      el.className = "parking-marker-pin group cursor-pointer select-none";

      const pinSize = isSelected ? 28 : 22;
      el.style.width = `${pinSize}px`;
      el.style.height = `${pinSize}px`;
      el.style.borderRadius = "50%";
      el.style.backgroundColor = "#2563EB"; // Blue
      el.style.border = "2px solid #FFFFFF";
      el.style.boxShadow = isSelected
        ? "0 0 0 3px #60A5FA, 0 4px 12px rgba(0,0,0,0.6)"
        : "0 2px 6px rgba(0,0,0,0.4)";
      el.style.display = "flex";
      el.style.alignItems = "center";
      el.style.justifyContent = "center";
      el.style.color = "#FFFFFF";
      el.style.fontSize = isSelected ? "13px" : "11px";
      el.style.fontWeight = "900";
      el.style.fontFamily = "var(--font-baloo), sans-serif";
      el.style.cursor = "pointer";
      el.style.pointerEvents = "auto";
      el.innerText = "P";
      el.setAttribute("title", spot.name);

      const handleClick = (e: Event) => {
        e.stopPropagation();
        if (onSelectParking) onSelectParking(spot);
      };

      el.addEventListener("click", handleClick);
      el.addEventListener("touchend", handleClick);

      const marker = new maplibregl.Marker({ element: el, anchor: "center" })
        .setLngLat([spot.lng, spot.lat])
        .addTo(map);

      parkingMarkersRef.current[spot.id] = marker;
    });
  }, [showParking, parkingSpots, selectedParkingId, onSelectParking]);

  // Render / Update Pune Metro Stations (Purple "M" circle pins)
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    // Remove existing metro markers
    Object.values(metroMarkersRef.current).forEach((marker) => marker.remove());
    metroMarkersRef.current = {};

    if (!showMetro) return;

    PUNE_METRO_STATIONS.forEach((st) => {
      const el = document.createElement("div");
      el.className = "metro-marker-pin group cursor-pointer select-none";
      el.style.width = "20px";
      el.style.height = "20px";
      el.style.borderRadius = "50%";
      el.style.backgroundColor = "#7E22CE"; // Purple metro color
      el.style.border = "2px solid #FFFFFF";
      el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.5)";
      el.style.display = "flex";
      el.style.alignItems = "center";
      el.style.justifyContent = "center";
      el.style.color = "#FFFFFF";
      el.style.fontSize = "10px";
      el.style.fontWeight = "900";
      el.style.fontFamily = "var(--font-baloo), sans-serif";
      el.innerText = "M";
      el.setAttribute("title", `${st.name} (${st.nameMarathi})`);

      const marker = new maplibregl.Marker({ element: el, anchor: "center" })
        .setLngLat([st.lng, st.lat])
        .addTo(map);

      metroMarkersRef.current[st.id] = marker;
    });
  }, [showMetro]);

  // Pan / fit to bounds
  useEffect(() => {
    if (!mapInstance.current) return;
    if (selectedMandalId) {
      const targetMandal = mandals.find((m) => m.id === selectedMandalId);
      if (targetMandal) {
        mapInstance.current.flyTo({
          center: [targetMandal.lng, targetMandal.lat],
          zoom: Math.max(mapInstance.current.getZoom(), 15),
          essential: true,
          duration: 800,
        });
      }
    } else if (selectedParkingId) {
      const targetSpot = parkingSpots.find((p) => p.id === selectedParkingId);
      if (targetSpot) {
        mapInstance.current.flyTo({
          center: [targetSpot.lng, targetSpot.lat],
          zoom: Math.max(mapInstance.current.getZoom(), 15.5),
          essential: true,
          duration: 800,
        });
      }
    } else if (mandals.length > 1 && showNumbers) {
      const bounds = new maplibregl.LngLatBounds();
      mandals.forEach((m) => bounds.extend([m.lng, m.lat]));
      mapInstance.current.fitBounds(bounds, { padding: 40, maxZoom: 16 });
    }
  }, [selectedMandalId, selectedParkingId, mandals, parkingSpots, showNumbers]);

  return (
    <div className={`relative ${className}`}>
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}
