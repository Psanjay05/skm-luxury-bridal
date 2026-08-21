import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import GalleryImage from "@/models/Gallery";
import { handleApiError, isValidObjectId } from "@/lib/errors";
import { z } from "zod";

const createGallerySchema = z.object({
  title: z.string().trim().min(2).max(100),
  category: z.enum(["Bridal", "Before & After", "Jewellery", "Saree Draping"]),
  imageUrl: z.string().url("Invalid image URL"),
  publicId: z.string().optional(),
  description: z.string().trim().max(500).optional(),
});

const deleteGallerySchema = z.object({
  id: z.string().refine(isValidObjectId, { message: "Invalid gallery ID format" }),
});

export async function GET(req: Request) {
  try {
    // SKM-003 FIX: Admin gallery GET must require authentication
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const filter: Record<string, unknown> = { isDeleted: false };
    if (category && category !== "All") filter.category = category;
    const images = await GalleryImage.find(filter).sort({ createdAt: -1 }).lean();
    return NextResponse.json(images);
  } catch (err) {
    return handleApiError(err, "Failed to fetch gallery images.");

  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = createGallerySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const image = await GalleryImage.create(parsed.data);
    return NextResponse.json(image, { status: 201 });
  } catch (err) {
    return handleApiError(err, "Failed to create gallery item.");
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = deleteGallerySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const image = await GalleryImage.findByIdAndUpdate(parsed.data.id, { isDeleted: true }, { new: true });
    if (!image) {
      return NextResponse.json({ error: "Gallery item not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return handleApiError(err, "Failed to delete gallery item.");
  }
}
