import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import Service from "@/models/Service";
import { handleApiError } from "@/lib/errors";
import { serviceSchema } from "@/lib/validations/service";

export const INITIAL_SERVICES = [
  // Bridal Packages
  {
    _id: "pkg_1",
    title: "Classic Bridal Package",
    price: "₹18,000",
    tagline: "Essential HD makeover for budget-conscious brides",
    description: "High Definition (HD) Foundation Base, Traditional Hair Styling & Flower Draping, Saree Box Pleating, Eyelash Extension, Studio Consultation.",
    imageUrl: "/images/portfolio/traditional-south-indian-bride.jpg",
    category: "bridal_package",
    ctaText: "Book Classic Package",
  },
  {
    _id: "pkg_2",
    title: "Royal HD Makeover Package",
    price: "₹25,000",
    tagline: "Our most popular 2-event Muhurtham + Reception package",
    description: "HD Base for Muhurtham & Reception, 2 Hairstyles, Premium Saree Pre-Pleating, Free Trial Session, Jewellery Discount, Mother Touch-Up.",
    imageUrl: "/images/portfolio/bridal-pink-saree-gold-jewellery.jpg",
    category: "bridal_package",
    ctaText: "Book Royal HD Package",
  },
  {
    _id: "pkg_3",
    title: "Luxury Airbrush Grand Package",
    price: "₹35,000",
    tagline: "18+ Hour waterproof Airbrush finish for grand stage weddings",
    description: "18-Hour Waterproof Airbrush Base, 3 Event Looks, Senior Hairstylist & Saree Team, Studio Trial, Temple Jewellery Included, 2 Family Touch-Ups.",
    imageUrl: "/images/portfolio/before-after-hd-makeover.jpg",
    category: "bridal_package",
    ctaText: "Book Luxury Airbrush",
  },
  // Makeup Services
  {
    _id: "srv_1",
    title: "HD Sweat-Proof Bridal Makeup",
    price: "From ₹9,999",
    description: "Long-lasting high-definition pigments for camera clarity and natural skin finish.",
    imageUrl: "/images/portfolio/bridal-close-up-portrait.jpg",
    category: "makeup",
    ctaText: "Book HD Makeup",
  },
  {
    _id: "srv_2",
    title: "Airbrush Waterproof Makeover",
    price: "From ₹12,999",
    description: "18+ hour stage-ready waterproof airbrush finish for heavy mandap heat.",
    imageUrl: "/images/portfolio/before-after-hd-makeover.jpg",
    category: "makeup",
    ctaText: "Book Airbrush",
  },
  {
    _id: "srv_3",
    title: "Engagement & Reception Glam",
    price: "From ₹7,999",
    description: "Customized soft glam for evening reception and engagement functions.",
    imageUrl: "/images/portfolio/bridal-pink-saree-gold-jewellery.jpg",
    category: "makeup",
    ctaText: "Book Reception Glam",
  },
  {
    _id: "srv_4",
    title: "Guest & Family Makeup",
    price: "From ₹999",
    description: "Party makeover and touch-ups for family members and bridesmaids.",
    imageUrl: "/images/portfolio/traditional-south-indian-bride.jpg",
    category: "makeup",
    ctaText: "Book Guest Makeup",
  },
  // Hair & Saree
  {
    _id: "srv_5",
    title: "South Indian Mogra Gajra Jada",
    price: "From ₹2,500",
    description: "Classic fresh floral braid extensions and traditional hair artistry.",
    imageUrl: "/images/portfolio/traditional-south-indian-bride.jpg",
    category: "hairstyle",
    ctaText: "Book Hairstyle",
  },
  {
    _id: "srv_6",
    title: "French Bubble Pearl Braid",
    price: "From ₹3,000",
    description: "Modern braided crown with pearl pins and crystal accessories.",
    imageUrl: "/images/portfolio/bridal-close-up-portrait.jpg",
    category: "hairstyle",
    ctaText: "Book Modern Hairstyle",
  },
  {
    _id: "srv_7",
    title: "Temple Silver Choti Medallions",
    price: "From ₹2,000",
    description: "Traditional coin medallion hair jewellery styling and thick braid.",
    imageUrl: "/images/portfolio/traditional-south-indian-bride.jpg",
    category: "hairstyle",
    ctaText: "Book Temple Hairdo",
  },
  {
    _id: "srv_8",
    title: "Saree Box Pleating & Folding",
    price: "From ₹800",
    description: "Iron pressing and pre-pleating for hassle-free drape on wedding day.",
    imageUrl: "/images/portfolio/full-bridal-pose-silk-saree.jpg",
    category: "saree",
    ctaText: "Book Saree Draping",
  },
  // Jewellery & Rentals
  {
    _id: "srv_9",
    title: "Antique Jewellery Rental",
    price: "From ₹1,200",
    description: "Temple gold, antique chokers, and ottiyanam waist belts for bridal functions.",
    imageUrl: "/images/jewellery/antique-bridal-complete-set.jpg",
    category: "jewellery",
    ctaText: "Explore Rentals",
  },
  {
    _id: "srv_10",
    title: "Bridal & Guest Mehendi",
    price: "From ₹1,500",
    description: "Customized intricate organic henna designs for bride and guests.",
    imageUrl: "/images/portfolio/before-after-hd-makeover.jpg",
    category: "mehendi",
    ctaText: "Book Mehendi",
  },
  {
    _id: "srv_11",
    title: "Studio Trial & Matching Session",
    price: "From ₹999",
    description: "Personalized saree drape and foundation shade matching consultation at studio.",
    imageUrl: "/images/portfolio/bridal-close-up-portrait.jpg",
    category: "other",
    ctaText: "Book Studio Trial",
  },
  {
    _id: "srv_12",
    title: "Outstation Travel Team",
    price: "Contact Us",
    description: "Senior styling team available across Salem, Tamil Nadu, Bangalore and South India.",
    imageUrl: "/images/portfolio/bridal-pink-saree-gold-jewellery.jpg",
    category: "other",
    ctaText: "Inquire Travel Team",
  },
];

// GET all non-deleted services (Public, filterable by category)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    try {
      await connectToDatabase();

      // Auto-seed initial services if collection is empty
      const count = await Service.countDocuments({ isDeleted: false });
      if (count === 0) {
        console.log("[GET_SERVICES] Seeding initial service packages & prices...");
        const seedPayload = INITIAL_SERVICES.map(({ _id, ...item }) => item);
        await Service.insertMany(seedPayload);
      }

      const filter: Record<string, unknown> = { isDeleted: false };
      if (category && category !== "all") {
        filter.category = category;
      }

      const services = await Service.find(filter).sort({ createdAt: -1 }).lean();
      return NextResponse.json({ success: true, data: services });
    } catch (dbErr: unknown) {
      const dbErrorMessage = dbErr instanceof Error ? dbErr.message : String(dbErr);
      console.warn("[GET_SERVICES] MongoDB unavailable, returning fallback services:", dbErrorMessage);

      const filtered = category && category !== "all"
        ? INITIAL_SERVICES.filter((s) => s.category === category)
        : INITIAL_SERVICES;

      return NextResponse.json({
        success: true,
        data: filtered,
        fallback: true,
        warning: `Database unavailable (${dbErrorMessage}). Showing static catalog.`,
      });
    }
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

    await connectToDatabase();
    const service = await Service.create(parsed.data);

    // Instant cache revalidation on website
    revalidatePath("/services");
    revalidatePath("/bridal-packages");
    revalidatePath("/");

    return NextResponse.json({ success: true, data: service }, { status: 201 });
  } catch (err) {
    return handleApiError(err, "Failed to create service.");
  }
}
