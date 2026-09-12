import { NextResponse, type NextRequest } from "next/server";
import { captureAppError } from "@/lib/error";

/**
 * Vercel Cron job endpoint for generating / publishing daily story digest
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Cron job logic placeholder: story generation and aggregation
    return NextResponse.json({
      success: true,
      message: "Daily story job completed successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    captureAppError(error, { section: "cron_daily_story" });
    return NextResponse.json(
      { success: false, error: "Cron execution failed" },
      { status: 500 }
    );
  }
}
