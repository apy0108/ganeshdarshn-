"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Navigation, Eye, CheckCircle } from "lucide-react";
import { Mandal, LiveCrowd, CrowdStatus } from "@/lib/types";
import CrowdBadge from "./CrowdBadge";

interface MandalBottomSheetProps {
  mandal: Mandal | null;
  crowd?: LiveCrowd;
  onClose: () => void;
}

export default function MandalBottomSheet({
  mandal,
  crowd,
  onClose,
}: MandalBottomSheetProps) {
  const [imageError, setImageError] = useState(false);

  if (!mandal) return null;

  const status: CrowdStatus = crowd?.status || "none";
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${mandal.lat},${mandal.lng}`;
  const initialLetter = mandal.name.replace(/^(Shree|Shrimant|The)\s+/i, "")[0] || "ग";

  return (
    <div className="fixed inset-x-0 bottom-[68px] z-30 max-w-md mx-auto px-3 animate-in slide-in-from-bottom duration-200">
      <div className="bg-[var(--surface)] border-[1.5px] border-[var(--border)] rounded-[20px] shadow-2xl overflow-hidden">
        {/* Photo area: 140px tall, full width */}
        <div className="relative w-full h-[140px] bg-[#FFF0E6] overflow-hidden flex items-center justify-center">
          {mandal.imageUrl && !imageError ? (
            <Image
              src={mandal.imageUrl}
              alt={mandal.name}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#E8621A] to-[#D4520F] flex items-center justify-center text-white">
              <span className="text-4xl font-extrabold font-baloo">{initialLetter}</span>
            </div>
          )}

          {/* Close button on top-right */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-2.5 right-2.5 z-10 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>

          {/* Area tag pill */}
          <div className="absolute bottom-2.5 left-2.5 z-10 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-[11px] font-bold font-baloo">
            {mandal.area}
          </div>
        </div>

        {/* Content area */}
        <div className="p-4 space-y-3">
          {/* Header Row */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CrowdBadge status={status} size="md" />
              {crowd?.waitMinutes ? (
                <span className="text-xs font-bold text-[var(--muted)]">
                  ~{crowd.waitMinutes} min wait
                </span>
              ) : null}
            </div>

            <h3 className="text-xl font-extrabold font-baloo text-[var(--text)] leading-tight">
              {mandal.name}
            </h3>
            <p className="text-xs text-[var(--muted)] font-marathi">
              {mandal.nameMarathi}
            </p>
          </div>

          {/* TWO big buttons: Directions + View Details (52px height, radius 14px) */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="h-[52px] rounded-[14px] bg-[var(--accent)] text-white text-base font-extrabold font-baloo flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.98] transition-all shadow-sm"
            >
              <Navigation size={18} />
              Directions
            </a>

            <Link
              href={`/mandal/${mandal.id}`}
              className="h-[52px] rounded-[14px] bg-[var(--surface)] border-2 border-[var(--accent)] text-[var(--accent)] text-base font-extrabold font-baloo flex items-center justify-center gap-2 hover:bg-[var(--accent-bg)] active:scale-[0.98] transition-all"
            >
              <Eye size={18} />
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
