import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import Service from "@/models/Service";
import { handleApiError } from "@/lib/errors";
import { serviceSchema } from "@/lib/validations/service";

import { INITIAL_SERVICES } from "@/lib/initial-data";
import { getLocalServices, saveLocalService } from "@/lib/local-store";
export { INITIAL_SERVICES };

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET all non-deleted services (Public, filterable by category)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    try {
      await connectToDatabase();

      const filter: Record<string, unknown> = { isDeleted: false };
      if (category && category !== "all") {
        filter.category = category;
      }

      // DB is the single source of truth when reachable.
      const dbServices = await Service.find(filter).sort({ createdAt: -1 }).lean();
      return NextResponse.json(
        { success: true, data: dbServices },
        { headers: { "Cache-Control": "no-store, max-age=0" } }
      );
    } catch (dbErr: unknown) {
      const dbErrorMessage = dbErr instanceof Error ? dbErr.message : String(dbErr);
      console.warn("[GET_SERVICES] MongoDB unavailable, using local store:", dbErrorMessage);
    }

    // DB offline — fall back to local JSON
    const localServices = getLocalServices(category || undefined);
    return NextResponse.json(
      { success: true, data: localServices },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
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
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const errorMsg = Object.entries(fieldErrors)
        .map(([k, v]) => `${k}: ${v?.join(", ")}`)
        .join("; ");
      return NextResponse.json(
        { success: false, error: `Validation failed: ${errorMsg}`, details: fieldErrors },
        { status: 400 }
      );
    }

    let createdService = null;

    try {
      await connectToDatabase();
      const service = await Service.create(parsed.data);
      if (service) createdService = service;
    } catch (dbErr) {
      console.warn("[POST_SERVICE] MongoDB unavailable, saving to local store:", dbErr);
    }

    if (!createdService) {
      createdService = saveLocalService(parsed.data as any);
    }

    // Instant cache revalidation on website
    revalidatePath("/services");
    revalidatePath("/bridal-packages");
    revalidatePath("/");

    return NextResponse.json({ success: true, data: createdService }, { status: 201 });
  } catch (err) {
    return handleApiError(err, "Failed to create service.");
  }
}

