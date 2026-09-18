"use client";

import React from "react";
import { CrowdStatus } from "@/lib/types";

interface CrowdBadgeProps {
  status?: CrowdStatus;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const CROWD_CONFIG: Record<
  CrowdStatus,
  {
    label: string;
    bg: string;
    text: string;
    border: string;
    color: string;
    symbol: string;
  }
> = {
  short: {
    label: "✓ Short queue",
    bg: "#DCFCE7",
    text: "#166534",
    border: "#BBF7D0",
    color: "#22C55E",
    symbol: "✓",
  },
  moving: {
    label: "~ Moving",
    bg: "#FEF3C7",
    text: "#92400E",
    border: "#FDE68A",
    color: "#F59E0B",
    symbol: "~",
  },
  heavy: {
    label: "! Long wait",
    bg: "#FEE2E2",
    text: "#991B1B",
    border: "#FECACA",
    color: "#EF4444",
    symbol: "!",
  },
  none: {
    label: "? Unknown",
    bg: "#F3F4F6",
    text: "#6B7280",
    border: "#E5E7EB",
    color: "#6B7280",
    symbol: "?",
  },
};

export default function CrowdBadge({
  status = "none",
  size = "md",
  className = "",
}: CrowdBadgeProps) {
  const config = CROWD_CONFIG[status] || CROWD_CONFIG.none;

  const sizeStyle =
    size === "sm"
      ? "text-[11px] py-1 px-2.5"
      : size === "lg"
      ? "text-base py-2 px-4 font-extrabold"
      : "text-[13px] py-1.5 px-3 font-bold";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full leading-none tracking-tight select-none border ${sizeStyle} ${className}`}
      style={{
        backgroundColor: config.bg,
        color: config.text,
        borderColor: config.border,
      }}
    >
      <span className="font-extrabold">{config.symbol}</span>
      <span>{config.label.replace(/^([✓~!]\s|\?\s)/, "")}</span>
    </span>
  );
}
