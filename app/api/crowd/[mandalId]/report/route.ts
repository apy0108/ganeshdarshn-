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
    const { deviceId, status, requestId, atMandal } = body;

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

    const reportRequestId =
      requestId || `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const result = await addCrowdReport({
      mandalId,
      status: status as CrowdStatus,
      deviceId,
      atMandal: Boolean(atMandal),
      requestId: reportRequestId,
    });

    if (!result.success) {
      if (result.reason === "cooldown") {
        return NextResponse.json(
          {
            success: false,
            reason: "cooldown",
            retryAfter: result.retryAfter,
          },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { success: false, error: result.reason },
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
