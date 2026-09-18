"use client";

import React, { useState, useEffect } from "react";
import { Download, X, Sparkles, Smartphone } from "lucide-react";
import GanpatiIcon from "./GanpatiIcon";

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Do NOT show banner if already running in standalone PWA mode
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) return;

    try {
      const dismissed = localStorage.getItem("pg.pwa_dismissed");
      if (dismissed) return;

      const visits = parseInt(localStorage.getItem("pg.visits") || "0", 10) + 1;
      localStorage.setItem("pg.visits", visits.toString());

      if (visits >= 2) {
        setShowBanner(true);
      }
    } catch {}

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const dismissed = localStorage.getItem("pg.pwa_dismissed");
      const visits = parseInt(localStorage.getItem("pg.visits") || "0", 10);
      if (!dismissed && visits >= 2) {
        setShowBanner(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    try {
      localStorage.setItem("pg.pwa_dismissed", "true");
    } catch {}

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } else {
      alert("Tap your browser's share or menu button (⋮ / ⎙) and select 'Add to Home Screen'!");
      setShowBanner(false);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    try {
      localStorage.setItem("pg.pwa_dismissed", "true");
    } catch {}
  };

  if (!showBanner) return null;

  return (
    <div className="fixed top-3 inset-x-3 z-50 max-w-md mx-auto p-3.5 rounded-[20px] bg-gradient-to-r from-[#241408] to-[#120800] text-white border border-orange-500/30 shadow-2xl animate-in slide-in-from-top duration-300">
      <div className="flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-[12px] bg-orange-600/20 border border-orange-500/40 flex items-center justify-center flex-shrink-0">
            <GanpatiIcon size={24} />
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs font-extrabold font-baloo text-white">
              <span>Install Ganpati Darshan</span>
              <span className="px-1.5 py-0.2 rounded-full bg-orange-500/30 text-[10px] text-orange-300">
                PWA App
              </span>
            </div>
            <p className="text-[11px] font-baloo text-orange-200/80">
              Fast, offline queues & maps on your home screen.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            type="button"
            onClick={handleInstall}
            className="h-8 px-3 rounded-full bg-[var(--accent)] hover:bg-orange-600 text-white text-xs font-extrabold font-baloo flex items-center gap-1 active:scale-95 transition-all shadow"
          >
            <Download size={13} />
            Add
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            className="p-1 text-white/50 hover:text-white"
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
