"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function useAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    try {
      let sessionId = sessionStorage.getItem("pg.session");
      if (!sessionId) {
        sessionId = crypto.randomUUID ? crypto.randomUUID() : `sess_${Date.now()}`;
        sessionStorage.setItem("pg.session", sessionId);
        localStorage.setItem("pg.session", sessionId);
      }

      const referrer = document.referrer || "";

      fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page: pathname,
          referrer,
          sessionId,
        }),
      }).catch(() => {});
    } catch {}
  }, [pathname]);
}
