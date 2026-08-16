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
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const messages = await ContactMessage.find({ isDeleted: false }).sort({ createdAt: -1 }).lean();
    return NextResponse.json(messages);
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
