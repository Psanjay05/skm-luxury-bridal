import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import Gallery from "@/models/Gallery";
import { handleApiError } from "@/lib/errors";
import { gallerySchema } from "@/lib/validations/gallery";

// GET all non-deleted gallery images (Public, filterable by category)
export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    const filter: Record<string, unknown> = { isDeleted: false };
    if (category && category !== "All") {
      filter.category = category;
    }

    const images = await Gallery.find(filter).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: images });
  } catch (err) {
    return handleApiError(err, "Failed to fetch gallery images.");
  }
}

// POST create new gallery item (Admin only)
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = gallerySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const item = await Gallery.create(parsed.data);

    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch (err) {
    return handleApiError(err, "Failed to create gallery item.");
  }
}
