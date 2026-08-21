import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import Service from "@/models/Service";
import { handleApiError, isValidObjectId } from "@/lib/errors";
import { z } from "zod";
import {
  getLocalServices,
  saveLocalService,
  updateLocalService,
  deleteLocalService,
} from "@/lib/local-store";

const createServiceSchema = z.object({
  title: z.string().trim().min(2).max(100),
  description: z.string().trim().min(5).max(1000),
  category: z.string().trim().min(1),
  price: z.string().trim().optional(),
  features: z.array(z.string()).optional(),
  imageUrl: z.string().trim().optional(),
});

const updateServiceSchema = z.object({
  id: z.string().refine(isValidObjectId, { message: "Invalid service ID format" }),
  title: z.string().trim().min(2).max(100).optional(),
  description: z.string().trim().min(5).max(1000).optional(),
  category: z.string().trim().min(1).optional(),
  price: z.string().trim().optional(),
  features: z.array(z.string()).optional(),
  imageUrl: z.string().trim().optional(),
  isFeatured: z.boolean().optional(),
});

const deleteServiceSchema = z.object({
  id: z.string().refine(isValidObjectId, { message: "Invalid service ID format" }),
});

export async function GET(_req: Request) {
  try {
    // Auth guard — also enforced at edge by proxy.ts
    const session = await auth();
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    try {
      await connectToDatabase();
      // DB is source of truth when reachable
      const services = await Service.find({ isDeleted: false }).sort({ createdAt: -1 }).lean();
      // P1 FIX: Return {success, data} envelope — admin page checks json.success && json.data
      return NextResponse.json(
        { success: true, data: services },
        { headers: { "Cache-Control": "no-store, max-age=0" } }
      );
    } catch (dbErr) {
      console.warn("[GET_ADMIN_SERVICES] DB offline, using local store:", dbErr);
    }
    const localServices = getLocalServices();
    return NextResponse.json(
      { success: true, data: localServices },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
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

    let service = null;
    try {
      await connectToDatabase();
      service = await Service.create(parsed.data);
    } catch (dbErr) {
      console.warn("[POST_ADMIN_SERVICES] DB offline, saving local:", dbErr);
    }

    const localService = saveLocalService({
      title: parsed.data.title,
      description: parsed.data.description,
      category: parsed.data.category,
      price: parsed.data.price || "From ₹9,999",
      imageUrl: parsed.data.imageUrl || "/images/portfolio/bridal-pink-saree-gold-jewellery.jpg",
      features: parsed.data.features,
    });

    return NextResponse.json(service || localService, { status: 201 });
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
    let service = null;
    try {
      await connectToDatabase();
      service = await Service.findByIdAndUpdate(id, updateData, { new: true });
    } catch (dbErr) {
      console.warn("[PATCH_ADMIN_SERVICES] DB offline, saving local:", dbErr);
    }

    const localService = updateLocalService(id, updateData);
    if (!service && !localService) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    return NextResponse.json(service || localService);
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

    let deleted = false;
    try {
      await connectToDatabase();
      const service = await Service.findByIdAndUpdate(parsed.data.id, { isDeleted: true }, { new: true });
      if (service) deleted = true;
    } catch (dbErr) {
      console.warn("[DELETE_ADMIN_SERVICES] DB offline, deleting local:", dbErr);
    }

    const localDeleted = deleteLocalService(parsed.data.id);
    if (localDeleted) deleted = true;

    if (!deleted) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return handleApiError(err, "Failed to delete service.");
  }
}

