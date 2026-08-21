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

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET testimonials (Public GET returns non-deleted, option for all in admin)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const featuredOnly = searchParams.get("featured") === "true";

    try {
      await connectToDatabase();
      const session = await auth();

      const filter: Record<string, unknown> = { isDeleted: false };
      if (!session || featuredOnly) {
        filter.isFeatured = true;
      }

      // Auto-seed initial testimonials if collection is empty
      const count = await Testimonial.countDocuments({ isDeleted: false });
      if (count === 0) {
        const localTestimonials = getLocalTestimonials(featuredOnly);
        if (localTestimonials.length > 0) {
          const seedPayload = localTestimonials.map(({ _id: _, ...item }) => item);
          await Testimonial.insertMany(seedPayload);
        }
      }

      // DB is the single source of truth when reachable
      const dbTestimonials = await Testimonial.find(filter).sort({ createdAt: -1 }).lean();
      return NextResponse.json(
        { success: true, data: dbTestimonials },
        { headers: { "Cache-Control": "no-store, max-age=0" } }
      );
    } catch (dbErr: unknown) {
      const dbErrorMessage = dbErr instanceof Error ? dbErr.message : String(dbErr);
      console.warn("[GET_TESTIMONIALS] MongoDB unavailable, loading local store:", dbErrorMessage);
    }

    // Fallback when MongoDB is unreachable
    const localTestimonials = getLocalTestimonials(featuredOnly);
    return NextResponse.json(
      { success: true, data: localTestimonials },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
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

