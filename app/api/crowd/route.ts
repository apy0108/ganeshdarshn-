import { NextResponse } from "next/server";
import { getAllCrowdStates } from "@/lib/crowdStore";

export const revalidate = 30; // 30 seconds cache revalidation

export async function GET() {
  try {
    const states = await getAllCrowdStates();
    return NextResponse.json(states, {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=59",
      },
    });
  } catch (error) {
    console.error("Error fetching all crowd states:", error);
    return NextResponse.json(
      { error: "Failed to fetch crowd state" },
      { status: 500 }
    );
  }
}
