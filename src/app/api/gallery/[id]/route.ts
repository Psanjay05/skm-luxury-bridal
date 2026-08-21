import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import Gallery from "@/models/Gallery";
import { handleApiError, isValidObjectId } from "@/lib/errors";
import { gallerySchema } from "@/lib/validations/gallery";
import { INITIAL_GALLERY_ITEMS } from "@/app/api/gallery/route";

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

    await connectToDatabase();
    let item = await Gallery.findByIdAndUpdate(id, parsed.data, { new: true });

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

    await connectToDatabase();
    const item = await Gallery.findByIdAndUpdate(id, { isDeleted: true }, { new: true });

    if (!item) {
      return NextResponse.json({ success: false, error: "Gallery item not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: { id: item._id } });
  } catch (err) {
    return handleApiError(err, "Failed to delete gallery item.");
  }
}
