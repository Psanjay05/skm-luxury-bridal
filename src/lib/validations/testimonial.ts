import { z } from "zod";

export const testimonialSchema = z.object({
  customerName: z
    .string()
    .trim()
    .min(2, "Customer name is required")
    .max(100, "Name cannot exceed 100 characters"),
  review: z
    .string()
    .trim()
    .min(5, "Review text must be at least 5 characters"),
  rating: z.number().min(1).max(5),
  isFeatured: z.boolean(),
});

export const updateTestimonialSchema = testimonialSchema.partial();

export type TestimonialInput = z.infer<typeof testimonialSchema>;
