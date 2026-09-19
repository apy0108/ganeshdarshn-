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
  Sun,
  Moon,
  Globe,
  Download,
  Bell,
} from "lucide-react";
import GanpatiIcon from "./GanpatiIcon";
import { getFestivalDayInfo } from "@/lib/festival";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { Language } from "@/lib/translations";

export default function SideNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const [festivalInfo, setFestivalInfo] = useState(() => getFestivalDayInfo());
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [notifState, setNotifState] = useState<string>("default");
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    setFestivalInfo(getFestivalDayInfo());
    if (typeof window !== "undefined") {
      if ("Notification" in window) {
        setNotifState(Notification.permission);
      }
      const standalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true;
      setIsStandalone(standalone);
    }
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

  const handleDownloadApp = () => {
    if (isStandalone) {
      alert(t("pwa_already_installed"));
      return;
    }
    window.dispatchEvent(new Event("trigger-pwa-install"));
  };

  const handleNotifications = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      try {
        const permission = await Notification.requestPermission();
        setNotifState(permission);
        if (permission === "granted") {
          alert(t("notif_enabled_alert"));
        }
      } catch {
        // Ignore
      }
    } else {
      alert(t("notif_not_supported"));
    }
  };

  const isDedicatedFlow = pathname === "/start" || (pathname && pathname.startsWith("/routes/"));

  const languages: { code: Language; label: string; native: string }[] = [
    { code: "en", label: "English", native: "English" },
    { code: "mr", label: "Marathi", native: "मराठी" },
    { code: "hi", label: "Hindi", native: "हिंदी" },
  ];

  return (
    <>
      {/* Floating Side Navigation Hamburger Trigger Button (TOP LEFT) */}
      {!isDedicatedFlow && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed top-4 left-4 z-40 w-11 h-11 rounded-full bg-[var(--surface)]/95 backdrop-blur-md border-[1.5px] border-[var(--border)] text-[var(--text)] flex items-center justify-center shadow-lg hover:border-[var(--accent)] active:scale-95 transition-all"
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
        className={`fixed top-0 bottom-0 left-0 z-50 w-[320px] max-w-[85vw] bg-[var(--surface)] border-r border-[var(--border)] shadow-2xl flex flex-col justify-between transition-transform duration-300 ease-out ${
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
                  {t("app_title")}
                </h2>
                <p className="text-xs font-marathi text-[var(--muted)]">
                  {t("app_subtitle")}
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
            <span suppressHydrationWarning>
              {festivalInfo.status === "active" && festivalInfo.dayNumber
                ? t("festival_banner_active", { day: festivalInfo.dayNumber })
                : festivalInfo.status === "upcoming"
                ? t("festival_banner_upcoming", { days: festivalInfo.pill.replace(/\D/g, "") || "1" })
                : t("festival_banner_ended")}
            </span>
          </div>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
          {/* Main Nav Links */}
          <div className="space-y-1">
            <div className="text-[11px] font-extrabold font-baloo text-[var(--muted)] uppercase tracking-wider px-3 pb-1">
              {t("main_nav")}
            </div>

            <Link
              href="/"
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-[14px] text-sm font-extrabold font-baloo transition-colors ${
                pathname === "/"
                  ? "bg-[var(--accent-bg)] text-[var(--accent)] border border-orange-200/60"
                  : "text-[var(--text)] hover:bg-[var(--bg)]"
              }`}
            >
              <Home size={18} />
              <span>{t("home")}</span>
            </Link>

            <Link
              href="/explore"
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-[14px] text-sm font-extrabold font-baloo transition-colors ${
                pathname === "/explore"
                  ? "bg-[var(--accent-bg)] text-[var(--accent)] border border-orange-200/60"
                  : "text-[var(--text)] hover:bg-[var(--bg)]"
              }`}
            >
              <Compass size={18} />
              <span>{t("explore")}</span>
            </Link>

            <Link
              href="/map"
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-[14px] text-sm font-extrabold font-baloo transition-colors ${
                pathname === "/map"
                  ? "bg-[var(--accent-bg)] text-[var(--accent)] border border-orange-200/60"
                  : "text-[var(--text)] hover:bg-[var(--bg)]"
              }`}
            >
              <Map size={18} />
              <span>{t("live_map")}</span>
            </Link>

            <Link
              href="/routes"
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-[14px] text-sm font-extrabold font-baloo transition-colors ${
                pathname === "/routes"
                  ? "bg-[var(--accent-bg)] text-[var(--accent)] border border-orange-200/60"
                  : "text-[var(--text)] hover:bg-[var(--bg)]"
              }`}
            >
              <Route size={18} />
              <span>{t("curated_routes")}</span>
            </Link>

            <Link
              href="/saved"
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-[14px] text-sm font-extrabold font-baloo transition-colors ${
                pathname === "/saved"
                  ? "bg-[var(--accent-bg)] text-[var(--accent)] border border-orange-200/60"
                  : "text-[var(--text)] hover:bg-[var(--bg)]"
              }`}
            >
              <Bookmark size={18} />
              <span>{t("saved_mandals")}</span>
            </Link>
          </div>

          {/* Preferences Section: Language & Appearance */}
          <div className="pt-2 border-t border-[var(--border)] space-y-3 px-1">
            {/* Language Selector */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-[11px] font-extrabold font-baloo text-[var(--muted)] uppercase tracking-wider px-2">
                <Globe size={13} />
                <span>{t("language_label")}</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 p-1 rounded-[14px] bg-[var(--bg)] border border-[var(--border)]">
                {languages.map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => setLanguage(item.code)}
                    className={`py-1.5 px-2 rounded-[10px] text-xs font-baloo font-bold transition-all ${
                      language === item.code
                        ? "bg-[var(--surface)] text-[var(--accent)] shadow-sm border border-orange-200 font-extrabold"
                        : "text-[var(--muted)] hover:text-[var(--text)]"
                    }`}
                  >
                    {item.native}
                  </button>
                ))}
              </div>
            </div>

            {/* Appearance / Theme Toggle */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-[11px] font-extrabold font-baloo text-[var(--muted)] uppercase tracking-wider px-2">
                <Sun size={13} />
                <span>{t("appearance")}</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 p-1 rounded-[14px] bg-[var(--bg)] border border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setTheme("light")}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-[10px] text-xs font-baloo font-bold transition-all ${
                    theme === "light"
                      ? "bg-[var(--surface)] text-[var(--accent)] shadow-sm border border-orange-200 font-extrabold"
                      : "text-[var(--muted)] hover:text-[var(--text)]"
                  }`}
                >
                  <Sun size={14} />
                  <span>{t("light_mode")}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme("dark")}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-[10px] text-xs font-baloo font-bold transition-all ${
                    theme === "dark"
                      ? "bg-[var(--surface)] text-[var(--accent)] shadow-sm border border-orange-200 font-extrabold"
                      : "text-[var(--muted)] hover:text-[var(--text)]"
                  }`}
                >
                  <Moon size={14} />
                  <span>{t("dark_mode")}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Tools, App & Information */}
          <div className="space-y-1 pt-1">
            <div className="text-[11px] font-extrabold font-baloo text-[var(--muted)] uppercase tracking-wider px-3 pb-1 border-t border-[var(--border)] pt-3">
              {t("tools_info")}
            </div>

            <button
              type="button"
              onClick={handleDownloadApp}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-[14px] text-sm font-extrabold font-baloo text-[var(--text)] hover:bg-[var(--bg)] transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <Download size={18} className="text-emerald-600" />
                <span>{t("download_app")}</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                isStandalone
                  ? "bg-slate-100 text-slate-700"
                  : "bg-emerald-100 text-emerald-800"
              }`}>
                {isStandalone ? t("pwa_installed_badge") : t("pwa_badge")}
              </span>
            </button>

            <button
              type="button"
              onClick={handleNotifications}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-[14px] text-sm font-extrabold font-baloo text-[var(--text)] hover:bg-[var(--bg)] transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <Bell size={18} className="text-amber-600" />
                <span>{t("notifications")}</span>
              </div>
              <span className="text-[10px] text-[var(--muted)] font-bold">
                {notifState === "granted" ? t("notif_active") : t("notif_enable")}
              </span>
            </button>

            <Link
              href="/parking"
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-[14px] text-sm font-extrabold font-baloo transition-colors ${
                pathname === "/parking"
                  ? "bg-[var(--accent-bg)] text-[var(--accent)] border border-orange-200/60"
                  : "text-[var(--text)] hover:bg-[var(--bg)]"
              }`}
            >
              <div className="flex items-center gap-3">
                <Car size={18} className="text-blue-600" />
                <span>{t("parking_closures")}</span>
              </div>
              <ChevronRight size={16} className="text-[var(--muted)]" />
            </Link>

            <Link
              href="/how-to-use"
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-[14px] text-sm font-extrabold font-baloo transition-colors ${
                pathname === "/how-to-use"
                  ? "bg-[var(--accent-bg)] text-[var(--accent)] border border-orange-200/60"
                  : "text-[var(--text)] hover:bg-[var(--bg)]"
              }`}
            >
              <div className="flex items-center gap-3">
                <HelpCircle size={18} className="text-purple-600" />
                <span>{t("how_to_use")}</span>
              </div>
              <ChevronRight size={16} className="text-[var(--muted)]" />
            </Link>

            <Link
              href="/about"
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-[14px] text-sm font-extrabold font-baloo transition-colors ${
                pathname === "/about"
                  ? "bg-[var(--accent-bg)] text-[var(--accent)] border border-orange-200/60"
                  : "text-[var(--text)] hover:bg-[var(--bg)]"
              }`}
            >
              <div className="flex items-center gap-3">
                <Info size={18} className="text-orange-600" />
                <span>{t("about_privacy")}</span>
              </div>
              <ChevronRight size={16} className="text-[var(--muted)]" />
            </Link>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-[var(--border)] text-center space-y-1">
          <p className="text-[11px] font-baloo text-[var(--muted)]">
            {t("footer_tagline")}
          </p>
          <p className="text-[10px] font-baloo text-[var(--muted)] opacity-80">
            {t("footer_subtagline")}
          </p>
        </div>
      </div>
    </>
  );
}
