import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import Service from "@/models/Service";
import { handleApiError, isValidObjectId } from "@/lib/errors";
import { serviceSchema } from "@/lib/validations/service";
import { INITIAL_SERVICES } from "@/app/api/services/route";
import {
  updateLocalService,
  deleteLocalService,
  getLocalServiceById,
} from "@/lib/local-store";

// GET single service by ID (Admin only)
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ success: false, error: "Invalid service ID" }, { status: 400 });
    }

    try {
      await connectToDatabase();
      const service = await Service.findById(id).lean();
      if (service && !service.isDeleted) {
        return NextResponse.json({ success: true, data: service });
      }
    } catch (dbErr) {
      console.warn("[GET_ADMIN_SERVICE_ID] MongoDB unavailable, checking local store:", dbErr);
    }

    const localService = getLocalServiceById(id);
    if (localService) {
      return NextResponse.json({ success: true, data: localService });
    }

    return NextResponse.json({ success: false, error: "Service not found" }, { status: 404 });
  } catch (err) {
    return handleApiError(err, "Failed to fetch service.");
  }
}

// PATCH update service (Admin only)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ success: false, error: "Invalid service ID" }, { status: 400 });
    }

    const body = await req.json();
    const parsed = serviceSchema.partial().safeParse(body);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const errorMsg = Object.entries(fieldErrors)
        .map(([k, v]) => `${k}: ${v?.join(", ")}`)
        .join("; ");
      return NextResponse.json(
        { success: false, error: `Validation failed: ${errorMsg}`, details: fieldErrors },
        { status: 400 }
      );
    }

    let updatedService = null;

    try {
      await connectToDatabase();
      let service = await Service.findByIdAndUpdate(id, parsed.data, { new: true });

      // If item was loaded from initial dataset and not yet in DB, upsert it
      if (!service) {
        const initialMatch = INITIAL_SERVICES.find((s) => s._id === id);
        if (initialMatch) {
          const { _id: _, ...initialData } = initialMatch;
          service = await Service.create({
            _id: id,
            ...initialData,
            ...parsed.data,
          });
        }
      }

      if (service) updatedService = service;
    } catch (dbErr) {
      console.warn("[PATCH_ADMIN_SERVICE] MongoDB update unavailable, saving to local store:", dbErr);
    }

    // Always persist update to local store
    const localUpdated = updateLocalService(id, parsed.data);
    if (!updatedService && localUpdated) {
      updatedService = localUpdated;
    }

    if (!updatedService) {
      return NextResponse.json({ success: false, error: "Service not found to update" }, { status: 404 });
    }

    // Instant cache revalidation
    revalidatePath("/services");
    revalidatePath("/bridal-packages");
    revalidatePath("/");

    return NextResponse.json({ success: true, data: updatedService });
  } catch (err) {
    return handleApiError(err, "Failed to update service.");
  }
}

// DELETE soft-delete service (Admin only)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ success: false, error: "Invalid service ID" }, { status: 400 });
    }

    let deleted = false;

    try {
      await connectToDatabase();
      const service = await Service.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
      if (service) deleted = true;
    } catch (dbErr) {
      console.warn("[DELETE_ADMIN_SERVICE] MongoDB unavailable, deleting from local store:", dbErr);
    }

    const localDeleted = deleteLocalService(id);
    if (localDeleted) deleted = true;

    if (!deleted) {
      return NextResponse.json({ success: false, error: "Service not found" }, { status: 404 });
    }

    // Instant cache revalidation
    revalidatePath("/services");
    revalidatePath("/bridal-packages");
    revalidatePath("/");

    return NextResponse.json({ success: true, data: { id } });
  } catch (err) {
    return handleApiError(err, "Failed to delete service.");
  }
}
