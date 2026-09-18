import mongoose from "mongoose";
import fs from "fs";
import path from "path";

export const MIGRATION_VERSION = "2026-09-admin-data-sync-v1";
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/skm_luxury_bridal";
const DATA_DIR = path.join(process.cwd(), "data");

// Helper to read local JSON data
export function readLocalJson(filename) {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) return [];
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw);
  } catch (e) {
    console.error(`[MIGRATION] Error reading ${filename}:`, e.message);
    return [];
  }
}

// Pure reconciliation engine for testing & execution
export function reconcileEntityCollection(localItems, dbItems, options = {}) {
  const { dryRun = true, idField = "_id", titleField = "title" } = options;
  const report = {
    mongoCount: dbItems.length,
    localCount: localItems.length,
    candidates: 0,
    conflicts: 0,
    duplicatesAvoided: 0,
    toInsert: [],
    conflictDetails: [],
  };

  const dbIdMap = new Map(dbItems.map((item) => [String(item[idField] || item._id), item]));
  const dbTitleMap = new Map(
    dbItems.map((item) => [String(item[titleField] || item.question || item.customerName || item.imageUrl || "").toLowerCase().trim(), item])
  );

  for (const local of localItems) {
    if (local.isDeleted) continue;

    const localId = String(local[idField] || local._id);
    const localTitle = String(local[titleField] || local.question || local.customerName || local.imageUrl || "").toLowerCase().trim();

    const matchedById = dbIdMap.get(localId);
    const matchedByTitle = dbTitleMap.get(localTitle);

    if (matchedById) {
      report.duplicatesAvoided++;
      // Check for value discrepancies
      const hasValueMismatch =
        (local.price && matchedById.price !== local.price) ||
        (local.description && matchedById.description !== local.description) ||
        (local.answer && matchedById.answer !== local.answer) ||
        (local.review && matchedById.review !== local.review);

      if (hasValueMismatch) {
        report.conflicts++;
        report.conflictDetails.push({
          id: localId,
          title: localTitle,
          reason: "Value difference detected between MongoDB and local-store. MongoDB preserved.",
          mongoVal: matchedById.price || matchedById.answer || matchedById.review,
          localVal: local.price || local.answer || local.review,
        });
      }
      continue;
    }

    if (matchedByTitle) {
      report.duplicatesAvoided++;
      const hasValueMismatch =
        (local.price && matchedByTitle.price !== local.price) ||
        (local.description && matchedByTitle.description !== local.description) ||
        (local.answer && matchedByTitle.answer !== local.answer) ||
        (local.review && matchedByTitle.review !== local.review);

      if (hasValueMismatch) {
        report.conflicts++;
        report.conflictDetails.push({
          id: localId,
          title: localTitle,
          reason: "Existing entity in MongoDB has differing values. MongoDB preserved.",
        });
      }
      continue;
    }

    // New unique candidate
    report.candidates++;
    report.toInsert.push(local);
  }

  return report;
}

