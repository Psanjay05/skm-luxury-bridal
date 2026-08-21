import { z } from "zod";

export const serviceSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Service title is required")
    .max(100, "Title cannot exceed 100 characters"),
  description: z
    .string()
    .trim()
    .min(5, "Service description is required"),
  // BUG 2 FIX: z.coerce.string() ensures that if the JSON body sends price as
  // a number (e.g. 20 instead of "20"), it is coerced to "20" rather than
  // failing validation. Free-text labels like "just ₹20", "From ₹9,999",
  // "Contact Us" all round-trip correctly without any digit loss.
  price: z
    .union([z.string(), z.number()])
    .transform((val) => String(val).trim())
    .refine((val) => val.length >= 1, "Service price is required (e.g. ₹18,000 or From ₹9,999)"),
  tagline: z.string().trim().optional(),
  features: z.array(z.string()).optional(),
  imageUrl: z
    .string()
    .trim()
    .min(1, "Image URL or path is required")
    .refine(
      (val) => val.startsWith("/") || val.startsWith("http://") || val.startsWith("https://"),
      { message: "Image must be a valid URL or local path (/images/...)" }
    ),
  iconUrl: z.string().trim().optional().or(z.literal("")),
  ctaText: z.string().trim().default("Book Now"),
  category: z
    .enum(["makeup", "saree", "hairstyle", "jewellery", "mehendi", "bridal_package", "other"])
    .default("makeup"),
});

export type ServiceInput = z.infer<typeof serviceSchema>;
