import { z } from "zod";

export const gallerySchema = z.object({
  imageUrl: z.string().trim().url("Valid image URL is required"),
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
