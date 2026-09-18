"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin } from "lucide-react";
import { Mandal, LiveCrowd, CrowdStatus } from "@/lib/types";
import CrowdBadge from "./CrowdBadge";

interface MandalCardProps {
  mandal: Mandal;
  crowd?: LiveCrowd;
  badgePosition?: "content-top" | "photo-top-right";
  className?: string;
}

export default function MandalCard({
  mandal,
  crowd,
  badgePosition = "content-top",
  className = "",
}: MandalCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Sync saved state with localStorage
  useEffect(() => {
    try {
      const savedList = JSON.parse(localStorage.getItem("saved_mandals") || "[]");
      setIsSaved(savedList.includes(mandal.id));
    } catch {
      // Ignore storage errors
    }
  }, [mandal.id]);

  const toggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const savedList: string[] = JSON.parse(
        localStorage.getItem("saved_mandals") || "[]"
      );
      let updated: string[];
      if (savedList.includes(mandal.id)) {
        updated = savedList.filter((id) => id !== mandal.id);
        setIsSaved(false);
      } else {
        updated = [...savedList, mandal.id];
        setIsSaved(true);
      }
      localStorage.setItem("saved_mandals", JSON.stringify(updated));
      window.dispatchEvent(new Event("storage"));
    } catch {
      setIsSaved(!isSaved);
    }
  };

  const status: CrowdStatus = crowd?.status || "none";
  const initialLetter = mandal.name.replace(/^(Shree|Shrimant|The)\s+/i, "")[0] || "ग";

  return (
    <Link
      href={`/mandal/${mandal.id}`}
      className={`group block rounded-[20px] overflow-hidden border-[1.5px] border-[var(--border)] bg-[var(--card-bg)] active:scale-[0.98] transition-transform duration-150 ${className}`}
      style={{ boxShadow: "none" }}
    >
      {/* Photo area: 160px tall, full width, object-fit: cover */}
      <div className="relative w-full h-[160px] bg-[#FFF0E6] overflow-hidden flex items-center justify-center">
        {mandal.imageUrl && !imageError ? (
          <Image
            src={mandal.imageUrl}
            alt={mandal.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
            priority={false}
          />
        ) : (
          /* Warm saffron initial placeholder */
          <div className="w-full h-full bg-gradient-to-br from-[#E8621A] to-[#D4520F] flex flex-col items-center justify-center text-white">
            <span className="text-4xl font-extrabold font-baloo drop-shadow-sm">
              {initialLetter}
            </span>
            <span className="text-[11px] font-marathi opacity-90 mt-0.5">
              {mandal.nameMarathi.slice(0, 12)}...
            </span>
          </div>
        )}

        {/* Absolute badge on top right for Explore view */}
        {badgePosition === "photo-top-right" && (
          <div className="absolute top-2.5 right-2.5 z-10">
            <CrowdBadge status={status} isEstimated={crowd?.isEstimated} size="sm" className="bg-white/90 backdrop-blur-sm shadow-sm" />
          </div>
        )}
      </div>

      {/* Content area: 14px padding */}
      <div className="p-[14px] flex flex-col space-y-2">
        {/* Crowd badge (colored pill) at TOP of content when badgePosition is content-top */}
        {badgePosition === "content-top" && (
          <div>
            <CrowdBadge status={status} isEstimated={crowd?.isEstimated} size="md" />
          </div>
        )}

        {/* Mandal Name & Marathi name */}
        <div className="space-y-0.5 min-h-[44px]">
          <h3 className="text-base font-extrabold font-baloo text-[var(--text)] leading-[1.2] line-clamp-2">
            {mandal.name}
          </h3>
          <p className="text-xs text-[var(--muted)] font-marathi truncate">
            {mandal.nameMarathi}
          </p>
        </div>

        {/* Area name */}
        <div className="text-[13px] text-[var(--muted)] font-baloo font-medium">
          {mandal.area}
        </div>

        {/* Bottom row: Distance badge + Heart icon */}
        <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-[var(--muted)] font-medium">
            <MapPin size={13} className="text-[var(--accent)]" />
            <span>{mandal.area}</span>
          </div>

          <button
            type="button"
            onClick={toggleSave}
            className="tap-target -m-2 p-2 flex items-center justify-center text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
            aria-label={isSaved ? "Remove from saved" : "Save mandal"}
          >
            <Heart
              size={18}
              className={isSaved ? "fill-[var(--accent)] text-[var(--accent)]" : ""}
            />
          </button>
        </div>
      </div>
    </Link>
  );
}
