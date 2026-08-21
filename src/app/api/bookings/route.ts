import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import Booking from "@/models/Booking";
import { handleApiError } from "@/lib/errors";
import { bookingSchema } from "@/lib/validations/booking";
import { checkRateLimit } from "@/lib/rate-limit";
import { getLocalBookings, saveLocalBooking } from "@/lib/local-store";
import { sendBookingNotification } from "@/lib/notifications";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function generateBookingReference(): string {
  const year = new Date().getFullYear();
  const randomDigits = Math.floor(10000 + Math.random() * 90000);
  return `SKM-${year}-${randomDigits}`;
}

// GET all bookings (Admin only)
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));

    try {
      await connectToDatabase();

      const filter: Record<string, unknown> = { isDeleted: false };
      if (status && status !== "all") filter.status = status;

      // BUG FIX: When MongoDB is reachable, it is the single source of truth.
      // Production bookings written to Atlas will be visible here regardless of env.
      // Local JSON is ONLY a fallback for when the DB is offline.
      const [dbBookings, total] = await Promise.all([
        Booking.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
        Booking.countDocuments(filter),
      ]);

      // If DB responded (even with 0 records), use DB data exclusively
      return NextResponse.json(
        {
          success: true,
          data: { bookings: dbBookings, total, page, pages: Math.ceil(total / limit) || 1 },
        },
        { headers: { "Cache-Control": "no-store, max-age=0" } }
      );
    } catch (dbErr) {
      console.warn("[GET_BOOKINGS] DB offline, using local store fallback:", dbErr);
    }

    // DB is offline — fall back to local JSON store
    let localBookings = getLocalBookings();
    if (status && status !== "all") {
      localBookings = localBookings.filter((b) => b.status === status);
    }
    const total = localBookings.length;
    const paginated = localBookings.slice((page - 1) * limit, page * limit);
    return NextResponse.json(
      {
        success: true,
        data: {
          bookings: paginated,
          total,
          page,
          pages: Math.ceil(total / limit) || 1,
        },
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (err) {
    return handleApiError(err, "Failed to fetch bookings.");
  }
}

// POST create booking (Public with Rate Limiting & Honeypot)
export async function POST(req: Request) {
  const rateLimitResponse = checkRateLimit(req, {
    limit: 20,
    windowMs: 15 * 60 * 1000,
    prefix: "bookings_post",
  });
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await req.json();
    const parsed = bookingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Honeypot spam check
    if (parsed.data.website_hp && parsed.data.website_hp.length > 0) {
      return NextResponse.json(
        { success: true, data: { bookingReference: "SKM-2026-00000" } },
        { status: 200 }
      );
    }

    const bookingReference = generateBookingReference();
    const { website_hp: _, ...bookingData } = parsed.data;

    // 1. Always save to local store so bookings ALWAYS appear in admin
    const record = saveLocalBooking({
      customerName: bookingData.customerName,
      email: bookingData.email || "",
      phone: bookingData.phone,
      service: bookingData.service,
      preferredDate: bookingData.preferredDate,
      preferredTime: bookingData.preferredTime || "Morning",
      location: bookingData.location,
      message: bookingData.message || "",
      bookingReference,
      status: "pending",
    });

    // 2. Also save to MongoDB if active
    try {
      await connectToDatabase();
      await Booking.create({
        ...bookingData,
        bookingReference,
        preferredDate: new Date(bookingData.preferredDate),
      });
    } catch (dbErr) {
      console.warn("[POST_BOOKING] DB offline, persisted in local store:", dbErr);
    }

    // 3. Trigger automated notifications (Email, Webhook, and WhatsApp Link)
    let notificationResult = null;
    try {
      notificationResult = await sendBookingNotification({
        customerName: bookingData.customerName,
        email: bookingData.email,
        phone: bookingData.phone,
        service: bookingData.service,
        preferredDate: bookingData.preferredDate,
        preferredTime: bookingData.preferredTime || "Morning",
        location: bookingData.location,
        message: bookingData.message,
        bookingReference,
      });
    } catch (notifErr) {
      console.warn("[BOOKING_NOTIFICATION_ERROR]", notifErr);
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          id: record._id,
          bookingReference: record.bookingReference,
          whatsappAdminUrl: notificationResult?.whatsappAdminUrl,
        },
      },
      {
        status: 201,
        headers: { "Cache-Control": "no-store, max-age=0" },
      }
    );
  } catch (err) {
    return handleApiError(err, "Failed to submit booking request. Please try again.");
  }
}


