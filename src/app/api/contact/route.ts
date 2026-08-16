import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import ContactMessage from "@/models/ContactMessage";
import { handleApiError } from "@/lib/errors";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  phone: z.string().trim().min(10, "Phone number must be at least 10 digits").max(20),
  email: z.string().trim().email("Invalid email format").optional().or(z.literal("")),
  message: z.string().trim().min(5, "Message must be at least 5 characters").max(2000),
  website_hp: z.string().optional(), // Honeypot field for bot spam protection
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    if (parsed.data.website_hp && parsed.data.website_hp.length > 0) {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    await connectToDatabase();

    const { website_hp, ...messageData } = parsed.data;
    await ContactMessage.create(messageData);

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    return handleApiError(err, "Failed to submit contact message. Please try again.");
  }
}
