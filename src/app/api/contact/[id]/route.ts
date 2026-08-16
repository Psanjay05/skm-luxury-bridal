import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import ContactMessage from "@/models/ContactMessage";
import { handleApiError, isValidObjectId } from "@/lib/errors";
import { updateContactStatusSchema } from "@/lib/validations/contact";

// PATCH mark read/unread (Admin only)
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
    const parsed = updateContactStatusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const message = await ContactMessage.findByIdAndUpdate(
      id,
      { status: parsed.data.status },
      { new: true }
    );

    if (!message) {
      return NextResponse.json({ success: false, error: "Message not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: message });
  } catch (err) {
    return handleApiError(err, "Failed to update message status.");
  }
}

// DELETE soft-delete contact message (Admin only)
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

    await connectToDatabase();
    const message = await ContactMessage.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    if (!message) {
      return NextResponse.json({ success: false, error: "Message not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: { id: message._id } });
  } catch (err) {
    return handleApiError(err, "Failed to delete message.");
  }
}
