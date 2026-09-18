"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Heart,
  Share2,
  Navigation,
  CheckCircle,
  Clock,
  MapPin,
  Calendar,
  Info,
  Footprints,
  Plus,
  Check,
  Compass,
  AlertCircle,
} from "lucide-react";
import { MANDALS, getMandalById, getNearby, haversine } from "@/lib/mandals";
import { Mandal, LiveCrowd, CrowdStatus } from "@/lib/types";
import { subscribeToLiveCrowd } from "@/lib/firebase";
import CrowdBadge, { CROWD_CONFIG } from "@/components/CrowdBadge";
import CrowdReportButtons from "@/components/CrowdReportButtons";
import WaitTimeButtons from "@/components/WaitTimeButtons";
import GanpatiIcon from "@/components/GanpatiIcon";

// Open Google Maps directions for a single mandal
function openDirections(mandal: Mandal) {
  const url = new URL("https://www.google.com/maps/dir/");
  url.searchParams.set("api", "1");
  url.searchParams.set("destination", `${mandal.lat},${mandal.lng}`);
  if (mandal.googlePlaceId) {
    url.searchParams.set("destination_place_id", mandal.googlePlaceId);
  }
  url.searchParams.set("travelmode", "walking");
  window.open(url.toString(), "_blank", "noopener");
}

