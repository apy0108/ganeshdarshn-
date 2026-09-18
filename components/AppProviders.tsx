"use client";

import React from "react";
import { useAnalytics } from "@/hooks/useAnalytics";
import PWAInstallBanner from "./PWAInstallBanner";

export default function AppProviders({ children }: { children: React.ReactNode }) {
  useAnalytics();

  return (
    <>
      <PWAInstallBanner />
      {children}
    </>
  );
}
