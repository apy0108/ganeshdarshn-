import { NextRequest, NextResponse } from "next/server";
import { db, isConfigured } from "@/lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";

interface AnalyticsEvent {
  page: string;
  referrer?: string;
  sessionId: string;
  city: string;
  timestamp: number;
}

const inMemoryAnalytics: AnalyticsEvent[] = [];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { page, referrer, sessionId } = body;

    if (!page || !sessionId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Extract city from proxy/CDN headers without logging or retaining raw IP
    const city =
      req.headers.get("cf-ipcity") ||
      req.headers.get("x-vercel-ip-city") ||
      req.headers.get("x-geo-city") ||
      "Pune (Local)";

    const event: AnalyticsEvent = {
      page,
      referrer: referrer || "",
      sessionId,
      city,
      timestamp: Date.now(),
    };

    inMemoryAnalytics.push(event);

    if (isConfigured && db) {
      try {
        await addDoc(collection(db, "analytics_events"), {
          ...event,
          timestamp: Timestamp.fromMillis(event.timestamp),
        });
      } catch (e) {
        console.warn("Firestore analytics write warning:", e);
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to record analytics" }, { status: 500 });
  }
}
