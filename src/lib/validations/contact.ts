import { z } from "zod";

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),
  phone: z
    .string()
    .trim()
    .min(10, "Phone number must be at least 10 digits")
    .max(20, "Phone number cannot exceed 20 characters"),
  email: z.string().trim().email("Invalid email format").optional().or(z.literal("")),
  message: z
    .string()
    .trim()
    .min(5, "Message must be at least 5 characters")
    .max(2000, "Message cannot exceed 2000 characters"),
  website_hp: z.string().optional(), // Honeypot bot protection
});

export const updateContactStatusSchema = z.object({
  status: z.enum(["unread", "read"]),
});

export type ContactInput = z.infer<typeof contactSchema>;
