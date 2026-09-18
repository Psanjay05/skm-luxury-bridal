import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import FAQ from "@/models/FAQ";
import { handleApiError, isValidObjectId } from "@/lib/errors";
import { getLocalFaqs, saveLocalFaq, updateLocalFaq, deleteLocalFaq } from "@/lib/local-store";
import { z } from "zod";

const createFaqSchema = z.object({
  question: z.string().trim().min(3).max(300),
  answer: z.string().trim().min(5).max(2000),
  category: z.string().trim().optional(),
  order: z.number().int().optional(),
});

const updateFaqSchema = z.object({
  id: z.string().refine(isValidObjectId, { message: "Invalid FAQ ID format" }),
  question: z.string().trim().min(3).max(300).optional(),
  answer: z.string().trim().min(5).max(2000).optional(),
  category: z.string().trim().optional(),
  order: z.number().int().optional(),
});

const deleteFaqSchema = z.object({
  id: z.string().refine(isValidObjectId, { message: "Invalid FAQ ID format" }),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    try {
      await connectToDatabase();
      const faqs = await FAQ.find({ isDeleted: false }).sort({ order: 1, createdAt: -1 }).lean();
      return NextResponse.json(
        { success: true, data: faqs },
        { headers: { "Cache-Control": "no-store, max-age=0" } }
      );
    } catch (dbErr) {
      console.warn("[GET_ADMIN_FAQ] DB offline, loading local store:", dbErr);
    }

    const localFaqs = getLocalFaqs();
    return NextResponse.json(
      { success: true, data: localFaqs },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (err) {
    return handleApiError(err, "Failed to fetch FAQs.");
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = createFaqSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    let faq = null;
    try {
      await connectToDatabase();
      faq = await FAQ.create(parsed.data);
    } catch (dbErr) {
      console.warn("[POST_ADMIN_FAQ] DB offline, saving local:", dbErr);
    }

    let localFaq = null;
    if (!faq) {
      localFaq = saveLocalFaq({
        question: parsed.data.question,
        answer: parsed.data.answer,
        order: parsed.data.order || 0,
      });
    }

    revalidatePath("/faq");
    revalidatePath("/");

    return NextResponse.json(
      { success: true, data: faq || localFaq },
      { status: 201 }
    );
  } catch (err) {
    return handleApiError(err, "Failed to create FAQ.");
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = updateFaqSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { id, ...updateData } = parsed.data;
    let faq = null;
    try {
      await connectToDatabase();
      faq = await FAQ.findByIdAndUpdate(id, updateData, { new: true });
    } catch (dbErr) {
      console.warn("[PATCH_ADMIN_FAQ] DB offline, saving local:", dbErr);
    }

    let localFaq = null;
    if (!faq) {
      localFaq = updateLocalFaq(id, updateData);
    }
    if (!faq && !localFaq) {
      return NextResponse.json({ success: false, error: "FAQ not found" }, { status: 404 });
    }

    revalidatePath("/faq");
    revalidatePath("/");

    return NextResponse.json({ success: true, data: faq || localFaq });
  } catch (err) {
    return handleApiError(err, "Failed to update FAQ.");
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = deleteFaqSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    let deleted = false;
    try {
      await connectToDatabase();
      const faq = await FAQ.findByIdAndUpdate(parsed.data.id, { isDeleted: true }, { new: true });
      if (faq) deleted = true;
    } catch (dbErr) {
      console.warn("[DELETE_ADMIN_FAQ] DB offline, deleting local:", dbErr);
    }

    if (!deleted) {
      const localDeleted = deleteLocalFaq(parsed.data.id);
      if (localDeleted) deleted = true;
    }

    if (!deleted) {
      return NextResponse.json({ success: false, error: "FAQ not found" }, { status: 404 });
    }

    revalidatePath("/faq");
    revalidatePath("/");

    return NextResponse.json({ success: true, data: { id: parsed.data.id } });
  } catch (err) {
    return handleApiError(err, "Failed to delete FAQ.");
  }
}
