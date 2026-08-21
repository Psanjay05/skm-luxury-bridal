import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import Gallery from "@/models/Gallery";
import { handleApiError, isValidObjectId } from "@/lib/errors";
import { gallerySchema } from "@/lib/validations/gallery";
import { INITIAL_GALLERY_ITEMS } from "@/app/api/gallery/route";
import { updateLocalGallery, deleteLocalGallery } from "@/lib/local-store";

// PATCH update gallery item (Admin only)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ success: false, error: "Invalid gallery ID" }, { status: 400 });
    }

    const body = await req.json();
    const parsed = gallerySchema.partial().safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    let item = null;
    try {
      await connectToDatabase();
      item = await Gallery.findByIdAndUpdate(id, parsed.data, { new: true });

      if (!item) {
        const initialMatch = INITIAL_GALLERY_ITEMS.find((g) => g._id === id);
        if (initialMatch) {
          const { _id: _, ...initialData } = initialMatch;
          item = await Gallery.create({
            _id: id,
            ...initialData,
            ...parsed.data,
          });
        }
      }
    } catch (dbErr) {
      console.warn("[PATCH_GALLERY] DB offline, updating local:", dbErr);
    }

    const localUpdated = updateLocalGallery(id, parsed.data);
    if (!item && localUpdated) {
      item = localUpdated;
    }

    if (!item) {
      return NextResponse.json({ success: false, error: "Gallery item not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: item });
  } catch (err) {
    return handleApiError(err, "Failed to update gallery item.");
  }
}

// DELETE soft-delete gallery item (Admin only)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ success: false, error: "Invalid gallery ID" }, { status: 400 });
    }

    let deleted = false;
    try {
      await connectToDatabase();
      const item = await Gallery.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
      if (item) deleted = true;
    } catch (dbErr) {
      console.warn("[DELETE_GALLERY] DB offline, deleting local:", dbErr);
    }

    const localDeleted = deleteLocalGallery(id);
    if (localDeleted) deleted = true;

    if (!deleted) {
      return NextResponse.json({ success: false, error: "Gallery item not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: { id } });
  } catch (err) {
    return handleApiError(err, "Failed to delete gallery item.");
  }
}

