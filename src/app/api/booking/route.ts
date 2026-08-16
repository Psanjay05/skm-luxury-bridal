import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Booking from "@/models/Booking";
import { handleApiError } from "@/lib/errors";
import { z } from "zod";

const bookingSchema = z.object({
  customerName: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  phone: z.string().trim().min(10, "Phone number must be at least 10 digits").max(20),
  service: z.string().trim().min(1, "Please select a service"),
  preferredDate: z.string().min(1, "Preferred date is required"),
  preferredTime: z.string().min(1, "Preferred time is required"),
  location: z.string().trim().min(1, "Venue/Location is required").max(200),
  message: z.string().trim().max(1000).optional(),
  email: z.string().trim().email("Invalid email format").optional().or(z.literal("")),
  website_hp: z.string().optional(), // Honeypot field for bot spam detection
});

function generateBookingReference(): string {
  const year = new Date().getFullYear();
  const randomDigits = Math.floor(10000 + Math.random() * 90000);
  return `SKM-${year}-${randomDigits}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = bookingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Bot honeypot check: if hidden honeypot field is filled, reject silently
    if (parsed.data.website_hp && parsed.data.website_hp.length > 0) {
      return NextResponse.json({ success: true, bookingReference: "SKM-2026-00000" }, { status: 200 });
    }

    await connectToDatabase();

    let bookingReference = generateBookingReference();
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 5) {
      const existing = await Booking.findOne({ bookingReference });
      if (!existing) {
        isUnique = true;
      } else {
        bookingReference = generateBookingReference();
        attempts++;
      }
    }

    const { website_hp, ...bookingData } = parsed.data;

    const booking = await Booking.create({
      ...bookingData,
      bookingReference,
      preferredDate: new Date(bookingData.preferredDate),
    });

    return NextResponse.json(
      {
        success: true,
        bookingReference: booking.bookingReference,
        id: booking._id,
      },
      { status: 201 }
    );
  } catch (err) {
    return handleApiError(err, "Failed to submit booking request. Please try again.");
  }
}
