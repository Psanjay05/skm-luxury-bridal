import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadImageToCloudinary } from "@/lib/cloudinary";

// POST Cloudinary image upload (Admin only)
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await uploadImageToCloudinary(buffer, "skm-luxury-bridal/gallery");

    return NextResponse.json({
      success: true,
      data: {
        url: result.url,
        public_id: result.public_id,
      },
    });
  } catch (err: any) {
    console.error("[CLOUDINARY_UPLOAD_ERROR]", err);
    return NextResponse.json(
      {
        success: false,
        error: err?.message || "Failed to upload image to Cloudinary",
      },
      { status: 500 }
    );
  }
}
