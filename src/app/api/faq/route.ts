import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import FAQ from "@/models/FAQ";
import { handleApiError } from "@/lib/errors";
import { faqSchema } from "@/lib/validations/faq";

// GET all non-deleted FAQs sorted by order (Public)
export async function GET() {
  try {
    await connectToDatabase();
    const faqs = await FAQ.find({ isDeleted: false }).sort({ order: 1, createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: faqs });
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