// Schemas
const MigrationSchema = new mongoose.Schema(
  {
    version: { type: String, required: true, unique: true },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date },
    details: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

const ServiceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: String, required: true, default: "From ₹9,999" },
    tagline: { type: String },
    imageUrl: { type: String, required: true },
    iconUrl: { type: String },
    ctaText: { type: String, default: "Book Now" },
    category: { type: String, default: "makeup" },
    features: { type: [String], default: [] },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const GallerySchema = new mongoose.Schema(
  {
    imageUrl: { type: String, required: true },
    altText: { type: String, required: true },
    category: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const FAQSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    order: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const TestimonialSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true },
    review: { type: String, required: true },
    rating: { type: Number, required: true },
    isFeatured: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Migration = mongoose.models.Migration || mongoose.model("Migration", MigrationSchema);
const Service = mongoose.models.Service || mongoose.model("Service", ServiceSchema);
const Gallery = mongoose.models.Gallery || mongoose.model("Gallery", GallerySchema);
const FAQ = mongoose.models.FAQ || mongoose.model("FAQ", FAQSchema);
const Testimonial = mongoose.models.Testimonial || mongoose.model("Testimonial", TestimonialSchema);

export async function runMigrationCLI(customEnv = {}) {
  const env = customEnv.NODE_ENV || process.env.NODE_ENV || "development";
  const isProduction = env === "production";
  const enableMigration = (customEnv.ENABLE_DATA_MIGRATION ?? process.env.ENABLE_DATA_MIGRATION) === "true";
  const allowProduction = (customEnv.ALLOW_PRODUCTION_MIGRATION ?? process.env.ALLOW_PRODUCTION_MIGRATION) === "true";
  const dryRun = (customEnv.MIGRATION_DRY_RUN ?? process.env.MIGRATION_DRY_RUN) !== "false"; // default is true
  const backupConfirmed = (customEnv.MIGRATION_BACKUP_CONFIRMED ?? process.env.MIGRATION_BACKUP_CONFIRMED) === "true";

  console.log("==================================================");
  console.log("🛡️  SAFE DATA MIGRATION GUARD — EXECUTION");
  console.log("==================================================");
  console.log(`[MIGRATION] Migration Version: ${MIGRATION_VERSION}`);
  console.log(`[MIGRATION] Environment      : ${env}`);
  console.log(`[MIGRATION] Enabled Flag     : ${enableMigration}`);
  console.log(`[MIGRATION] Dry-Run Mode     : ${dryRun}`);

  // 44.1 Explicit Migration Flag
  if (!enableMigration) {
    console.warn("\n[MIGRATION] ⚠️  ABORTED: ENABLE_DATA_MIGRATION is false or not set.");
    console.warn("[MIGRATION] Safe guard prevented migration from executing.");
    return { status: "ABORTED", reason: "ENABLE_DATA_MIGRATION_DISABLED" };
  }

  // 44.2 Production Safety Check
  if (isProduction && !allowProduction) {
    console.warn("\n[MIGRATION] 🛑 ABORTED: Running in PRODUCTION but ALLOW_PRODUCTION_MIGRATION is not set to true.");
    console.warn("[MIGRATION] Production guard prevented execution.");
    return { status: "ABORTED", reason: "ALLOW_PRODUCTION_MIGRATION_MISSING" };
  }

  // 44.11 Production Backup Requirement
  if (isProduction && !dryRun && !backupConfirmed) {
    console.warn("\n[MIGRATION] 🛑 ABORTED: Production write requires MIGRATION_BACKUP_CONFIRMED=true.");
    console.warn("[MIGRATION] Aborted to ensure manual database backup has been verified.");
    return { status: "ABORTED", reason: "MIGRATION_BACKUP_CONFIRMED_MISSING" };
  }

  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(MONGODB_URI);
    }
    console.log("[MIGRATION] MongoDB connection: AVAILABLE\n");
  } catch (err) {
    console.warn(`[MIGRATION] ⚠️ MongoDB Connection unavailable (${err.message}). Safe guard aborts without changing state.`);
    return { status: "ABORTED", reason: "MONGODB_CONNECTION_UNAVAILABLE", error: err.message };
  }

  // 44.9 Check if already completed
  const existing = await Migration.findOne({ version: MIGRATION_VERSION, completed: true });
  if (existing) {
    console.log(`[MIGRATION] ℹ️  Version ${MIGRATION_VERSION} was already completed at ${existing.completedAt}. Nothing to do.`);
    return { status: "ALREADY_COMPLETED", version: MIGRATION_VERSION };
  }

  try {
    const localServices = readLocalJson("services.json").filter((s) => !s.isDeleted);
    const dbServices = await Service.find({ isDeleted: false }).lean();
    const servicesReport = reconcileEntityCollection(localServices, dbServices, { dryRun, titleField: "title" });

    const localGallery = readLocalJson("gallery.json").filter((g) => !g.isDeleted);
    const dbGallery = await Gallery.find({ isDeleted: false }).lean();
    const galleryReport = reconcileEntityCollection(localGallery, dbGallery, { dryRun, titleField: "imageUrl" });

    const localTestimonials = readLocalJson("testimonials.json").filter((t) => !t.isDeleted);
    const dbTestimonials = await Testimonial.find({ isDeleted: false }).lean();
    const testimonialsReport = reconcileEntityCollection(localTestimonials, dbTestimonials, { dryRun, titleField: "customerName" });

    const localFaqs = readLocalJson("faq.json").filter((f) => !f.isDeleted);
    const dbFaqs = await FAQ.find({ isDeleted: false }).lean();
    const faqsReport = reconcileEntityCollection(localFaqs, dbFaqs, { dryRun, titleField: "question" });

    const report = {
      services: servicesReport,
      gallery: galleryReport,
      testimonials: testimonialsReport,
      faqs: faqsReport,
    };

    console.log("[MIGRATION] SUMMARY OF INSPECTED ENTITIES:");
    console.log(`  • Services: MongoDB=${report.services.mongoCount}, Local=${report.services.localCount}, Candidates=${report.services.candidates}, Conflicts=${report.services.conflicts}`);
    console.log(`  • Gallery: MongoDB=${report.gallery.mongoCount}, Local=${report.gallery.localCount}, Candidates=${report.gallery.candidates}, Conflicts=${report.gallery.conflicts}`);
    console.log(`  • Testimonials: MongoDB=${report.testimonials.mongoCount}, Local=${report.testimonials.localCount}, Candidates=${report.testimonials.candidates}, Conflicts=${report.testimonials.conflicts}`);
    console.log(`  • FAQs: MongoDB=${report.faqs.mongoCount}, Local=${report.faqs.localCount}, Candidates=${report.faqs.candidates}, Conflicts=${report.faqs.conflicts}\n`);

    if (dryRun) {
      console.log("[MIGRATION] 🛡️  DRY RUN COMPLETED: No records modified or deleted in MongoDB or local-store.");
      return { status: "DRY_RUN_COMPLETED", report };
    }

    // Execute insertions if not dry run
    for (const item of servicesReport.toInsert) {
      const { _id, ...clean } = item;
      await Service.create(clean);
    }
    for (const item of galleryReport.toInsert) {
      const { _id, ...clean } = item;
      await Gallery.create(clean);
    }
    for (const item of testimonialsReport.toInsert) {
      const { _id, ...clean } = item;
      await Testimonial.create(clean);
    }
    for (const item of faqsReport.toInsert) {
      const { _id, ...clean } = item;
      await FAQ.create(clean);
    }

    await Migration.findOneAndUpdate(
      { version: MIGRATION_VERSION },
      {
        version: MIGRATION_VERSION,
        completed: true,
        completedAt: new Date(),
        details: report,
      },
      { upsert: true, new: true }
    );

    console.log(`[MIGRATION] ✅ SUCCESS: Migration ${MIGRATION_VERSION} recorded as completed.`);
    return { status: "SUCCESS", version: MIGRATION_VERSION, report };
  } catch (err) {
    console.error(`[MIGRATION] ❌ Migration encountered an error: ${err.message}`);
    return { status: "FAILED", error: err.message };
  }
}

// If executed directly from CLI
if (process.argv[1]?.includes("safe-migrate.mjs")) {
  runMigrationCLI().then((res) => {
    if (res.status === "FAILED") {
      process.exit(1);
    } else {
      process.exit(0);
    }
  });
}
