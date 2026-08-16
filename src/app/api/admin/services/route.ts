import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import Service from "@/models/Service";
import { handleApiError, isValidObjectId } from "@/lib/errors";
import { z } from "zod";

const createServiceSchema = z.object({
  title: z.string().trim().min(2).max(100),
  description: z.string().trim().min(5).max(1000),
  category: z.string().trim().min(1),
  price: z.string().trim().optional(),
  features: z.array(z.string()).optional(),
});

const updateServiceSchema = z.object({
  id: z.string().refine(isValidObjectId, { message: "Invalid service ID format" }),
  title: z.string().trim().min(2).max(100).optional(),
  description: z.string().trim().min(5).max(1000).optional(),
  category: z.string().trim().min(1).optional(),
  price: z.string().trim().optional(),
  features: z.array(z.string()).optional(),
  isFeatured: z.boolean().optional(),
});

const deleteServiceSchema = z.object({
  id: z.string().refine(isValidObjectId, { message: "Invalid service ID format" }),
});

export async function GET() {
  try {
    await connectToDatabase();
    const services = await Service.find({ isDeleted: false }).sort({ createdAt: -1 }).lean();
    return NextResponse.json(services);
  } catch (err) {
    return handleApiError(err, "Failed to fetch services.");
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = createServiceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const service = await Service.create(parsed.data);
    return NextResponse.json(service, { status: 201 });
  } catch (err) {
    return handleApiError(err, "Failed to create service.");
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = updateServiceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { id, ...updateData } = parsed.data;
    await connectToDatabase();
    const service = await Service.findByIdAndUpdate(id, updateData, { new: true });
    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    return NextResponse.json(service);
  } catch (err) {
    return handleApiError(err, "Failed to update service.");
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = deleteServiceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const service = await Service.findByIdAndUpdate(parsed.data.id, { isDeleted: true }, { new: true });
    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return handleApiError(err, "Failed to delete service.");
  }
}
