import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import ContactMessage from "@/models/ContactMessage";
import { handleApiError, isValidObjectId } from "@/lib/errors";
import { z } from "zod";

const updateMessageSchema = z.object({
  id: z.string().refine(isValidObjectId, { message: "Invalid message ID format" }),
  status: z.enum(["unread", "read", "archived"]),
});

const deleteMessageSchema = z.object({
  id: z.string().refine(isValidObjectId, { message: "Invalid message ID format" }),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    try {
      await connectToDatabase();
      // DB is the single source of truth when reachable
      const messages = await ContactMessage.find({ isDeleted: false }).sort({ createdAt: -1 }).lean();
      return NextResponse.json(
        { success: true, data: messages },
        { headers: { "Cache-Control": "no-store, max-age=0" } }
      );
    } catch (dbErr) {
      console.warn("[GET_ADMIN_MESSAGES] DB offline, using local store:", dbErr);
    }

    // Fallback to local store when DB is unavailable
    const { getLocalMessages } = await import("@/lib/local-store");
    const localMessages = getLocalMessages();
    return NextResponse.json(
      { success: true, data: localMessages },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (err) {
    return handleApiError(err, "Failed to fetch contact messages.");
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = updateMessageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const msg = await ContactMessage.findByIdAndUpdate(
      parsed.data.id,
      { status: parsed.data.status },
      { new: true }
    );

    if (!msg) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    return NextResponse.json(msg);
  } catch (err) {
    return handleApiError(err, "Failed to update message status.");
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = deleteMessageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const msg = await ContactMessage.findByIdAndUpdate(parsed.data.id, { isDeleted: true }, { new: true });
    if (!msg) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return handleApiError(err, "Failed to delete message.");
  }
}
