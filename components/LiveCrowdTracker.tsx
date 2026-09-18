"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, ChevronRight } from "lucide-react";
import { Mandal, LiveCrowd, CrowdStatus } from "@/lib/types";
import { subscribeToLiveCrowd } from "@/lib/firebase";
import CrowdBadge, { CROWD_CONFIG } from "./CrowdBadge";

interface LiveCrowdTrackerProps {
  mandals: Mandal[];
}

export default function LiveCrowdTracker({ mandals }: LiveCrowdTrackerProps) {
  const [crowdData, setCrowdData] = useState<Record<string, LiveCrowd>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToLiveCrowd((data) => {
      setCrowdData(data || {});
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const activeReports = Object.values(crowdData).filter(
    (item) => item.status && item.status !== "none"
  );

  const mandalsWithLiveStatus = activeReports
    .map((report) => {
      const mandal = mandals.find((m) => m.id === report.mandalId);
      return mandal ? { mandal, report } : null;
    })
    .filter(Boolean) as { mandal: Mandal; report: LiveCrowd }[];

  const statusRank: Record<CrowdStatus, number> = {
    short: 1,
    moving: 2,
    heavy: 3,
    none: 4,
  };

  mandalsWithLiveStatus.sort(
    (a, b) => statusRank[a.report.status] - statusRank[b.report.status]
  );

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[20px] font-extrabold font-baloo text-[var(--text)] leading-tight">
            Live Queue Status
          </h2>
          <p className="text-xs font-marathi text-[var(--muted)]">
            थेट दर्शन रांग स्थिती
          </p>
        </div>

        <Link
          href="/map"
          className="inline-flex items-center gap-1 text-xs font-extrabold font-baloo text-[var(--accent)] hover:underline"
        >
          View Map <ChevronRight size={14} />
        </Link>
      </div>

      {loading ? (
        <div className="p-4 rounded-[16px] bg-[var(--card-bg)] border border-[var(--border)] text-center text-xs font-baloo text-[var(--muted)] animate-pulse">
          Connecting to live updates...
        </div>
      ) : mandalsWithLiveStatus.length === 0 ? (
        <div className="p-4 rounded-[16px] bg-[var(--card-bg)] border border-[var(--border)] text-center space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--muted)] font-bold font-baloo">
            <span className="w-2 h-2 rounded-full bg-[var(--grey)]" />
            No live data reported yet
          </div>
          <p className="text-xs font-baloo text-[var(--muted)] max-w-xs mx-auto">
            Live queue reports will appear here as updates are broadcasted. Check the full map for all mandal locations.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {mandalsWithLiveStatus.slice(0, 3).map(({ mandal, report }) => {
            const config = CROWD_CONFIG[report.status] || CROWD_CONFIG.none;
            return (
              <Link
                key={mandal.id}
                href={`/mandal/${mandal.id}`}
                className="flex items-center justify-between p-3.5 rounded-[16px] bg-[var(--card-bg)] border border-[var(--border)] active:scale-[0.99] transition-transform"
                style={{ borderLeftWidth: "4px", borderLeftColor: config.color }}
              >
                <div className="space-y-0.5">
                  <div className="text-base font-extrabold font-baloo text-[var(--text)]">
                    {mandal.name}
                  </div>
                  <div className="text-xs text-[var(--muted)] font-marathi">
                    {mandal.nameMarathi} • {mandal.area}
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <CrowdBadge status={report.status} size="sm" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
