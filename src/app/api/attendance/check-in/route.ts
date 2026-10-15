import { NextResponse, type NextRequest } from "next/server";
import { checkInWithToken } from "@/actions/attendance";

// Rate limiting in-memory map: token/ip -> timestamp
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_WINDOW_MS = 2000; // 2 seconds between scans of same payload

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = body?.token;

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { success: false, error: "Missing or invalid QR token." },
        { status: 400 }
      );
    }

    // Rate limiting check
    const now = Date.now();
    const lastScanTime = rateLimitMap.get(token) || 0;
    if (now - lastScanTime < RATE_LIMIT_WINDOW_MS) {
      return NextResponse.json(
        { success: false, error: "Scan in progress or duplicate scan. Please wait a moment." },
        { status: 429 }
      );
    }
    rateLimitMap.set(token, now);

    // Clean up stale rate limits every 100 entries
    if (rateLimitMap.size > 100) {
      for (const [key, time] of rateLimitMap.entries()) {
        if (now - time > 10000) rateLimitMap.delete(key);
      }
    }

    const res = await checkInWithToken(token);

    if (!res.success) {
      return NextResponse.json({ success: false, error: res.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: res.data });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
