import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import FAQ from "@/models/FAQ";
import { handleApiError, isValidObjectId } from "@/lib/errors";
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
    await connectToDatabase();
    const faqs = await FAQ.find({ isDeleted: false }).sort({ order: 1, createdAt: -1 }).lean();
    return NextResponse.json(faqs);
  } catch (err) {
    return handleApiError(err, "Failed to fetch FAQs.");
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = createFaqSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const faq = await FAQ.create(parsed.data);
    return NextResponse.json(faq, { status: 201 });
  } catch (err) {
    return handleApiError(err, "Failed to create FAQ.");
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = updateFaqSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { id, ...updateData } = parsed.data;
    await connectToDatabase();
    const faq = await FAQ.findByIdAndUpdate(id, updateData, { new: true });
    if (!faq) {
      return NextResponse.json({ error: "FAQ not found" }, { status: 404 });
    }

    return NextResponse.json(faq);
  } catch (err) {
    return handleApiError(err, "Failed to update FAQ.");
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = deleteFaqSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const faq = await FAQ.findByIdAndUpdate(parsed.data.id, { isDeleted: true }, { new: true });
    if (!faq) {
      return NextResponse.json({ error: "FAQ not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return handleApiError(err, "Failed to delete FAQ.");
  }
}
