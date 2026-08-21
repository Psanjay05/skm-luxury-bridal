import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import ContactMessage from "@/models/ContactMessage";
import { handleApiError } from "@/lib/errors";
import { contactSchema } from "@/lib/validations/contact";
import { checkRateLimit } from "@/lib/rate-limit";
import { getLocalMessages, saveLocalMessage } from "@/lib/local-store";

// GET list contact messages (Admin only)
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    try {
      await connectToDatabase();

      const filter: Record<string, unknown> = { isDeleted: false };
      if (status && status !== "all") filter.status = status;

      const messages = await ContactMessage.find(filter).sort({ createdAt: -1 }).lean();
      return NextResponse.json({ success: true, data: messages });
    } catch (dbErr) {
      console.warn("[GET_CONTACT] DB offline, using local store fallback:", dbErr);
      let localMessages = getLocalMessages();
      if (status && status !== "all") {
        localMessages = localMessages.filter((m) => m.status === status);
      }
      return NextResponse.json({ success: true, data: localMessages });
    }
  } catch (err) {
    return handleApiError(err, "Failed to fetch contact messages.");
  }
}

// POST create contact message (Public with Rate Limiting & Honeypot)
export async function POST(req: Request) {
  const rateLimitResponse = checkRateLimit(req, {
    limit: 10,
    windowMs: 15 * 60 * 1000,
    prefix: "contact_post",
  });
  if (rateLimitResponse) return rateLimitResponse;

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

    const { website_hp: _, ...messageData } = parsed.data;

    try {
      await connectToDatabase();
      const message = await ContactMessage.create(messageData);
      return NextResponse.json({ success: true, data: { id: message._id } }, { status: 201 });
    } catch (dbErr) {
      console.warn("[POST_CONTACT] DB offline, saving to local store fallback:", dbErr);
      const record = saveLocalMessage({
        name: messageData.name,
        email: messageData.email || "",
        phone: messageData.phone,
        message: messageData.message,
        status: "unread",
      });
      return NextResponse.json({ success: true, data: { id: record._id } }, { status: 201 });
    }
  } catch (err) {
    return handleApiError(err, "Failed to submit contact message. Please try again.");
  }
}

