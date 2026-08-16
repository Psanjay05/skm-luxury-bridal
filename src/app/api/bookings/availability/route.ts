import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Booking from "@/models/Booking";
import { checkRateLimit } from "@/lib/rate-limit";

// GET /api/bookings/availability?date=YYYY-MM-DD
export async function GET(req: Request) {
  const rateLimitResponse = checkRateLimit(req, {
    limit: 60,
    windowMs: 15 * 60 * 1000,
    prefix: "availability_check",
  });
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get("date");

    if (!dateStr) {
      return NextResponse.json(
        { success: false, error: "Date parameter is required (YYYY-MM-DD)" },
        { status: 400 }
      );
    }

    const targetDate = new Date(dateStr);
    if (isNaN(targetDate.getTime())) {
      return NextResponse.json(
        { success: false, error: "Invalid date format" },
        { status: 400 }
      );
    }

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    try {
      await connectToDatabase();
      const bookedCount = await Booking.countDocuments({
        preferredDate: { $gte: startOfDay, $lte: endOfDay },
        status: { $in: ["pending", "confirmed"] },
        isDeleted: false,
      });

      let availability: "available" | "limited" | "fully_booked" = "available";
      let message = "✅ Available for Muhurtham & Reception Booking";

      if (bookedCount >= 3) {
        availability = "fully_booked";
        message = "🚫 Muhurtham Date Peak Bookings — Please WhatsApp Maha Shree for Emergency Slots";
      } else if (bookedCount >= 1) {
        availability = "limited";
        message = `⚠️ High Demand Date (${bookedCount} event booked) — Few slots remaining!`;
      }

      return NextResponse.json({
        success: true,
        data: {
          date: dateStr,
          availability,
          bookedCount,
          message,
        },
      });
    } catch (dbErr) {
      console.warn("[AVAILABILITY_CHECK] DB offline, returning default available:", dbErr);
      return NextResponse.json({
        success: true,
        data: {
          date: dateStr,
          availability: "available",
          bookedCount: 0,
          message: "✅ Available for Booking",
        },
      });
    }
  } catch (err) {
    console.error("[AVAILABILITY_ERROR]", err);
    return NextResponse.json(
      { success: false, error: "Failed to check availability" },
      { status: 500 }
    );
  }
}
