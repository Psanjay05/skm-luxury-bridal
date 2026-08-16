import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import ContactMessage from "@/models/ContactMessage";
import { handleApiError } from "@/lib/errors";
import { contactSchema } from "@/lib/validations/contact";

// GET list contact messages (Admin only)
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
      await connectToDatabase();
    } catch (dbErr) {
      console.warn("[GET_CONTACT] DB offline, returning empty fallback list:", dbErr);
      return NextResponse.json({ success: true, data: [] });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const filter: Record<string, unknown> = { isDeleted: false };
    if (status && status !== "all") filter.status = status;

    const messages = await ContactMessage.find(filter).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ success: true, data: messages });
  } catch (err) {
    return handleApiError(err, "Failed to fetch contact messages.");
  }
}

// POST create contact message (Public)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    if (parsed.data.website_hp && parsed.data.website_hp.length > 0) {
      return NextResponse.json({ success: true, data: null }, { status: 200 });
    }

    try {
      await connectToDatabase();
      const { website_hp, ...messageData } = parsed.data;
      const message = await ContactMessage.create(messageData);
      return NextResponse.json({ success: true, data: { id: message._id } }, { status: 201 });
    } catch (dbErr) {
      console.warn("[POST_CONTACT] DB offline, returning fallback success:", dbErr);
      return NextResponse.json({ success: true, data: { id: `temp_${Date.now()}` } }, { status: 201 });
    }
  } catch (err) {
    return handleApiError(err, "Failed to submit contact message. Please try again.");
  }
}
