import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import Testimonial from "@/models/Testimonial";
import { handleApiError, isValidObjectId } from "@/lib/errors";
import { z } from "zod";

const createTestimonialSchema = z.object({
  name: z.string().trim().min(2).max(100),
  role: z.string().trim().optional(),
  content: z.string().trim().min(5).max(1000),
  rating: z.number().min(1).max(5).default(5),
  imageUrl: z.string().url().optional().or(z.literal("")),
  isFeatured: z.boolean().optional(),
});

const updateTestimonialSchema = z.object({
  id: z.string().refine(isValidObjectId, { message: "Invalid testimonial ID format" }),
  name: z.string().trim().min(2).max(100).optional(),
  role: z.string().trim().optional(),
  content: z.string().trim().min(5).max(1000).optional(),
  rating: z.number().min(1).max(5).optional(),
  isFeatured: z.boolean().optional(),
});

const deleteTestimonialSchema = z.object({
  id: z.string().refine(isValidObjectId, { message: "Invalid testimonial ID format" }),
});

export async function GET() {
  try {
    await connectToDatabase();
    const testimonials = await Testimonial.find({ isDeleted: false }).sort({ createdAt: -1 }).lean();
    return NextResponse.json(testimonials);
  } catch (err) {
    return handleApiError(err, "Failed to fetch testimonials.");
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = createTestimonialSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const testimonial = await Testimonial.create(parsed.data);
    return NextResponse.json(testimonial, { status: 201 });
  } catch (err) {
    return handleApiError(err, "Failed to create testimonial.");
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = updateTestimonialSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { id, ...updateData } = parsed.data;
    await connectToDatabase();
    const testimonial = await Testimonial.findByIdAndUpdate(id, updateData, { new: true });
    if (!testimonial) {
      return NextResponse.json({ error: "Testimonial not found" }, { status: 404 });
    }

    return NextResponse.json(testimonial);
  } catch (err) {
    return handleApiError(err, "Failed to update testimonial.");
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = deleteTestimonialSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const testimonial = await Testimonial.findByIdAndUpdate(parsed.data.id, { isDeleted: true }, { new: true });
    if (!testimonial) {
      return NextResponse.json({ error: "Testimonial not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return handleApiError(err, "Failed to delete testimonial.");
  }
}
