import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import Gallery from "@/models/Gallery";
import { handleApiError } from "@/lib/errors";
import { gallerySchema } from "@/lib/validations/gallery";

export const INITIAL_GALLERY_ITEMS = [
  {
    _id: "65b000000000000000000001",
    imageUrl: "/images/portfolio/before-after-hd-makeover.jpg",
    altText: "HD Bridal Makeover Transformation by Maha Shree",
    category: "Before & After",
  },
  {
    _id: "65b000000000000000000002",
    imageUrl: "/images/portfolio/traditional-south-indian-bride.jpg",
    altText: "Outdoor Traditional South Indian Bride Look",
    category: "Bridal",
  },
  {
    _id: "65b000000000000000000003",
    imageUrl: "/images/portfolio/bridal-pink-saree-gold-jewellery.jpg",
    altText: "Royal Pink Silk Bridal Makeup & Antique Gold",
    category: "Bridal",
  },
  {
    _id: "65b000000000000000000004",
    imageUrl: "/images/portfolio/full-bridal-pose-silk-saree.jpg",
    altText: "Pre-Pleated Silk Saree & Temple Belt Pose",
    category: "Reception",
  },
  {
    _id: "65b000000000000000000005",
    imageUrl: "/images/portfolio/bridal-close-up-portrait.jpg",
    altText: "Glowing HD Bridal Portrait & Soft Hairdo by Maha Shree",
    category: "Hairstyle",
  },
  {
    _id: "65b000000000000000000006",
    imageUrl: "/images/jewellery/antique-bridal-complete-set.jpg",
    altText: "Royal Antique Temple Gold Grand Set Styling",
    category: "Jewellery",
  },
  {
    _id: "65b000000000000000000007",
    imageUrl: "/images/jewellery/lakshmi-haram-full-set.jpg",
    altText: "Lakshmi Haram Full Bridal Jewellery Set",
    category: "Jewellery",
  },
  {
    _id: "65b000000000000000000008",
    imageUrl: "/images/jewellery/peacock-antique-bridal-set.jpg",
    altText: "Peacock Motif Antique Bridal Set & Armlet",
    category: "Jewellery",
  },
  {
    _id: "65b000000000000000000009",
    imageUrl: "/images/jewellery/bride-wearing-jewellery.jpg",
    altText: "Engagement Soft Glam & Blue Silk Saree Styling",
    category: "Engagement",
  },
  {
    _id: "65b000000000000000000010",
    imageUrl: "/images/portfolio/before-after-hd-makeover.jpg",
    altText: "Intricate Bridal Mehendi & Henna Artistry",
    category: "Mehendi",
  },
  {
    _id: "65b000000000000000000011",
    imageUrl: "/images/portfolio/bridal-close-up-portrait.jpg",
    altText: "Party Guest & Mother-of-the-Bride Elegant Makeover",
    category: "Guest",
  },
];

// GET all non-deleted gallery images (Public, filterable by category)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    try {
      await connectToDatabase();

      // Auto-seed if database is active but gallery collection is empty
      const count = await Gallery.countDocuments({ isDeleted: false });
      if (count === 0) {
        console.log("[GET_GALLERY] Seeding initial portfolio gallery images...");
        const seedPayload = INITIAL_GALLERY_ITEMS.map(({ _id, ...item }) => item);
        await Gallery.insertMany(seedPayload);
      }

      const filter: Record<string, unknown> = { isDeleted: false };
      if (category && category !== "All") {
        filter.category = category;
      }

      const images = await Gallery.find(filter).sort({ createdAt: -1 }).lean();
      return NextResponse.json({ success: true, data: images });
    } catch (dbErr: unknown) {
      const dbErrorMessage = dbErr instanceof Error ? dbErr.message : String(dbErr);
      console.warn("[GET_GALLERY] MongoDB connection unavailable, serving fallback gallery items:", dbErrorMessage);

      const filtered = category && category !== "All"
        ? INITIAL_GALLERY_ITEMS.filter((item) => item.category === category)
        : INITIAL_GALLERY_ITEMS;

      return NextResponse.json({
        success: true,
        data: filtered,
        fallback: true,
        warning: `Database unavailable (${dbErrorMessage}). Showing offline portfolio.`,
      });
    }
  } catch (err) {
    return handleApiError(err, "Failed to fetch gallery images.");
  }
}

// POST create new gallery item (Admin only)
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = gallerySchema.safeParse(body);

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

    await connectToDatabase();
    const item = await Gallery.create(parsed.data);

    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch (err) {
    return handleApiError(err, "Failed to create gallery item.");
  }
}
