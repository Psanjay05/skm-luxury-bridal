import { z } from "zod";

export const gallerySchema = z.object({
  imageUrl: z
    .string()
    .trim()
    .min(1, "Image URL or path is required")
    .refine(
      (val) => val.startsWith("/") || val.startsWith("http://") || val.startsWith("https://"),
      { message: "Image must be a valid URL (http/https) or local path (/images/...)" }
    ),
  altText: z.string().trim().min(2, "Alt text is required for accessibility"),
  category: z.enum([
    "Bridal",
    "Reception",
    "Engagement",
    "Guest",
    "Mehendi",
    "Jewellery",
    "Hairstyle",
    "Before & After",
  ]),
});

export type GalleryInput = z.infer<typeof gallerySchema>;
