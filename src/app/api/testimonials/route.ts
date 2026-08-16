import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import Testimonial from "@/models/Testimonial";
import { handleApiError } from "@/lib/errors";
import { testimonialSchema } from "@/lib/validations/testimonial";
import { checkRateLimit } from "@/lib/rate-limit";

// GET testimonials (Public GET returns non-deleted, option for all in admin)
export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const session = await auth();
    const { searchParams } = new URL(req.url);
    const featuredOnly = searchParams.get("featured") === "true";

    const filter: Record<string, unknown> = { isDeleted: false };
    if (!session || featuredOnly) {
      filter.isFeatured = true;
    }

    const testimonials = await Testimonial.find(filter).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: testimonials });
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

    await connectToDatabase();
    const session = await auth();

    // Public submissions default to not featured/unapproved unless admin creates it
    const testimonialData = {
      ...parsed.data,
      isFeatured: session ? parsed.data.isFeatured : false,
    };

    const testimonial = await Testimonial.create(testimonialData);
    return NextResponse.json({ success: true, data: testimonial }, { status: 201 });
  } catch (err) {
    return handleApiError(err, "Failed to submit testimonial.");
  }
}
