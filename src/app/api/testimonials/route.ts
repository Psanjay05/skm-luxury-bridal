import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import Testimonial from "@/models/Testimonial";
import { handleApiError } from "@/lib/errors";
import { testimonialSchema } from "@/lib/validations/testimonial";
import { checkRateLimit } from "@/lib/rate-limit";

import { INITIAL_TESTIMONIALS } from "@/lib/initial-data";
import { getLocalTestimonials, saveLocalTestimonial } from "@/lib/local-store";
export { INITIAL_TESTIMONIALS };

// GET testimonials (Public GET returns non-deleted, option for all in admin)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const featuredOnly = searchParams.get("featured") === "true";

    try {
      await connectToDatabase();
      const session = await auth();

      // Auto-seed initial testimonials if collection is empty
      const count = await Testimonial.countDocuments({ isDeleted: false });
      if (count === 0) {
        const seedPayload = INITIAL_TESTIMONIALS.map(({ _id: _, ...item }) => item);
        await Testimonial.insertMany(seedPayload);
      }

      const filter: Record<string, unknown> = { isDeleted: false };
      if (!session || featuredOnly) {
        filter.isFeatured = true;
      }

      const testimonials = await Testimonial.find(filter).sort({ createdAt: -1 }).lean();
      if (testimonials && testimonials.length > 0) {
        return NextResponse.json({ success: true, data: testimonials });
      }
    } catch (dbErr: unknown) {
      const dbErrorMessage = dbErr instanceof Error ? dbErr.message : String(dbErr);
      console.warn("[GET_TESTIMONIALS] MongoDB unavailable, loading local store:", dbErrorMessage);
    }

    const localTestimonials = getLocalTestimonials(featuredOnly);
    return NextResponse.json({
      success: true,
      data: localTestimonials,
    });
  } catch (err) {
    return handleApiError(err, "Failed to fetch testimonials.");
  }
}

// POST create/submit testimonial (Public with Rate Limiting)
export async function POST(req: Request) {
  const rateLimitResponse = checkRateLimit(req, {
    limit: 3,
    windowMs: 30 * 60 * 1000,
    prefix: "testimonials_post",
  });
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await req.json();
    const parsed = testimonialSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    let createdTestimonial = null;
    const session = await auth();
    const testimonialData = {
      ...parsed.data,
      isFeatured: session ? parsed.data.isFeatured : false,
    };

    try {
      await connectToDatabase();
      const testimonial = await Testimonial.create(testimonialData);
      if (testimonial) createdTestimonial = testimonial;
    } catch (dbErr) {
      console.warn("[POST_TESTIMONIAL] DB offline, saving local:", dbErr);
    }

    const localCreated = saveLocalTestimonial(testimonialData);
    if (!createdTestimonial) {
      createdTestimonial = localCreated;
    }

    return NextResponse.json({ success: true, data: createdTestimonial }, { status: 201 });
  } catch (err) {
    return handleApiError(err, "Failed to submit testimonial.");
  }
}

