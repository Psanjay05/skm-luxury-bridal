import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import fs from "fs";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "gallery");

function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

// POST Image upload (Cloudinary with Local Disk Fallback, Admin only)
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: "No image file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. If Cloudinary credentials are configured, try uploading to Cloudinary
    const isCloudinaryConfigured =
      Boolean(process.env.CLOUDINARY_CLOUD_NAME) &&
      Boolean(process.env.CLOUDINARY_API_KEY) &&
      Boolean(process.env.CLOUDINARY_API_SECRET);

    if (isCloudinaryConfigured) {
      try {
        const result = await uploadImageToCloudinary(buffer, "skm-luxury-bridal/gallery");
        return NextResponse.json({
          success: true,
          data: {
            url: result.url,
            public_id: result.public_id,
            source: "cloudinary",
          },
        });
      } catch (cloudinaryErr) {
        console.warn("[UPLOAD] Cloudinary failed, saving to local disk fallback:", cloudinaryErr);
      }
    }

    // 2. Fallback to saving image to local public/uploads/gallery directory
    ensureUploadDir();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const uniqueFilename = `${Date.now()}-${sanitizedName}`;
    const filePath = path.join(UPLOAD_DIR, uniqueFilename);

    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/gallery/${uniqueFilename}`;

    return NextResponse.json({
      success: true,
      data: {
        url: publicUrl,
        public_id: uniqueFilename,
        source: "local",
      },
    });
  } catch (err: unknown) {
    console.error("[IMAGE_UPLOAD_ERROR]", err);
    const msg = err instanceof Error ? err.message : "Failed to upload image";
    return NextResponse.json(
      {
        success: false,
        error: msg,
      },
      { status: 500 }
    );
  }
}

