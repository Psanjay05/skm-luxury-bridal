import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import Testimonial from "@/models/Testimonial";
import { handleApiError } from "@/lib/errors";
import { testimonialSchema } from "@/lib/validations/testimonial";
import { checkRateLimit } from "@/lib/rate-limit";

export const INITIAL_TESTIMONIALS = [
  {
    _id: "65c000000000000000000001",
    customerName: "Priya & Karthik",
    review: "Maha Shree ma'am created the absolute bridal look of my dreams! The HD makeup lasted all day through heat and tears without cracking or getting shiny.",
    rating: 5,
    isFeatured: true,
    isDeleted: false,
  },
  {
    _id: "65c000000000000000000002",
    customerName: "Ananya R.",
    review: "The saree draping precision and hair styling for my Muhurtham were flawless. Every relative complimented my look. SKM is the best in Salem!",
    rating: 5,
    isFeatured: true,
    isDeleted: false,
  },
  {
    _id: "65c000000000000000000003",
    customerName: "Deepika S.",
    review: "I took the Royal Airbrush Bridal Package. Truly felt like royalty on my reception night! Highly recommend Maha Shree for all brides.",
    rating: 5,
    isFeatured: true,
    isDeleted: false,
  },
];

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
      return NextResponse.json({ success: true, data: testimonials });
    } catch (dbErr: unknown) {
      const dbErrorMessage = dbErr instanceof Error ? dbErr.message : String(dbErr);
      console.warn("[GET_TESTIMONIALS] MongoDB unavailable, returning fallback testimonials:", dbErrorMessage);

      const filtered = featuredOnly
        ? INITIAL_TESTIMONIALS.filter((t) => t.isFeatured)
        : INITIAL_TESTIMONIALS;

      return NextResponse.json({
        success: true,
        data: filtered,
        fallback: true,
        warning: `Database unavailable (${dbErrorMessage}). Showing static testimonials.`,
      });
    }
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
