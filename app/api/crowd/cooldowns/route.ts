import { NextRequest, NextResponse } from "next/server";
import { getAllDeviceCooldowns } from "@/lib/crowdStore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { deviceId } = body;

    if (!deviceId) {
      return NextResponse.json({ cooldowns: {} });
    }

    const cooldowns = await getAllDeviceCooldowns(deviceId);
    return NextResponse.json({ cooldowns });
  } catch (error) {
    return NextResponse.json({ cooldowns: {} });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const deviceId = searchParams.get("deviceId");

  if (!deviceId) {
    return NextResponse.json({ cooldowns: {} });
  }

  const cooldowns = await getAllDeviceCooldowns(deviceId);
  return NextResponse.json({ cooldowns });
}
