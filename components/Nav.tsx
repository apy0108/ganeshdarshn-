"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Map, MoreHorizontal, Bookmark, LucideIcon } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Translations } from "@/lib/translations";

interface NavItem {
  key: keyof Translations;
  nameFallback: string;
  href: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { key: "home", nameFallback: "Home", href: "/", icon: Home },
  { key: "explore", nameFallback: "Explore", href: "/explore", icon: Compass },
  { key: "live_map", nameFallback: "Map", href: "/map", icon: Map },
  { key: "more", nameFallback: "More", href: "/more", icon: MoreHorizontal },
  { key: "saved_mandals", nameFallback: "Saved", href: "/saved", icon: Bookmark },
];

export default function Nav() {
  const pathname = usePathname();
  const { language } = useLanguage();

  // Hide bottom navigation on dedicated wizard and tour navigation pages
  if (pathname === "/start" || pathname === "/plan" || (pathname && pathname.startsWith("/routes/"))) {
    return null;
  }

  const getShortName = (item: NavItem) => {
    if (language === "mr") {
      switch (item.key) {
        case "home": return "मुख्य";
        case "explore": return "एक्सप्लोर";
        case "live_map": return "नकाशा";
        case "more": return "अधिक";
        case "saved_mandals": return "जतन";
        default: return item.nameFallback;
      }
    } else if (language === "hi") {
      switch (item.key) {
        case "home": return "होम";
        case "explore": return "एक्सप्लोर";
        case "live_map": return "नक्शा";
        case "more": return "अधिक";
        case "saved_mandals": return "सहेजे गए";
        default: return item.nameFallback;
      }
    }
    return item.nameFallback;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--surface)] border-t-[1.5px] border-[var(--border)] pb-[env(safe-area-inset-bottom,0px)]">
      <div className="max-w-md mx-auto flex items-center justify-around h-[60px] px-1">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          const Icon = item.icon;
          const label = getShortName(item);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center flex-1 h-full tap-target transition-colors duration-150 ${
                isActive ? "text-[var(--accent)]" : "text-[var(--muted)] hover:text-[var(--text)]"
              }`}
            >
              <Icon size={26} className="transition-transform" />
              {isActive && (
                <>
                  <span className="text-[11px] font-baloo font-semibold leading-tight mt-0.5">
                    {label}
                  </span>
                  <span className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full mt-0.5" />
                </>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
