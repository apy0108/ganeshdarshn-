import { NextRequest, NextResponse } from "next/server";
import { addWaitTimeReport } from "@/lib/crowdStore";

export async function POST(
  req: NextRequest,
  { params }: { params: { mandalId: string } }
) {
  try {
    const mandalId = params.mandalId;
    const body = await req.json();
    const { deviceId, minutes, requestId } = body;

    if (!deviceId || typeof deviceId !== "string" || deviceId.trim() === "") {
      return NextResponse.json(
        { success: false, error: "deviceId is required" },
        { status: 400 }
      );
    }

    const numMinutes = Number(minutes);
    const validMinutes = [5, 10, 15, 20, 30, 45, 60, 90];
    if (!validMinutes.includes(numMinutes)) {
      return NextResponse.json(
        {
          success: false,
          error: "minutes must be one of: 5, 10, 15, 20, 30, 45, 60, 90",
        },
        { status: 400 }
      );
    }

    const waitRequestId =
      requestId || `wait_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const result = await addWaitTimeReport({
      mandalId,
      minutes: numMinutes,
      deviceId,
      requestId: waitRequestId,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.reason },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      waitMinutes: result.waitMinutes,
    });
  } catch (error) {
    console.error("Error submitting wait time report:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
