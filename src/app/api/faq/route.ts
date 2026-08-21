import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import FAQ from "@/models/FAQ";
import { handleApiError } from "@/lib/errors";
import { faqSchema } from "@/lib/validations/faq";
import { getLocalFaqs, saveLocalFaq } from "@/lib/local-store";

// GET all non-deleted FAQs sorted by order (Public)
export async function GET() {
  try {
    try {
      await connectToDatabase();
      const faqs = await FAQ.find({ isDeleted: false }).sort({ order: 1, createdAt: -1 }).lean();
      if (faqs && faqs.length > 0) {
        return NextResponse.json({ success: true, data: faqs });
      }
    } catch (dbErr) {
      console.warn("[GET_FAQS] DB offline, loading local FAQs:", dbErr);
    }
    const localFaqs = getLocalFaqs();
    return NextResponse.json({ success: true, data: localFaqs });
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

    let createdFaq = null;
    try {
      await connectToDatabase();
      const faq = await FAQ.create(parsed.data);
      if (faq) createdFaq = faq;
    } catch (dbErr) {
      console.warn("[POST_FAQ] DB offline, saving local:", dbErr);
    }

    const localCreated = saveLocalFaq(parsed.data);
    if (!createdFaq) {
      createdFaq = localCreated;
    }

    return NextResponse.json({ success: true, data: createdFaq }, { status: 201 });
  } catch (err) {
    return handleApiError(err, "Failed to create FAQ item.");
  }
}

