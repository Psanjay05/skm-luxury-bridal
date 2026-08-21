import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import Booking from "@/models/Booking";
import { handleApiError, isValidObjectId } from "@/lib/errors";
import { z } from "zod";

const updateBookingSchema = z.object({
  id: z.string().refine(isValidObjectId, { message: "Invalid booking ID format" }),
  status: z.enum(["pending", "confirmed", "completed", "cancelled"]),
});

const deleteBookingSchema = z.object({
  id: z.string().refine(isValidObjectId, { message: "Invalid booking ID format" }),
});

// GET all bookings (admin only)
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));

    try {
      await connectToDatabase();

      const filter: Record<string, unknown> = { isDeleted: false };
      if (status && status !== "all") filter.status = status;

      const [bookings, total] = await Promise.all([
        Booking.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
        Booking.countDocuments(filter),
      ]);

      return NextResponse.json(
        { success: true, data: { bookings, total, page, pages: Math.ceil(total / limit) || 1 } },
        { headers: { "Cache-Control": "no-store, max-age=0" } }
      );
    } catch (dbErr) {
      console.warn("[GET_ADMIN_BOOKINGS] DB offline, using local store:", dbErr);
    }

    // Fallback to local store
    const { getLocalBookings } = await import("@/lib/local-store");
    let localBookings = getLocalBookings();
    if (status && status !== "all") {
      localBookings = localBookings.filter((b) => b.status === status);
    }
    const total = localBookings.length;
    const paginated = localBookings.slice((page - 1) * limit, page * limit);
    return NextResponse.json(
      { success: true, data: { bookings: paginated, total, page, pages: Math.ceil(total / limit) || 1 } },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (err) {
    return handleApiError(err, "Failed to fetch bookings.");
  }
}

// PATCH update booking status
export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = updateBookingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const booking = await Booking.findByIdAndUpdate(
      parsed.data.id,
      { status: parsed.data.status },
      { new: true }
    );

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json(booking);
  } catch (err) {
    return handleApiError(err, "Failed to update booking status.");
  }
}

// DELETE soft-delete a booking
export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = deleteBookingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const booking = await Booking.findByIdAndUpdate(parsed.data.id, { isDeleted: true }, { new: true });
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return handleApiError(err, "Failed to delete booking.");
  }
}
