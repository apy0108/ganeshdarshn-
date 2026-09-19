"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, X, MapPin } from "lucide-react";
import { Mandal } from "@/lib/types";
import { useLanguage } from "@/context/LanguageContext";

interface HomeHeroCarouselProps {
  mandals: Mandal[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  searchResults: Mandal[];
  onClearSearch: () => void;
}

const AUTO_SLIDE_INTERVAL = 35000; // 35 seconds per instruction

export default function HomeHeroCarousel({
  mandals,
  searchQuery,
  onSearchChange,
  searchResults,
  onClearSearch,
}: HomeHeroCarouselProps) {
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter mandals with valid genuine photos in stable order
  const slides: Mandal[] = useMemo(() => {
    return mandals.filter(
      (m) =>
        m.imageUrl &&
        m.imageUrl !== "/images/mandals/pune-pandal-default.jpg" &&
        m.verified
    );
  }, [mandals]);

  // Timer reset & management
  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (slides.length <= 1 || isSearchFocused || searchQuery.trim().length > 0) {
      return;
    }

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, AUTO_SLIDE_INTERVAL);
  }, [slides.length, isSearchFocused, searchQuery]);

  // Set up rotation timer
  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [resetTimer]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    resetTimer();
  };

  const nextSlide = () => {
    if (slides.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % slides.length);
    resetTimer();
  };

  const prevSlide = () => {
    if (slides.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
    resetTimer();
  };

  // Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const diff = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 45;

    if (Math.abs(diff) > minSwipeDistance) {
      if (diff > 0) {
        // Swiped left -> next slide
        nextSlide();
      } else {
        // Swiped right -> prev slide
        prevSlide();
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Current slide
  const currentMandal = slides[currentIndex] || slides[0];

  if (!currentMandal) {
    return null;
  }

  // Placeholder text cleanup (remove leading emoji if existing translation has it)
  const placeholderText = t("search_placeholder").replace(/^[🔍\s]+/g, "");

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Main Large Rounded Hero Card */}
      <div
        className="relative w-full h-[320px] sm:h-[350px] rounded-[28px] border-[1.5px] border-[var(--border)] bg-[#1A0F07] shadow-lg select-none transition-shadow hover:shadow-xl"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        role="region"
        aria-roledescription="carousel"
        aria-label="Pune Ganpatis Featured Carousel"
      >
        {/* Inner Slides Wrapper (clips images cleanly to rounded card corners) */}
        <div className="absolute inset-0 rounded-[28px] overflow-hidden">
          {/* Slides / Images */}
          {slides.map((mandal, idx) => {
            const isActive = idx === currentIndex;
            const hasError = imageErrors[mandal.id];
            const initialLetter = mandal.name.replace(/^(Shree|Shrimant|The)\s+/i, "")[0] || "ग";

            return (
              <div
                key={mandal.id}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                }`}
                aria-hidden={!isActive}
              >
                {mandal.imageUrl && !hasError ? (
                  <Image
                    src={mandal.imageUrl}
                    alt={mandal.name}
                    fill
                    sizes="(max-width: 640px) 100vw, 420px"
                    priority={idx === 0}
                    className="object-cover transition-transform duration-1000 scale-100 ease-out"
                    onError={() => setImageErrors((prev) => ({ ...prev, [mandal.id]: true }))}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#E8621A] to-[#D4520F] flex flex-col items-center justify-center text-white">
                    <span className="text-6xl font-extrabold font-baloo drop-shadow-md">
                      {initialLetter}
                    </span>
                    <span className="text-sm font-marathi opacity-90 mt-1">
                      {mandal.nameMarathi}
                    </span>
                  </div>
                )}

                {/* Clickable link to mandal detail on background touch/click */}
                <Link
                  href={`/ganpati/${mandal.id}`}
                  className="absolute inset-0 z-10"
                  aria-label={`View details of ${mandal.name}`}
                  tabIndex={isActive ? 0 : -1}
                />
              </div>
            );
          })}

          {/* Ambient Top & Bottom Gradients for Contrast */}
          <div className="absolute inset-0 pointer-events-none z-10 bg-gradient-to-t from-black/85 via-black/25 to-black/30" />
        </div>

        {/* Bottom Section: Active Mandal Info + Integrated Floating Search Bar + Dots */}
        <div className="absolute inset-x-0 bottom-0 z-20 p-3.5 sm:p-4 flex flex-col space-y-2.5">
          {/* Active Mandal Title (Subtle & clean) */}
          <Link
            href={`/ganpati/${currentMandal.id}`}
            className="inline-flex items-center gap-1.5 text-white drop-shadow-sm hover:underline self-start max-w-[85%]"
          >
            <MapPin size={13} className="text-orange-400 flex-shrink-0" />
            <span className="text-xs font-extrabold font-baloo truncate text-white/95">
              {currentMandal.name} • {currentMandal.area}
            </span>
          </Link>

          {/* Integrated Floating Pill Search Bar */}
          <div className="relative w-full">
            <div
              className={`relative flex items-center w-full h-[48px] sm:h-[50px] rounded-full bg-[var(--surface)] text-[var(--text)] border-[1.5px] shadow-xl backdrop-blur-md transition-all ${
                isSearchFocused
                  ? "border-[var(--accent)] ring-2 ring-[var(--accent)]/30"
                  : "border-[var(--border)]"
              }`}
            >
              <Search
                size={18}
                className="absolute left-4 text-[var(--muted)] pointer-events-none flex-shrink-0"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onFocus={() => {
                  setIsSearchFocused(true);
                  if (timerRef.current) clearInterval(timerRef.current);
                }}
                onBlur={() => {
                  // Delay so clicks inside dropdown register
                  setTimeout(() => {
                    setIsSearchFocused(false);
                    resetTimer();
                  }, 250);
                }}
                placeholder={placeholderText}
                className="w-full h-full pl-11 pr-10 rounded-full bg-transparent text-[var(--text)] font-baloo text-[14px] sm:text-[15px] placeholder:text-[var(--muted)] placeholder:font-medium focus:outline-none"
                aria-label="Search Ganpati, area or mandal"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={onClearSearch}
                  className="absolute right-3.5 p-1 rounded-full text-[var(--muted)] hover:text-[var(--text)] active:scale-95 transition-transform"
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Instant Search Results Dropdown Overlay */}
            {searchQuery.trim().length > 0 && isSearchFocused && (
              <div
                className="absolute top-full inset-x-0 mt-2 z-50 max-h-72 overflow-y-auto rounded-[20px] bg-[var(--surface)] text-[var(--text)] border-[1.5px] border-[var(--border)] shadow-2xl p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150"
                onMouseDown={(e) => e.preventDefault()} // Prevent premature blur
              >
                {searchResults.length > 0 ? (
                  <>
                    {searchResults.map((m) => (
                      <Link
                        key={m.id}
                        href={`/ganpati/${m.id}`}
                        onClick={() => {
                          onClearSearch();
                          setIsSearchFocused(false);
                        }}
                        className="flex items-center justify-between p-2.5 rounded-[14px] hover:bg-[var(--accent-bg)] active:scale-[0.99] transition-all border border-transparent hover:border-[var(--border)]"
                      >
                        <div className="space-y-0.5 min-w-0 pr-2">
                          <div className="text-sm font-extrabold font-baloo text-[var(--text)] leading-tight truncate">
                            {m.name}
                          </div>
                          <div className="text-xs font-marathi text-[var(--muted)] truncate">
                            {m.nameMarathi} • {m.area}
                          </div>
                        </div>
                      </Link>
                    ))}
                    <div className="pt-2 border-t border-[var(--border)] px-2 pb-1 text-center">
                      <Link
                        href={`/explore?q=${encodeURIComponent(searchQuery)}`}
                        onClick={() => {
                          onClearSearch();
                          setIsSearchFocused(false);
                        }}
                        className="text-xs font-extrabold font-baloo text-[var(--accent)] hover:underline"
                      >
                        {t("view_all_explore")}
                      </Link>
                    </div>
                  </>
                ) : (
                  <div className="py-6 text-center text-xs font-baloo text-[var(--muted)]">
                    {t("no_results")} "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Pagination Dots (matching dynamic number of valid slides) */}
          {slides.length > 1 && (
            <div
              className="flex items-center justify-center gap-1.5 pt-0.5"
              role="tablist"
              aria-label="Carousel pagination"
            >
              {slides.map((slide, dotIdx) => {
                const isDotActive = dotIdx === currentIndex;
                return (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => goToSlide(dotIdx)}
                    className={`transition-all duration-300 rounded-full ${
                      isDotActive
                        ? "w-5 h-2 bg-[var(--accent)] shadow-sm"
                        : "w-2 h-2 bg-white/50 hover:bg-white/80"
                    }`}
                    aria-label={`Go to slide ${dotIdx + 1}: ${slide.name}`}
                    aria-selected={isDotActive}
                    role="tab"
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
