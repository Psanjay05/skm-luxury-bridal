import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import Service from "@/models/Service";
import { handleApiError } from "@/lib/errors";
import { serviceSchema } from "@/lib/validations/service";

// GET all non-deleted services (Public)
export async function GET() {
  try {
    await connectToDatabase();
    const services = await Service.find({ isDeleted: false }).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: services });
  } catch (err) {
    return handleApiError(err, "Failed to fetch services.");
  }
}

// POST create service (Admin only)
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = serviceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const service = await Service.create(parsed.data);

    return NextResponse.json({ success: true, data: service }, { status: 201 });
  } catch (err) {
    return handleApiError(err, "Failed to create service.");
  }
}
