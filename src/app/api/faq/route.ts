import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import FAQ from "@/models/FAQ";
import { handleApiError } from "@/lib/errors";
import { faqSchema } from "@/lib/validations/faq";

const FALLBACK_FAQS = [
  {
    _id: "f1",
    question: "How far in advance should I book my bridal makeover?",
    answer: "We recommend booking 3 to 6 months prior to your wedding date to secure your date, especially during peak marriage seasons in Tamil Nadu.",
    order: 1,
  },
  {
    _id: "f2",
    question: "Do you travel to venues outside Salem?",
    answer: "Yes! Lead artist Maha Shree and our senior styling team travel across Tamil Nadu, Bangalore, and South India for outstation weddings.",
    order: 2,
  },
];

// GET all non-deleted FAQs sorted by order (Public)
export async function GET() {
  try {
    try {
      await connectToDatabase();
      const faqs = await FAQ.find({ isDeleted: false }).sort({ order: 1, createdAt: -1 }).lean();
      return NextResponse.json({ success: true, data: faqs });
    } catch (dbErr) {
      console.warn("[GET_FAQS] DB offline, returning fallback FAQs:", dbErr);
      return NextResponse.json({ success: true, data: FALLBACK_FAQS });
    }
  } catch (err) {
    return handleApiError(err, "Failed to fetch FAQs.");
  }
}

// POST create FAQ item (Admin only)
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = faqSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const faq = await FAQ.create(parsed.data);

    return NextResponse.json({ success: true, data: faq }, { status: 201 });
  } catch (err) {
    return handleApiError(err, "Failed to create FAQ item.");
  }
}
