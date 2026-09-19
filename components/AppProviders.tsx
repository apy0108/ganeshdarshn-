"use client";

import React from "react";
import { useAnalytics } from "@/hooks/useAnalytics";
import PWAInstallBanner from "./PWAInstallBanner";
import { LanguageProvider } from "@/context/LanguageContext";
import { ThemeProvider } from "@/context/ThemeContext";

export default function AppProviders({ children }: { children: React.ReactNode }) {
  useAnalytics();

  return (
    <ThemeProvider>
      <LanguageProvider>
        <PWAInstallBanner />
        {children}
      </LanguageProvider>
    </ThemeProvider>
  );
}