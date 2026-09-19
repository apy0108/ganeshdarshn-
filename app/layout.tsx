import type { Metadata, Viewport } from "next";
import { Baloo_2, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import AppProviders from "@/components/AppProviders";
import SideNav from "@/components/SideNav";
import { Analytics } from "@vercel/analytics/react";

const baloo = Baloo_2({
  weight: ["400", "600", "800"],
  subsets: ["devanagari", "latin", "latin-ext"],
  variable: "--font-baloo",
  display: "swap",
});

const notoSansDevanagari = Noto_Sans_Devanagari({
  weight: ["400", "600"],
  subsets: ["devanagari", "latin"],
  variable: "--font-noto-devanagari",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pune Ganpati Darshan — Live Queues, Routes & Map",
  description: "Real-time queue tracker, curated walking routes, parking, and map for Pune Ganeshotsav festival.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icons/icon-192.svg",
    apple: "/icons/icon-192.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#14100C",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${baloo.variable} ${notoSansDevanagari.variable}`}>
      <body className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-sans antialiased selection:bg-[var(--accent-bg)] selection:text-[var(--accent)]">
        <ServiceWorkerRegister />
        <AppProviders>
          <main className="min-h-screen pb-24">{children}</main>
          <SideNav />
          <Nav />
        </AppProviders>
        <Analytics />
      </body>
    </html>
  );
}
