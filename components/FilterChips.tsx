"use client";

import React from "react";

export interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

interface FilterChipsProps {
  options: FilterOption[];
  selectedId: string;
  onSelect: (id: string) => void;
  className?: string;
}

export default function FilterChips({
  options,
  selectedId,
  onSelect,
  className = "",
}: FilterChipsProps) {
  return (
    <div className={`flex items-center gap-2 overflow-x-auto no-scrollbar py-1 ${className}`}>
      {options.map((option) => {
        const isSelected = selectedId === option.id;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onSelect(option.id)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 border ${
              isSelected
                ? "bg-[#18181B] text-white border-[#18181B] shadow-sm"
                : "bg-[#FFFFFF] text-[#71717A] border-[#E4E4E7] hover:border-[#71717A] hover:text-[#18181B]"
            }`}
          >
            {option.label}
            {option.count !== undefined && (
              <span
                className={`ml-1.5 text-[10px] ${
                  isSelected ? "text-zinc-300" : "text-[#71717A]"
                }`}
              >
                {option.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
