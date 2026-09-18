"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Map, Route, Bookmark, LucideIcon } from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { name: "Home", href: "/", icon: Home },
  { name: "Explore", href: "/explore", icon: Compass },
  { name: "Map", href: "/map", icon: Map },
  { name: "Routes", href: "/routes", icon: Route },
  { name: "Saved", href: "/saved", icon: Bookmark },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--surface)] border-t-[1.5px] border-[var(--border)] pb-[env(safe-area-inset-bottom,0px)]">
      <div className="max-w-md mx-auto flex items-center justify-around h-[60px] px-1">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`relative flex flex-col items-center justify-center flex-1 h-full tap-target transition-colors duration-150 ${
                isActive ? "text-[var(--accent)]" : "text-[var(--muted)] hover:text-[var(--text)]"
              }`}
            >
              <Icon size={26} className="transition-transform" />
              {isActive && (
                <>
                  <span className="text-[11px] font-baloo font-semibold leading-tight mt-0.5">
                    {item.name}
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
