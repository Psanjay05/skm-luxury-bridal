import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import Service from "@/models/Service";
import { handleApiError, isValidObjectId } from "@/lib/errors";
import { serviceSchema } from "@/lib/validations/service";
import { INITIAL_SERVICES } from "@/app/api/services/route";

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
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

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

    if (!service) {
      return NextResponse.json({ success: false, error: "Service not found in database" }, { status: 404 });
    }

    // Instant cache revalidation on website
    revalidatePath("/services");
    revalidatePath("/bridal-packages");
    revalidatePath("/");

    return NextResponse.json({ success: true, data: service });
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

    await connectToDatabase();
    const service = await Service.findByIdAndUpdate(id, { isDeleted: true }, { new: true });

    if (!service) {
      return NextResponse.json({ success: false, error: "Service not found" }, { status: 404 });
    }

    // Instant cache revalidation on website
    revalidatePath("/services");
    revalidatePath("/bridal-packages");
    revalidatePath("/");

    return NextResponse.json({ success: true, data: { id: service._id } });
  } catch (err) {
    return handleApiError(err, "Failed to delete service.");
  }
}
