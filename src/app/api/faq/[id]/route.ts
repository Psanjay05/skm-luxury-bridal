import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import FAQ from "@/models/FAQ";
import { handleApiError, isValidObjectId } from "@/lib/errors";
import { faqSchema } from "@/lib/validations/faq";

// PATCH update FAQ item (Admin only)
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
      return NextResponse.json({ success: false, error: "Invalid FAQ ID" }, { status: 400 });
    }

    const body = await req.json();
    const parsed = faqSchema.partial().safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const faq = await FAQ.findByIdAndUpdate(id, parsed.data, { new: true });

    if (!faq) {
      return NextResponse.json({ success: false, error: "FAQ item not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: faq });
  } catch (err) {
    return handleApiError(err, "Failed to update FAQ item.");
  }
}

// DELETE soft-delete FAQ item (Admin only)
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
      return NextResponse.json({ success: false, error: "Invalid FAQ ID" }, { status: 400 });
    }

    await connectToDatabase();
    const faq = await FAQ.findByIdAndUpdate(id, { isDeleted: true }, { new: true });

    if (!faq) {
      return NextResponse.json({ success: false, error: "FAQ item not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: { id: faq._id } });
  } catch (err) {
    return handleApiError(err, "Failed to delete FAQ item.");
  }
}
