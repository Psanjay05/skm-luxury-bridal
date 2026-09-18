import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import GalleryImage from "@/models/Gallery";
import { handleApiError, isValidObjectId } from "@/lib/errors";
import { gallerySchema } from "@/lib/validations/gallery";
import { getLocalGallery, saveLocalGallery, deleteLocalGallery } from "@/lib/local-store";
import { z } from "zod";

const deleteGallerySchema = z.object({
  id: z.string().refine(isValidObjectId, { message: "Invalid gallery ID format" }),
});

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    try {
      await connectToDatabase();
      const filter: Record<string, unknown> = { isDeleted: false };
      if (category && category !== "All") filter.category = category;
      const images = await GalleryImage.find(filter).sort({ createdAt: -1 }).lean();
      return NextResponse.json(
        { success: true, data: images },
        { headers: { "Cache-Control": "no-store, max-age=0" } }
      );
    } catch (dbErr) {
      console.warn("[GET_ADMIN_GALLERY] DB offline, using local store:", dbErr);
    }

    const localImages = getLocalGallery(category && category !== "All" ? category : undefined);
    return NextResponse.json(
      { success: true, data: localImages },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (err) {
    return handleApiError(err, "Failed to fetch gallery images.");
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = gallerySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    let image = null;
    try {
      await connectToDatabase();
      image = await GalleryImage.create(parsed.data);
    } catch (dbErr) {
      console.warn("[POST_ADMIN_GALLERY] DB offline, saving local:", dbErr);
    }

    let localImage = null;
    if (!image) {
      localImage = saveLocalGallery(parsed.data as any);
    }

    revalidatePath("/gallery");
    revalidatePath("/");

    return NextResponse.json(
      { success: true, data: image || localImage },
      { status: 201 }
    );
  } catch (err) {
    return handleApiError(err, "Failed to create gallery item.");
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = deleteGallerySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    let deleted = false;
    try {
      await connectToDatabase();
      const image = await GalleryImage.findByIdAndUpdate(parsed.data.id, { isDeleted: true }, { new: true });
      if (image) deleted = true;
    } catch (dbErr) {
      console.warn("[DELETE_ADMIN_GALLERY] DB offline, deleting local:", dbErr);
    }

    if (!deleted) {
      const localDeleted = deleteLocalGallery(parsed.data.id);
      if (localDeleted) deleted = true;
    }

    if (!deleted) {
      return NextResponse.json({ success: false, error: "Gallery item not found" }, { status: 404 });
    }

    revalidatePath("/gallery");
    revalidatePath("/");

    return NextResponse.json({ success: true, data: { id: parsed.data.id } });
  } catch (err) {
    return handleApiError(err, "Failed to delete gallery item.");
  }
}
