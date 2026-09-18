import { NextRequest, NextResponse } from "next/server";
import { addDwellSignal } from "@/lib/crowdStore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mandalId, dwell, dwellSeconds, deviceId, isFinal } = body;

    if (!mandalId || !deviceId || !["lingering", "queueing"].includes(dwell)) {
      return NextResponse.json(
        { error: "Invalid dwell signal payload" },
        { status: 400 }
      );
    }

    const result = await addDwellSignal({
      mandalId,
      dwell,
      dwellSeconds: Number(dwellSeconds) || 0,
      deviceId,
      isFinal: Boolean(isFinal),
    });

    return NextResponse.json(
      { success: result.success, crowdState: result.state },
      { status: 200 }
    );
  } catch (error) {
    console.error("Dwell API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
