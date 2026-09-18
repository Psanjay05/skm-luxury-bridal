import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import Testimonial from "@/models/Testimonial";
import { handleApiError, isValidObjectId } from "@/lib/errors";
import { testimonialSchema, updateTestimonialSchema } from "@/lib/validations/testimonial";
import {
  getLocalTestimonials,
  saveLocalTestimonial,
  updateLocalTestimonial,
  deleteLocalTestimonial,
} from "@/lib/local-store";
import { z } from "zod";

const deleteTestimonialSchema = z.object({
  id: z.string().refine(isValidObjectId, { message: "Invalid testimonial ID format" }),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    try {
      await connectToDatabase();
      const testimonials = await Testimonial.find({ isDeleted: false }).sort({ createdAt: -1 }).lean();
      return NextResponse.json(
        { success: true, data: testimonials },
        { headers: { "Cache-Control": "no-store, max-age=0" } }
      );
    } catch (dbErr) {
      console.warn("[GET_ADMIN_TESTIMONIALS] DB offline, loading local store:", dbErr);
    }

    const localTestimonials = getLocalTestimonials(false);
    return NextResponse.json(
      { success: true, data: localTestimonials },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (err) {
    return handleApiError(err, "Failed to fetch testimonials.");
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = testimonialSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    let testimonial = null;
    try {
      await connectToDatabase();
      testimonial = await Testimonial.create(parsed.data);
    } catch (dbErr) {
      console.warn("[POST_ADMIN_TESTIMONIAL] DB offline, saving local:", dbErr);
    }

    let localTestimonial = null;
    if (!testimonial) {
      localTestimonial = saveLocalTestimonial(parsed.data);
    }

    revalidatePath("/testimonials");
    revalidatePath("/");

    return NextResponse.json(
      { success: true, data: testimonial || localTestimonial },
      { status: 201 }
    );
  } catch (err) {
    return handleApiError(err, "Failed to create testimonial.");
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = updateTestimonialSchema.extend({
      id: z.string().refine(isValidObjectId, { message: "Invalid testimonial ID format" }),
    }).safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { id, ...updateData } = parsed.data;
    let testimonial = null;
    try {
      await connectToDatabase();
      testimonial = await Testimonial.findByIdAndUpdate(id, updateData, { new: true });
    } catch (dbErr) {
      console.warn("[PATCH_ADMIN_TESTIMONIAL] DB offline, saving local:", dbErr);
    }

    let localTestimonial = null;
    if (!testimonial) {
      localTestimonial = updateLocalTestimonial(id, updateData);
    }
    if (!testimonial && !localTestimonial) {
      return NextResponse.json({ success: false, error: "Testimonial not found" }, { status: 404 });
    }

    revalidatePath("/testimonials");
    revalidatePath("/");

    return NextResponse.json({ success: true, data: testimonial || localTestimonial });
  } catch (err) {
    return handleApiError(err, "Failed to update testimonial.");
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = deleteTestimonialSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    let deleted = false;
    try {
      await connectToDatabase();
      const testimonial = await Testimonial.findByIdAndUpdate(parsed.data.id, { isDeleted: true }, { new: true });
      if (testimonial) deleted = true;
    } catch (dbErr) {
      console.warn("[DELETE_ADMIN_TESTIMONIAL] DB offline, deleting local:", dbErr);
    }

    if (!deleted) {
      const localDeleted = deleteLocalTestimonial(parsed.data.id);
      if (localDeleted) deleted = true;
    }

    if (!deleted) {
      return NextResponse.json({ success: false, error: "Testimonial not found" }, { status: 404 });
    }

    revalidatePath("/testimonials");
    revalidatePath("/");

    return NextResponse.json({ success: true, data: { id: parsed.data.id } });
  } catch (err) {
    return handleApiError(err, "Failed to delete testimonial.");
  }
}
