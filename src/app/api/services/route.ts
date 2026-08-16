import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import Service from "@/models/Service";
import { handleApiError } from "@/lib/errors";
import { serviceSchema } from "@/lib/validations/service";

const FALLBACK_SERVICES = [
  {
    _id: "s1",
    title: "Royal HD Bridal Makeover",
    description: "Flawless sweat-proof high-definition base makeup, false lash application, custom lip artistry, and saree draping.",
    imageUrl: "/images/portfolio/bridal-pink-saree-gold-jewellery.jpg",
    category: "makeup",
    ctaText: "Book Royal Package",
  },
  {
    _id: "s2",
    title: "Airbrush Luxury Bridal Package",
    description: "Ultra long-lasting 18+ hour waterproof airbrush makeup finish, temple hair ornament styling, and jewelry draping.",
    imageUrl: "/images/portfolio/before-after-hd-makeover.jpg",
    category: "makeup",
    ctaText: "Book Airbrush Package",
  },
];

// GET all non-deleted services (Public)
export async function GET() {
  try {
    try {
      await connectToDatabase();
      const services = await Service.find({ isDeleted: false }).sort({ createdAt: -1 }).lean();
      return NextResponse.json({ success: true, data: services });
    } catch (dbErr) {
      console.warn("[GET_SERVICES] DB offline, returning fallback services:", dbErr);
      return NextResponse.json({ success: true, data: FALLBACK_SERVICES });
    }
  } catch (err) {
    return handleApiError(err, "Failed to fetch services.");
  }
}

// POST create service (Admin only)
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = serviceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const service = await Service.create(parsed.data);

    return NextResponse.json({ success: true, data: service }, { status: 201 });
  } catch (err) {
    return handleApiError(err, "Failed to create service.");
  }
}
