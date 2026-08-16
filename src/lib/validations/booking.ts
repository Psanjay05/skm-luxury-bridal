import { z } from "zod";

export const isValidObjectId = (val: string) => /^[0-9a-fA-F]{24}$/.test(val);

export const bookingSchema = z.object({
  customerName: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),
  phone: z
    .string()
    .trim()
    .min(10, "Phone number must be at least 10 digits")
    .max(20, "Phone number cannot exceed 20 characters"),
  service: z.string().trim().min(1, "Please select a service"),
  preferredDate: z.string().min(1, "Preferred date is required"),
  preferredTime: z.string().min(1, "Preferred time is required"),
  location: z
    .string()
    .trim()
    .min(1, "Venue/Location is required")
    .max(200, "Location cannot exceed 200 characters"),
  message: z.string().trim().max(1000, "Message cannot exceed 1000 characters").optional(),
  email: z.string().trim().email("Invalid email format").optional().or(z.literal("")),
  website_hp: z.string().optional(), // Honeypot bot protection
});

export const updateBookingStatusSchema = z.object({
  status: z.enum(["pending", "confirmed", "completed", "cancelled"]),
});

export type BookingInput = z.infer<typeof bookingSchema>;
export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>;
