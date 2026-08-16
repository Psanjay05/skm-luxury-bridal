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
  imageUrl: z.string().trim().url("Valid image URL is required"),
  iconUrl: z.string().trim().optional().or(z.literal("")),
  ctaText: z.string().trim().default("Book Now"),
  category: z
    .enum(["makeup", "saree", "hairstyle", "jewellery", "mehendi", "other"])
    .default("makeup"),
});

export type ServiceInput = z.infer<typeof serviceSchema>;
