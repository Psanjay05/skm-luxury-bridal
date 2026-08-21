import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import Booking from "@/models/Booking";
import { handleApiError, isValidObjectId } from "@/lib/errors";
import { updateLocalBooking } from "@/lib/local-store";
import { updateBookingStatusSchema } from "@/lib/validations/booking";

// PATCH /api/admin/bookings/[id] — update booking status (Admin only)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ success: false, error: "Invalid booking ID" }, { status: 400 });
    }

    const body = await req.json();
    const parsed = updateBookingStatusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    let booking = null;
    try {
      await connectToDatabase();
      booking = await Booking.findByIdAndUpdate(
        id,
        { status: parsed.data.status },
        { new: true }
      );
    } catch (dbErr) {
      console.warn("[PATCH_ADMIN_BOOKING] DB offline, updating local:", dbErr);
    }

    const localBooking = updateLocalBooking(id, { status: parsed.data.status });
    if (!booking && localBooking) {
      booking = localBooking;
    }

    if (!booking) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: booking });
  } catch (err) {
    return handleApiError(err, "Failed to update booking status.");
  }
}

// DELETE /api/admin/bookings/[id] — soft-delete booking (Admin only)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ success: false, error: "Invalid booking ID" }, { status: 400 });
    }

    let deleted = false;
    try {
      await connectToDatabase();
      const booking = await Booking.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
      if (booking) deleted = true;
    } catch (dbErr) {
      console.warn("[DELETE_ADMIN_BOOKING] DB offline, deleting local:", dbErr);
    }

    const localDeleted = updateLocalBooking(id, { isDeleted: true });
    if (localDeleted) deleted = true;

    if (!deleted) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: { id } });
  } catch (err) {
    return handleApiError(err, "Failed to delete booking.");
  }
}
