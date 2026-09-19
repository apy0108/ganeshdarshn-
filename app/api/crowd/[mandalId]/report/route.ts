import { NextRequest, NextResponse } from "next/server";
import { addCrowdReport } from "@/lib/crowdStore";
import { CrowdStatus } from "@/lib/types";

export async function POST(
  req: NextRequest,
  { params }: { params: { mandalId: string } }
) {
  try {
    const mandalId = params.mandalId;
    const body = await req.json();
    const { deviceId, status, requestId, lat, lng, accuracyM, coords } = body;

    if (!deviceId || typeof deviceId !== "string" || deviceId.trim() === "") {
      return NextResponse.json(
        { success: false, error: "deviceId is required" },
        { status: 400 }
      );
    }

    if (!status || !["short", "moving", "heavy"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "invalid_status" },
        { status: 400 }
      );
    }

    // Resolve submitted GPS coordinates
    const reportCoords = coords || (typeof lat === "number" && typeof lng === "number"
      ? { lat, lng, accuracyM }
      : undefined);

    const reportRequestId =
      requestId || `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const result = await addCrowdReport({
      mandalId,
      status: status as CrowdStatus,
      deviceId,
      requestId: reportRequestId,
      coords: reportCoords,
    });

    if (!result.success) {
      if (result.reason === "cooldown") {
        return NextResponse.json(
          {
            success: false,
            reason: "cooldown",
            retryAfter: result.retryAfter,
            error: "You recently submitted a report for this mandal. Please wait for cooldown to expire.",
          },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { success: false, error: result.reason || "Validation failed" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      crowd: result.crowd,
    });
  } catch (error) {
    console.error("Error submitting crowd report:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
