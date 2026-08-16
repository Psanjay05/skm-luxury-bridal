import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB limit

export async function uploadImageToCloudinary(
  fileBuffer: Buffer,
  folder = "skm-luxury-bridal/portfolio"
): Promise<{ url: string; public_id: string }> {
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    throw new Error(
      "Cloudinary credentials (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) are not configured on server."
    );
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        transformation: [
          { quality: "auto", fetch_format: "auto" },
          { width: 1920, crop: "limit" },
        ],
      },
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error("Failed to upload image to Cloudinary"));
        }
        resolve({
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );
    uploadStream.end(fileBuffer);
  });
}

export async function deleteImageFromCloudinary(publicId: string): Promise<boolean> {
  if (!publicId || !process.env.CLOUDINARY_API_SECRET) return false;
  try {
    const res = await cloudinary.uploader.destroy(publicId);
    return res.result === "ok";
  } catch (error) {
    console.error("[CLOUDINARY_DELETE_ERROR]", error);
    return false;
  }
}

export default cloudinary;