export default function MandalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
  const mandalId = rawId || "";

  const mandal = useMemo(() => getMandalById(mandalId), [mandalId]);

  const [crowdData, setCrowdData] = useState<Record<string, LiveCrowd>>({});
  const [isFavorite, setIsFavorite] = useState(false);
  const [isInPlan, setIsInPlan] = useState(false);
  const [hasLocation, setHasLocation] = useState<boolean | null>(null);
  const [showShareToast, setShowShareToast] = useState(false);
  const [planToast, setPlanToast] = useState<string | null>(null);

  // Check Geolocation availability
  useEffect(() => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => setHasLocation(true),
        () => setHasLocation(false),
        { timeout: 5000 }
      );
    } else {
      setHasLocation(false);
    }
  }, []);

  // Poll /api/crowd with 60s revalidation & Firebase fallback
  useEffect(() => {
    const fetchCrowd = async () => {
      try {
        const res = await fetch("/api/crowd");
        if (res.ok) {
          const data = await res.json();
          setCrowdData((prev) => ({ ...prev, ...data }));
        }
      } catch {}
    };

    fetchCrowd();
    const interval = setInterval(fetchCrowd, 60000);

    const unsubscribe = subscribeToLiveCrowd((data) => {
      setCrowdData((prev) => ({ ...prev, ...(data || {}) }));
    });

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, []);

  // Sync favorites (pg.favorites) & plan (pg.plan) from localStorage
  useEffect(() => {
    if (!mandal) return;
    try {
      const favs: string[] = JSON.parse(
        localStorage.getItem("pg.favorites") ||
          localStorage.getItem("saved_mandals") ||
          "[]"
      );
      setIsFavorite(favs.includes(mandal.id));

      const plan: string[] = JSON.parse(localStorage.getItem("pg.plan") || "[]");
      setIsInPlan(plan.includes(mandal.id));
    } catch {}
  }, [mandal]);

  if (!mandal) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-[var(--bg)] p-6 flex flex-col items-center justify-center text-center space-y-4">
        <p className="text-xl font-extrabold font-baloo text-[var(--text)]">
          Mandal not found
        </p>
        <Link
          href="/explore"
          className="h-[52px] px-6 rounded-[14px] bg-[var(--accent)] text-white text-base font-extrabold font-baloo inline-flex items-center justify-center"
        >
          Explore All Mandals
        </Link>
      </div>
    );
  }

  // Toggle favorite in pg.favorites
  const toggleFavorite = () => {
    try {
      const favs: string[] = JSON.parse(
        localStorage.getItem("pg.favorites") ||
          localStorage.getItem("saved_mandals") ||
          "[]"
      );
      let updated: string[];
      if (favs.includes(mandal.id)) {
        updated = favs.filter((id) => id !== mandal.id);
        setIsFavorite(false);
      } else {
        updated = [...favs, mandal.id];
        setIsFavorite(true);
      }
      localStorage.setItem("pg.favorites", JSON.stringify(updated));
      localStorage.setItem("saved_mandals", JSON.stringify(updated));
      window.dispatchEvent(new Event("storage"));
    } catch {
      setIsFavorite(!isFavorite);
    }
  };

  // Toggle in pg.plan
  const togglePlan = () => {
    try {
      const plan: string[] = JSON.parse(localStorage.getItem("pg.plan") || "[]");
      let updated: string[];
      if (plan.includes(mandal.id)) {
        updated = plan.filter((id) => id !== mandal.id);
        setIsInPlan(false);
        setPlanToast("Removed from your darshan plan");
      } else {
        updated = [...plan, mandal.id];
        setIsInPlan(true);
        setPlanToast("Added to your darshan plan! ✦");
      }
      localStorage.setItem("pg.plan", JSON.stringify(updated));
      setTimeout(() => setPlanToast(null), 2500);
    } catch {
      setIsInPlan(!isInPlan);
    }
  };

  const currentCrowd = crowdData[mandal.id];
  const currentStatus: CrowdStatus = currentCrowd?.status || "none";
  const currentConfig = CROWD_CONFIG[currentStatus] || CROWD_CONFIG.none;
  const isEstimated = currentCrowd?.isEstimated ?? false;
  const waitMinutes = currentCrowd?.waitMinutes;

  const handleShare = async () => {
    const queueLabel = currentConfig.label.replace(/^([✓~!]\s|\?\s)/, "");
    const shareText = `Check out ${mandal.name} on Ganpati Darshan — ${queueLabel} queue (${waitMinutes ? `~${waitMinutes} min` : "flowing"})`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: mandal.name,
          text: shareText,
          url: window.location.href,
        });
      } catch {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2000);
    }
  };

  // Nearby mandals within 500m (or closest 6)
  const nearbyList = useMemo(() => {
    let list = getNearby(mandal.id, 600);
    if (list.length === 0) {
      list = MANDALS.filter((m) => m.id !== mandal.id).slice(0, 4);
    }
    return list.slice(0, 6);
  }, [mandal.id]);

  // Determine Manache index if applicable
  const manacheIndex =
    mandal.id === "kasba-ganpati"
      ? 1
      : mandal.id === "tambdi-jogeshwari"
      ? 2
      : mandal.id === "guruji-talim"
      ? 3
      : mandal.id === "tulshibaug-ganpati"
      ? 4
      : mandal.id === "kesariwada-ganpati"
      ? 5
      : null;

  const primaryCategory = mandal.categories[0] || "famous";

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[var(--bg)] pb-32 relative font-sans">
      {/* Toast confirmation */}
      {showShareToast && (
        <div className="fixed bottom-24 inset-x-4 z-50 max-w-sm mx-auto p-3.5 rounded-[16px] bg-[#166534] text-white font-baloo font-bold text-sm flex items-center justify-center gap-2 shadow-2xl animate-in fade-in duration-150">
          <CheckCircle size={18} />
          <span>Link copied to clipboard!</span>
        </div>
      )}

      {planToast && (
        <div className="fixed bottom-24 inset-x-4 z-50 max-w-sm mx-auto p-3.5 rounded-[16px] bg-[var(--accent)] text-white font-baloo font-bold text-sm flex items-center justify-center gap-2 shadow-2xl animate-in fade-in duration-150">
          <Check size={18} />
          <span>{planToast}</span>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="bg-gradient-to-b from-[#1E1008] to-[#120800] text-white pt-4 pb-6 px-4 space-y-4 rounded-b-[28px] shadow-md">
        {/* Top bar: Back, Title icon, Actions */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="tap-target w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 active:scale-95 transition-all"
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </button>

          {/* Large Illustrated Ganpati SVG Icon */}
          <div className="flex items-center justify-center">
            <GanpatiIcon size={48} className="drop-shadow-lg" />
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={toggleFavorite}
              className="tap-target w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 active:scale-95 transition-all"
              aria-label={isFavorite ? "Saved" : "Save"}
            >
              <Heart
                size={18}
                className={
                  isFavorite ? "fill-[var(--accent)] text-[var(--accent)]" : ""
                }
              />
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="tap-target w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 active:scale-95 transition-all"
              aria-label="Share"
            >
              <Share2 size={18} />
            </button>
          </div>
        </div>

        {/* Breadcrumb: Home › Ganpati mandals › [Area] › [Name] */}
        <div className="text-[11px] font-baloo font-medium text-orange-200/80 flex items-center gap-1 overflow-x-auto no-scrollbar">
          <Link href="/" className="hover:underline flex-shrink-0">
            Home
          </Link>
          <span>›</span>
          <Link href="/explore" className="hover:underline flex-shrink-0">
            Ganpati mandals
          </Link>
          <span>›</span>
          <span className="flex-shrink-0">{mandal.area}</span>
          <span>›</span>
          <span className="text-white font-bold truncate">{mandal.name}</span>
        </div>

        {/* Category Badges & Verified check */}
        <div className="flex items-center gap-2 flex-wrap pt-1">
          {manacheIndex && (
            <span className="px-2.5 py-0.5 rounded-full bg-[#E8621A] text-white text-[11px] font-extrabold font-baloo uppercase tracking-wider">
              Manache Paach #{manacheIndex}
            </span>
          )}
          {mandal.categories.map((cat) => {
            if (cat === "manache" && manacheIndex) return null;
            return (
              <span
                key={cat}
                className="px-2.5 py-0.5 rounded-full bg-white/15 text-orange-100 text-[11px] font-bold font-baloo capitalize"
              >
                {cat}
              </span>
            );
          })}
          {mandal.verified && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold font-baloo">
              <CheckCircle size={12} /> Verified
            </span>
          )}
        </div>

        {/* Name in Large Fraunces font & Marathi name in Mukta */}
        <div className="space-y-1 pt-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold font-baloo leading-tight tracking-tight text-white">
            {mandal.name}
          </h1>
          <p className="text-sm font-marathi font-medium text-orange-200/90">
            {mandal.nameMarathi}
          </p>
        </div>

        {/* Hero Photo Banner */}
        {mandal.imageUrl && (
          <div className="relative w-full h-48 sm:h-56 rounded-[20px] overflow-hidden border border-white/15 shadow-inner my-2">
            <Image
              src={mandal.imageUrl}
              alt={mandal.name}
              fill
              priority
              sizes="(max-width: 640px) 100vw, 450px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-xs text-white/90 font-baloo">
              <span className="bg-black/50 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/20">
                Darshan Darbar
              </span>
              <span className="text-[11px] opacity-80">{mandal.area}</span>
            </div>
          </div>
        )}

        {/* Description text */}
        <p className="text-xs sm:text-sm font-baloo leading-relaxed text-orange-100/85">
          {mandal.description}
        </p>

        {/* Action Buttons: Get Directions + Add to Darshan */}
        <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => openDirections(mandal)}
            className="w-full h-[52px] rounded-[16px] bg-[var(--accent)] text-white text-base font-extrabold font-baloo flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.98] transition-all shadow-md"
          >
            <Navigation size={18} />
            Get directions
          </button>

          <button
            type="button"
            onClick={togglePlan}
            className={`w-full h-[52px] rounded-[16px] border-2 text-base font-extrabold font-baloo flex items-center justify-center gap-2 active:scale-[0.98] transition-all ${
              isInPlan
                ? "bg-emerald-900/60 border-emerald-500 text-emerald-200"
                : "bg-white/10 border-white/20 text-white hover:bg-white/15"
            }`}
          >
            {isInPlan ? (
              <>
                <Check size={18} /> In Darshan Plan
              </>
            ) : (
              <>
                <Plus size={18} /> Add to darshan
              </>
            )}
          </button>
        </div>
      </div>

      {/* BODY CONTENT */}
      <div className="p-4 space-y-5">
        {/* CROWD RIGHT NOW SECTION */}
        <div
          className="rounded-[20px] p-5 space-y-3 border transition-all"
          style={{
            backgroundColor: currentConfig.bg,
            borderColor: currentConfig.border,
            color: currentConfig.text,
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold font-baloo uppercase tracking-wider opacity-80">
              Crowd Right Now
            </span>
            <span className="text-[12px] font-bold font-baloo opacity-80">
              {isEstimated ? "Early signal" : "Reported by devotees"}
            </span>
          </div>

          {/* Large status pill */}
          <div className="flex items-center gap-3">
            <div className="text-3xl font-extrabold font-baloo leading-none">
              {currentConfig.symbol} {currentConfig.label.replace(/^([✓~!]\s|\?\s)/, "")}
            </div>
          </div>

          <div className="text-base font-bold font-baloo">
            {waitMinutes
              ? `People waited about ${waitMinutes} min`
              : currentStatus === "short"
              ? "People waited about 5–10 min"
              : currentStatus === "moving"
              ? "People waited about 20–30 min"
              : "People waited over 45 min"}
          </div>

          {isEstimated && (
            <p className="text-xs font-baloo font-medium opacity-80">
              Estimated from the time of day.
            </p>
          )}

          <p className="text-[11px] font-baloo italic opacity-75 pt-1 border-t border-black/10">
            Reported by devotees in the last 90 minutes. Not a measured queue time.
          </p>
        </div>

        {/* DWELL SIGNAL */}
        <div className="p-3.5 rounded-[16px] bg-[var(--surface)] border border-[var(--border)] text-xs font-baloo text-[var(--muted)] flex items-start gap-2">
          <Info size={16} className="text-[var(--accent)] flex-shrink-0 mt-0.5" />
          <p className="leading-snug">
            Most visitors near this mandal are stopping for darshan rather than walking past.
          </p>
        </div>

        {/* REPORT SECTION — "How long did you wait?" */}
        <div className="p-4 rounded-[20px] bg-[var(--surface)] border border-[var(--border)] space-y-4">
          <CrowdReportButtons mandal={mandal} />

          {hasLocation === false && (
            <div className="flex items-center gap-1.5 text-[11px] font-baloo text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
              <AlertCircle size={13} />
              <span>Location is off — reports still accepted.</span>
            </div>
          )}

          <WaitTimeButtons mandalId={mandal.id} />
        </div>

        {/* MANDAL INFO SECTION */}
        <div className="p-4 rounded-[20px] bg-[var(--surface)] border border-[var(--border)] space-y-3.5">
          <h2 className="text-base font-extrabold font-baloo text-[var(--text)]">
            Mandal Information
          </h2>

          <div className="space-y-2 text-xs font-baloo text-[var(--text)]">
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-[var(--accent)]" />
              <span>
                <strong>Location:</strong> {mandal.area}, Pune
              </span>
            </div>

            {mandal.established && (
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-[var(--accent)]" />
                <span>
                  <strong>Established:</strong> {mandal.established}
                </span>
              </div>
            )}

            <div className="flex items-start gap-2 pt-1">
              <Clock size={14} className="text-[var(--accent)] mt-0.5" />
              <div>
                <strong>Darshan timings:</strong>
                <p className="text-[var(--muted)] text-[11px] pt-0.5 leading-snug">
                  Not announced yet — most mandals confirm timings a few days before the festival.
                </p>
              </div>
            </div>

            {mandal.tips && (
              <div className="p-3 rounded-[12px] bg-[var(--accent-bg)] border border-[#F0E6DB] text-[#D4520F] space-y-0.5 mt-2">
                <span className="font-extrabold text-xs">Before you go:</span>
                <p className="text-[11px] leading-snug">{mandal.tips}</p>
              </div>
            )}
          </div>

          {/* Categories & Tags as Clean Chips */}
          <div className="flex items-center gap-2 flex-wrap pt-2.5 border-t border-[var(--border)]">
            {mandal.categories.map((c) => {
              const label =
                c === "manache"
                  ? "Manache Paach"
                  : c === "famous"
                  ? "Famous"
                  : c === "historic"
                  ? "Historic"
                  : c === "neighbourhood"
                  ? "Neighbourhood"
                  : c === "temple"
                  ? "Temple"
                  : String(c).replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

              return (
                <span
                  key={c}
                  className="px-3 py-1 rounded-[10px] bg-[var(--accent-bg)] text-[var(--accent)] border border-orange-200/80 text-xs font-extrabold font-baloo"
                >
                  {label}
                </span>
              );
            })}
            <span className="px-3 py-1 rounded-[10px] bg-[var(--surface)] text-[var(--muted)] border border-[var(--border)] text-xs font-bold font-baloo">
              Pune Darshan
            </span>
          </div>
        </div>

        {/* NEARBY MANDALS SECTION: Walking distance from [Name] */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold font-baloo text-[var(--text)]">
              Walking distance from {mandal.name.replace(/^(Shri|Shrimant)\s+/i, "")}
            </h2>
          </div>

          <div className="space-y-2">
            {nearbyList.map((nearby) => {
              const meters = Math.round(
                haversine(
                  { lat: mandal.lat, lng: mandal.lng },
                  { lat: nearby.lat, lng: nearby.lng }
                )
              );
              const nearbyCrowd = crowdData[nearby.id];
              const st: CrowdStatus = nearbyCrowd?.status || "none";

              return (
                <Link
                  key={nearby.id}
                  href={`/ganpati/${nearby.id}`}
                  className="flex items-center justify-between p-3 rounded-[16px] bg-[var(--surface)] border border-[var(--border)] active:scale-[0.99] transition-transform"
                >
                  <div className="space-y-0.5 pr-2 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold font-baloo bg-[var(--bg)] text-[var(--muted)] capitalize">
                        {nearby.categories[0]}
                      </span>
                      <h3 className="text-xs font-extrabold font-baloo text-[var(--text)] truncate">
                        {nearby.name}
                      </h3>
                    </div>
                    <p className="text-[11px] text-[var(--muted)] font-baloo">
                      {nearby.area} • ~{meters} m walk
                    </p>
                  </div>

                  <div className="flex-shrink-0">
                    <CrowdBadge status={st} isEstimated={nearbyCrowd?.isEstimated} size="sm" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Bottom Link: More [category] mandals */}
        <div className="text-center pt-3">
          <Link
            href={`/explore`}
            className="inline-flex items-center gap-1 text-xs font-extrabold font-baloo text-[var(--accent)] hover:underline"
          >
            More {primaryCategory} mandals →
          </Link>
        </div>
      </div>
    </div>
  );
}
