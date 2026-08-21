import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import FAQ from "@/models/FAQ";
import { handleApiError } from "@/lib/errors";
import { faqSchema } from "@/lib/validations/faq";
import { getLocalFaqs, saveLocalFaq } from "@/lib/local-store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET all non-deleted FAQs sorted by order (Public)
export async function GET() {
  try {
    try {
      await connectToDatabase();
      // Auto-seed initial FAQs if collection is empty
      const count = await FAQ.countDocuments({ isDeleted: false });
      if (count === 0) {
        const localFaqs = getLocalFaqs();
        if (localFaqs.length > 0) {
          const seedPayload = localFaqs.map(({ _id: _, ...item }) => item);
          await FAQ.insertMany(seedPayload);
        }
      }

      // DB is the single source of truth when reachable
      const dbFaqs = await FAQ.find({ isDeleted: false }).sort({ order: 1, createdAt: -1 }).lean();
      return NextResponse.json(
        { success: true, data: dbFaqs },
        { headers: { "Cache-Control": "no-store, max-age=0" } }
      );
    } catch (dbErr) {
      console.warn("[GET_FAQS] DB offline, loading local FAQs:", dbErr);
    }

    // Fallback when MongoDB is unreachable
    const localFaqs = getLocalFaqs();
    return NextResponse.json(
      { success: true, data: localFaqs },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
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

