"use client";

import React from "react";
import Link from "next/link";
import {
  Car,
  Bookmark,
  Info,
  HelpCircle,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  MapPin,
  Sparkles,
} from "lucide-react";

interface MoreOption {
  title: string;
  subtitle: string;
  marathi: string;
  href: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  badge?: string;
}

const MORE_OPTIONS: MoreOption[] = [
  {
    title: "Parking & Road Closures",
    subtitle: "23 police designated parking lots & evening road closures",
    marathi: "पार्किंग आणि वाहतूक माहिती",
    href: "/parking",
    icon: Car,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-700",
    badge: "23 Lots",
  },
  {
    title: "Saved Mandals & Plan",
    subtitle: "Your bookmarked Ganpati mandals and active darshan route",
    marathi: "जतन केलेले गणपती व मार्ग",
    href: "/saved",
    icon: Bookmark,
    iconBg: "bg-orange-100",
    iconColor: "text-[var(--accent)]",
  },
  {
    title: "How to Use",
    subtitle: "Simple 5-step guide to live queue tracking & route planning",
    marathi: "मार्गदर्शक आणि वापर कसा करावा",
    href: "/how-to-use",
    icon: HelpCircle,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-800",
    badge: "Guide",
  },
  {
    title: "About & Privacy",
    subtitle: "Why we built this, zero-tracking manifesto & data controls",
    marathi: "माहिती व गोपनीयता धोरण",
    href: "/about",
    icon: Info,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-800",
  },
];

export default function MorePage() {
  return (
    <div className="max-w-md mx-auto min-h-screen bg-[var(--bg)] pb-28 font-sans">
      {/* Header */}
      <div className="px-4 pt-6 pb-4 border-b border-[var(--border)] bg-[var(--surface)]">
        <h1 className="text-2xl font-extrabold font-baloo text-[var(--text)] leading-tight">
          More Options
        </h1>
        <p className="text-xs font-marathi text-[var(--muted)] pt-0.5">
          अधिक माहिती आणि सुविधा
        </p>
      </div>

      {/* Navigation Options List */}
      <div className="p-4 space-y-3">
        {MORE_OPTIONS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-between p-4 rounded-[20px] bg-[var(--card-bg)] border-[1.5px] border-[var(--border)] shadow-sm hover:border-[var(--accent)] active:scale-[0.98] transition-all group"
            >
              <div className="flex items-center gap-3.5 pr-2">
                <div
                  className={`w-12 h-12 rounded-[16px] ${item.iconBg} ${item.iconColor} flex items-center justify-center flex-shrink-0`}
                >
                  <Icon size={24} />
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-extrabold font-baloo text-[var(--text)] leading-snug group-hover:text-[var(--accent)] transition-colors">
                      {item.title}
                    </h2>
                    {item.badge && (
                      <span className="px-2 py-0.5 rounded-full bg-[var(--accent-bg)] text-[var(--accent)] text-[10px] font-extrabold font-baloo">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--muted)] font-baloo leading-snug">
                    {item.subtitle}
                  </p>
                  <p className="text-[11px] text-[var(--muted)]/80 font-marathi">
                    {item.marathi}
                  </p>
                </div>
              </div>

              <div className="text-[var(--muted)] group-hover:text-[var(--accent)] transition-colors flex-shrink-0">
                <ChevronRight size={20} />
              </div>
            </Link>
          );
        })}
      </div>

      {/* App Info Footer */}
      <div className="px-6 py-6 text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100/70 border border-orange-200/60 text-orange-900 text-xs font-baloo font-bold">
          <ShieldCheck size={14} className="text-[var(--accent)]" />
          <span>100% Free & Non-commercial</span>
        </div>
        <p className="text-xs font-baloo text-[var(--muted)] leading-relaxed">
          Pune Ganpati Darshan • Built for Pune Ganeshotsav Devotees
        </p>
        <p className="text-[11px] font-baloo text-[var(--muted)]/70">
          Zero tracking • No ads • Real-time crowd updates
        </p>
      </div>
    </div>
  );
}
