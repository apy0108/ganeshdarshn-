import React from "react";

interface GanpatiIconProps {
  size?: number;
  className?: string;
}

export default function GanpatiIcon({ size = 36, className = "" }: GanpatiIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer subtle glow circle */}
      <circle cx="24" cy="24" r="22" fill="#FFF0E6" />
      
      {/* Stylized Ganpati / Modak / Tilak Icon */}
      {/* Crown / Triratna top */}
      <path
        d="M24 8L26.5 13H21.5L24 8Z"
        fill="#D4520F"
      />
      {/* Traditional Tilak */}
      <path
        d="M21 15C21 15 24 14 27 15V19C25.5 20.5 22.5 20.5 21 19V15Z"
        fill="#D4520F"
      />
      <circle cx="24" cy="17.5" r="1.5" fill="#FFFFFF" />

      {/* Ears */}
      <path
        d="M17 19C13 19 11 23 13 27C14.5 30 18 29 18 29"
        stroke="#D4520F"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M31 19C35 19 37 23 35 27C33.5 30 30 29 30 29"
        stroke="#D4520F"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Trunk (Sond) */}
      <path
        d="M24 22V28C24 31 21.5 33 19.5 32C17.5 31 18 28.5 20 28.5"
        stroke="#D4520F"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Modak in Hand / Base Lotus Accent */}
      <path
        d="M14 38C19 35 29 35 34 38C30 41 18 41 14 38Z"
        fill="#D4520F"
      />
    </svg>
  );
}
