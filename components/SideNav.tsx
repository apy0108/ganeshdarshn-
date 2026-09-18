"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Home,
  Compass,
  Map,
  Route,
  Bookmark,
  Car,
  HelpCircle,
  Info,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import GanpatiIcon from "./GanpatiIcon";
import { getFestivalDayInfo } from "@/lib/festival";

export default function SideNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const [festivalInfo, setFestivalInfo] = useState(() => getFestivalDayInfo());

  useEffect(() => {
    setFestivalInfo(getFestivalDayInfo());
  }, []);

  // Close drawer upon route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Listen to open-sidenav event
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-sidenav", handleOpen);
    return () => window.removeEventListener("open-sidenav", handleOpen);
  }, []);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Don't render side menu trigger on dedicated wizard/flow screens if intrusive, or keep it clean
  const isDedicatedFlow = pathname === "/start" || (pathname && pathname.startsWith("/routes/"));

  return (
    <>
      {/* Floating Side Navigation Hamburger Trigger Button */}
      {!isDedicatedFlow && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed top-4 right-4 z-40 w-11 h-11 rounded-full bg-[var(--surface)]/95 backdrop-blur-md border-[1.5px] border-[var(--border)] text-[var(--text)] flex items-center justify-center shadow-lg hover:border-[var(--accent)] active:scale-95 transition-all"
          aria-label="Open Side Navigation Menu"
          title="Menu"
        >
          <Menu size={22} className="text-[var(--text)]" />
        </button>
      )}

      {/* Backdrop overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          aria-hidden="true"
        />
      )}

      {/* Slide-in Side Drawer */}
      <div
        className={`fixed top-0 bottom-0 left-0 z-50 w-[310px] max-w-[85vw] bg-[var(--surface)] border-r border-[var(--border)] shadow-2xl flex flex-col justify-between transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation Menu"
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-[var(--border)] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[14px] bg-[var(--accent-bg)] border border-orange-200/80 flex items-center justify-center flex-shrink-0 shadow-sm">
                <GanpatiIcon size={26} />
              </div>
              <div>
                <h2 className="text-base font-extrabold font-baloo text-[var(--text)] leading-tight">
                  Pune Ganpati Darshan
                </h2>
                <p className="text-xs font-marathi text-[var(--muted)]">
                  पुणे गणेशोत्सव २०२६
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full bg-[var(--bg)] text-[var(--muted)] hover:text-[var(--text)] flex items-center justify-center transition-colors"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>

          {/* Festival Day Pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent-bg)] text-[var(--accent)] font-baloo font-bold text-xs border border-orange-200/60">
            <Sparkles size={13} />
            <span suppressHydrationWarning>{festivalInfo.banner}</span>
          </div>
        </div>

        {/* Drawer Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="text-[11px] font-extrabold font-baloo text-[var(--muted)] uppercase tracking-wider px-3 pb-1">
            Main Navigation
          </div>

          <Link
            href="/"
            className={`flex items-center gap-3 px-3.5 py-3 rounded-[14px] text-sm font-extrabold font-baloo transition-colors ${
              pathname === "/"
                ? "bg-[var(--accent-bg)] text-[var(--accent)] border border-orange-200/60"
                : "text-[var(--text)] hover:bg-[var(--bg)]"
            }`}
          >
            <Home size={18} />
            <span>Home</span>
          </Link>

          <Link
            href="/explore"
            className={`flex items-center gap-3 px-3.5 py-3 rounded-[14px] text-sm font-extrabold font-baloo transition-colors ${
              pathname === "/explore"
                ? "bg-[var(--accent-bg)] text-[var(--accent)] border border-orange-200/60"
                : "text-[var(--text)] hover:bg-[var(--bg)]"
            }`}
          >
            <Compass size={18} />
            <span>Explore Mandals (30)</span>
          </Link>

          <Link
            href="/map"
            className={`flex items-center gap-3 px-3.5 py-3 rounded-[14px] text-sm font-extrabold font-baloo transition-colors ${
              pathname === "/map"
                ? "bg-[var(--accent-bg)] text-[var(--accent)] border border-orange-200/60"
                : "text-[var(--text)] hover:bg-[var(--bg)]"
            }`}
          >
            <Map size={18} />
            <span>Live Map & Crowd</span>
          </Link>

          <Link
            href="/routes"
            className={`flex items-center gap-3 px-3.5 py-3 rounded-[14px] text-sm font-extrabold font-baloo transition-colors ${
              pathname === "/routes"
                ? "bg-[var(--accent-bg)] text-[var(--accent)] border border-orange-200/60"
                : "text-[var(--text)] hover:bg-[var(--bg)]"
            }`}
          >
            <Route size={18} />
            <span>Curated Routes (6)</span>
          </Link>

          <Link
            href="/saved"
            className={`flex items-center gap-3 px-3.5 py-3 rounded-[14px] text-sm font-extrabold font-baloo transition-colors ${
              pathname === "/saved"
                ? "bg-[var(--accent-bg)] text-[var(--accent)] border border-orange-200/60"
                : "text-[var(--text)] hover:bg-[var(--bg)]"
            }`}
          >
            <Bookmark size={18} />
            <span>Saved Mandals & Plan</span>
          </Link>

          <div className="pt-4 pb-1">
            <div className="text-[11px] font-extrabold font-baloo text-[var(--muted)] uppercase tracking-wider px-3 pb-1 border-t border-[var(--border)] pt-3">
              Tools & Information
            </div>
          </div>

          <Link
            href="/parking"
            className={`flex items-center justify-between px-3.5 py-3 rounded-[14px] text-sm font-extrabold font-baloo transition-colors ${
              pathname === "/parking"
                ? "bg-[var(--accent-bg)] text-[var(--accent)] border border-orange-200/60"
                : "text-[var(--text)] hover:bg-[var(--bg)]"
            }`}
          >
            <div className="flex items-center gap-3">
              <Car size={18} className="text-blue-600" />
              <span>Parking & Road Closures</span>
            </div>
            <ChevronRight size={16} className="text-[var(--muted)]" />
          </Link>

          <Link
            href="/how-to-use"
            className={`flex items-center justify-between px-3.5 py-3 rounded-[14px] text-sm font-extrabold font-baloo transition-colors ${
              pathname === "/how-to-use"
                ? "bg-[var(--accent-bg)] text-[var(--accent)] border border-orange-200/60"
                : "text-[var(--text)] hover:bg-[var(--bg)]"
            }`}
          >
            <div className="flex items-center gap-3">
              <HelpCircle size={18} className="text-emerald-600" />
              <span>How to Use</span>
            </div>
            <ChevronRight size={16} className="text-[var(--muted)]" />
          </Link>

          <Link
            href="/about"
            className={`flex items-center justify-between px-3.5 py-3 rounded-[14px] text-sm font-extrabold font-baloo transition-colors ${
              pathname === "/about"
                ? "bg-[var(--accent-bg)] text-[var(--accent)] border border-orange-200/60"
                : "text-[var(--text)] hover:bg-[var(--bg)]"
            }`}
          >
            <div className="flex items-center gap-3">
              <Info size={18} className="text-amber-600" />
              <span>About & Privacy</span>
            </div>
            <ChevronRight size={16} className="text-[var(--muted)]" />
          </Link>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-[var(--border)] text-center space-y-1">
          <p className="text-[11px] font-baloo text-[var(--muted)]">
            Built for Pune Ganeshotsav Devotees
          </p>
          <p className="text-[10px] font-baloo text-[var(--muted)] opacity-80">
            100% Free · Community Real-time Guide
          </p>
        </div>
      </div>
    </>
  );
}
