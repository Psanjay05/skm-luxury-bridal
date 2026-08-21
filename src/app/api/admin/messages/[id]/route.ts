import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import ContactMessage from "@/models/ContactMessage";
import { handleApiError, isValidObjectId } from "@/lib/errors";
import { updateLocalMessage } from "@/lib/local-store";
import { z } from "zod";

const updateMessageSchema = z.object({
  status: z.enum(["unread", "read", "archived"]),
});

// PATCH /api/admin/messages/[id] — mark read/archived (Admin only)
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
      return NextResponse.json({ success: false, error: "Invalid message ID" }, { status: 400 });
    }

    const body = await req.json();
    const parsed = updateMessageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    let message = null;
    try {
      await connectToDatabase();
      message = await ContactMessage.findByIdAndUpdate(
        id,
        { status: parsed.data.status },
        { new: true }
      );
    } catch (dbErr) {
      console.warn("[PATCH_ADMIN_MESSAGE] DB offline, updating local:", dbErr);
    }

    const localMessage = updateLocalMessage(id, { status: parsed.data.status });
    if (!message && localMessage) {
      message = localMessage;
    }

    if (!message) {
      return NextResponse.json({ success: false, error: "Message not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: message });
  } catch (err) {
    return handleApiError(err, "Failed to update message status.");
  }
}

// DELETE /api/admin/messages/[id] — soft-delete (Admin only)
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
      return NextResponse.json({ success: false, error: "Invalid message ID" }, { status: 400 });
    }

    let deleted = false;
    try {
      await connectToDatabase();
      const msg = await ContactMessage.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
      if (msg) deleted = true;
    } catch (dbErr) {
      console.warn("[DELETE_ADMIN_MESSAGE] DB offline, deleting local:", dbErr);
    }

    const localDeleted = updateLocalMessage(id, { isDeleted: true });
    if (localDeleted) deleted = true;

    if (!deleted) {
      return NextResponse.json({ success: false, error: "Message not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: { id } });
  } catch (err) {
    return handleApiError(err, "Failed to delete message.");
  }
}
