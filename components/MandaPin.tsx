import React from "react";
import { CrowdStatus } from "@/lib/types";
import { CROWD_CONFIG } from "./CrowdBadge";

interface MandaPinProps {
  status?: CrowdStatus;
  selected?: boolean;
  name?: string;
  onClick?: () => void;
}

export default function MandaPin({
  status = "none",
  selected = false,
  name,
  onClick,
}: MandaPinProps) {
  const color = (CROWD_CONFIG[status] || CROWD_CONFIG.none).color;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex items-center justify-center rounded-full transition-transform duration-150 focus:outline-none tap-target ${
        selected ? "scale-150 z-30" : "hover:scale-125 z-10"
      }`}
      title={name}
    >
      <span
        className="w-4 h-4 rounded-full"
        style={{
          backgroundColor: color,
          border: "2.5px solid #FFFFFF",
          boxShadow: selected
            ? `0 0 0 3px ${color}, 0 4px 12px rgba(0,0,0,0.4)`
            : "0 2px 6px rgba(0,0,0,0.3)",
        }}
      />
    </button>
  );
}
