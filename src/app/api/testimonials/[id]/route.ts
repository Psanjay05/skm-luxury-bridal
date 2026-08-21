import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import Testimonial from "@/models/Testimonial";
import { handleApiError, isValidObjectId } from "@/lib/errors";
import { updateTestimonialSchema } from "@/lib/validations/testimonial";
import { updateLocalTestimonial, deleteLocalTestimonial } from "@/lib/local-store";

// PATCH toggle featured/approval status or update testimonial (Admin only)
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
      return NextResponse.json({ success: false, error: "Invalid testimonial ID" }, { status: 400 });
    }

    const body = await req.json();
    const parsed = updateTestimonialSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    let updatedTestimonial = null;
    try {
      await connectToDatabase();
      const testimonial = await Testimonial.findByIdAndUpdate(id, parsed.data, { new: true });
      if (testimonial) updatedTestimonial = testimonial;
    } catch (dbErr) {
      console.warn("[PATCH_TESTIMONIAL] DB offline, updating local:", dbErr);
    }

    const localUpdated = updateLocalTestimonial(id, parsed.data);
    if (!updatedTestimonial && localUpdated) {
      updatedTestimonial = localUpdated;
    }

    if (!updatedTestimonial) {
      return NextResponse.json({ success: false, error: "Testimonial not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedTestimonial });
  } catch (err) {
    return handleApiError(err, "Failed to update testimonial.");
  }
}

// DELETE soft-delete testimonial (Admin only)
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
      return NextResponse.json({ success: false, error: "Invalid testimonial ID" }, { status: 400 });
    }

    let deleted = false;
    try {
      await connectToDatabase();
      const testimonial = await Testimonial.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
      if (testimonial) deleted = true;
    } catch (dbErr) {
      console.warn("[DELETE_TESTIMONIAL] DB offline, deleting local:", dbErr);
    }

    const localDeleted = deleteLocalTestimonial(id);
    if (localDeleted) deleted = true;

    if (!deleted) {
      return NextResponse.json({ success: false, error: "Testimonial not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: { id } });
  } catch (err) {
    return handleApiError(err, "Failed to delete testimonial.");
  }
}

