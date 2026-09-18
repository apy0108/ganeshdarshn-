"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Map,
  Compass,
  Sparkles,
  Navigation,
  CheckCircle2,
  Clock,
  Footprints,
  Car,
  Heart,
  ExternalLink,
} from "lucide-react";
import GanpatiIcon from "@/components/GanpatiIcon";

export default function HowToUsePage() {
  const steps = [
    {
      step: "1",
      title: "Open the Map",
      marathiTitle: "नकाशा उघडा",
      desc: "See all 30 Pune Ganpati mandals plotted with live queue colors: Green for short, Amber for flowing, Red for heavy wait times.",
      icon: Map,
      bg: "bg-emerald-50 border-emerald-200 text-emerald-900",
      iconBg: "bg-emerald-600 text-white",
    },
    {
      step: "2",
      title: "Tap Any Mandal for Live Details",
      marathiTitle: "मंडळाची माहिती व रांग स्थिती",
      desc: "Check real crowd queue times, temple history, photos, walking distances to neighboring pandals, and single-tap directions.",
      icon: Compass,
      bg: "bg-orange-50 border-orange-200 text-orange-950",
      iconBg: "bg-[var(--accent)] text-white",
    },
    {
      step: "3",
      title: "Build a Custom Route",
      marathiTitle: "स्वतःचा दर्शन मार्ग तयार करा",
      desc: "Tell the Route Wizard how many hours you have (1 to 6 hrs), what you want to see (Manache Paach, Dekhavas, Calm Temples), and your transport mode (Walk / Metro / 2-Wheeler).",
      icon: Sparkles,
      bg: "bg-amber-50 border-amber-200 text-amber-950",
      iconBg: "bg-amber-600 text-white",
    },
    {
      step: "4",
      title: "Open Route in Google Maps",
      marathiTitle: "गुगल मॅप्सवर नेव्हिगेशन सुरू करा",
      desc: "Hit 'Open Route in Google Maps' to launch step-by-step turn-by-turn walking directions directly on your phone, with automatic multi-leg handling.",
      icon: Navigation,
      bg: "bg-blue-50 border-blue-200 text-blue-950",
      iconBg: "bg-blue-600 text-white",
    },
    {
      step: "5",
      title: "Report Queues When You Arrive",
      marathiTitle: "थेट रांग स्थिती नोंदवा",
      desc: "When standing at a mandal, tap Short, Moving, or Heavy. Your anonymous update updates the map for thousands of fellow devotees in real time!",
      icon: CheckCircle2,
      bg: "bg-purple-50 border-purple-200 text-purple-950",
      iconBg: "bg-purple-600 text-white",
    },
  ];

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[var(--bg)] pb-28 font-sans">
      {/* Top Header */}
      <div className="px-4 pt-5 pb-3 flex items-center justify-between">
        <Link
          href="/"
          className="tap-target p-2 -ml-2 text-[var(--muted)] hover:text-[var(--text)]"
        >
          <ArrowLeft size={22} />
        </Link>
        <h1 className="text-base font-extrabold font-baloo text-[var(--text)]">
          How to Use
        </h1>
        <div className="w-8" />
      </div>

      {/* Hero */}
      <div className="px-4 py-2 space-y-4">
        <div className="p-5 rounded-[22px] bg-gradient-to-r from-[#241408] to-[#120800] text-white space-y-2 shadow-md">
          <div className="flex items-center gap-2.5">
            <GanpatiIcon size={32} />
            <h2 className="text-xl font-extrabold font-baloo text-white">
              Guide to Pune Darshan
            </h2>
          </div>
          <p className="text-xs font-baloo text-orange-200/90 leading-relaxed">
            Five simple steps to beat the festival rush, discover historic mandals, and navigate the Peths easily.
          </p>
        </div>

        {/* Steps List */}
        <div className="space-y-3 pt-1">
          {steps.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className={`p-4 rounded-[20px] border shadow-sm space-y-2.5 ${item.bg}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-full font-baloo font-black text-xs flex items-center justify-center shadow ${item.iconBg}`}
                    >
                      {item.step}
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold font-baloo leading-tight">
                        {item.title}
                      </h3>
                      <span className="text-[11px] font-marathi opacity-80">
                        {item.marathiTitle}
                      </span>
                    </div>
                  </div>

                  <div className={`p-2 rounded-xl ${item.iconBg} shadow-sm`}>
                    <Icon size={16} />
                  </div>
                </div>

                <p className="text-xs font-baloo leading-relaxed opacity-90 pl-9">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Action CTAs */}
        <div className="pt-3 space-y-2.5">
          <Link
            href="/start"
            className="w-full h-[54px] rounded-[16px] bg-[var(--accent)] text-white text-base font-extrabold font-baloo flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-all"
          >
            <span>✦</span> Build My Darshan Route
          </Link>

          <Link
            href="/map"
            className="w-full h-[50px] rounded-[16px] bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] text-sm font-extrabold font-baloo flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-all"
          >
            <Map size={16} /> Open Interactive Map
          </Link>
        </div>
      </div>
    </div>
  );
}
