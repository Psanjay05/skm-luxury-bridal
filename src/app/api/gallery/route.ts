import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import Gallery from "@/models/Gallery";
import { handleApiError } from "@/lib/errors";
import { gallerySchema } from "@/lib/validations/gallery";
import { getLocalGallery, saveLocalGallery } from "@/lib/local-store";

import { INITIAL_GALLERY_ITEMS } from "@/lib/initial-data";
export { INITIAL_GALLERY_ITEMS };

// GET all non-deleted gallery images (Public, filterable by category)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    try {
      await connectToDatabase();
      // Auto-seed if database is active but gallery collection is empty
      const count = await Gallery.countDocuments({ isDeleted: false });
      if (count === 0) {
        console.log("[GET_GALLERY] Seeding initial portfolio gallery images...");
        const seedPayload = INITIAL_GALLERY_ITEMS.map(({ _id, ...item }) => item);
        await Gallery.insertMany(seedPayload);
      }

      const filter: Record<string, unknown> = { isDeleted: false };
      if (category && category !== "All") {
        filter.category = category;
      }

      const images = await Gallery.find(filter).sort({ createdAt: -1 }).lean();
      if (images && images.length > 0) {
        return NextResponse.json({ success: true, data: images });
      }
    } catch (dbErr: unknown) {
      const dbErrorMessage = dbErr instanceof Error ? dbErr.message : String(dbErr);
      console.warn("[GET_GALLERY] MongoDB connection unavailable, serving local gallery items:", dbErrorMessage);
    }

    const localGallery = getLocalGallery(category || undefined);
    return NextResponse.json({
      success: true,
      data: localGallery,
    });
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
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const errorMsg = Object.entries(fieldErrors)
        .map(([k, v]) => `${k}: ${v?.join(", ")}`)
        .join("; ");
      return NextResponse.json(
        { success: false, error: `Validation failed: ${errorMsg}`, details: fieldErrors },
        { status: 400 }
      );
    }

    let createdItem = null;
    try {
      await connectToDatabase();
      const item = await Gallery.create(parsed.data);
      if (item) createdItem = item;
    } catch (dbErr) {
      console.warn("[POST_GALLERY] DB offline, saving local:", dbErr);
    }

    const localCreated = saveLocalGallery(parsed.data as any);
    if (!createdItem) {
      createdItem = localCreated;
    }

    return NextResponse.json({ success: true, data: createdItem }, { status: 201 });
  } catch (err) {
    return handleApiError(err, "Failed to create gallery item.");
  }
}

