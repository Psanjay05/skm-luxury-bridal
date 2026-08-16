import { z } from "zod";

export const faqSchema = z.object({
  question: z
    .string()
    .trim()
    .min(5, "Question must be at least 5 characters"),
  answer: z
    .string()
    .trim()
    .min(5, "Answer must be at least 5 characters"),
  order: z.coerce.number().default(0),
});

export type FAQInput = z.infer<typeof faqSchema>;
