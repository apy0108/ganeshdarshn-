"use client";

import React from "react";
import Link from "next/link";
import { Compass, Home, Map } from "lucide-react";
import GanpatiIcon from "@/components/GanpatiIcon";

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto min-h-screen bg-[var(--bg)] p-6 flex flex-col items-center justify-center text-center space-y-4 font-sans">
      <div className="w-16 h-16 rounded-full bg-[var(--accent-bg)] flex items-center justify-center text-[var(--accent)] shadow-sm">
        <GanpatiIcon size={36} />
      </div>

      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold font-baloo text-[var(--text)]">
          404 • Page Not Found
        </h1>
        <p className="text-xs font-marathi text-[var(--muted)]">
          हे पान सापडले नाही
        </p>
      </div>

      <p className="text-xs font-baloo text-[var(--muted)] max-w-xs leading-relaxed">
        The mandal or route you are looking for does not exist or may have been moved.
      </p>

      <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5 w-full max-w-xs">
        <Link
          href="/"
          className="w-full h-[48px] rounded-[14px] bg-[var(--accent)] text-white text-sm font-extrabold font-baloo flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all"
        >
          <Home size={16} /> Home
        </Link>

        <Link
          href="/explore"
          className="w-full h-[48px] rounded-[14px] bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] text-sm font-extrabold font-baloo flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <Compass size={16} /> Explore Mandals
        </Link>
      </div>
    </div>
  );
}
