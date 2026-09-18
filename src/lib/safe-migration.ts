import connectToDatabase from "@/lib/db";
import Service from "@/models/Service";
import Gallery from "@/models/Gallery";
import Testimonial from "@/models/Testimonial";
import FAQ from "@/models/FAQ";
import Migration from "@/models/Migration";
import {
  getLocalServices,
  getLocalGallery,
  getLocalTestimonials,
  getLocalFaqs,
  ServiceRecord,
  GalleryRecord,
  TestimonialRecord,
  FAQRecord,
} from "@/lib/local-store";

export const MIGRATION_VERSION = "2026-09-admin-data-sync-v1";

export interface MigrationOptions {
  enableMigration?: boolean;
  allowProduction?: boolean;
  dryRun?: boolean;
  backupConfirmed?: boolean;
  nodeEnv?: string;
  silent?: boolean;
}

export interface EntityMigrationReport {
  mongoCount: number;
  localCount: number;
  candidatesCount: number;
  insertedCount: number;
  conflictsCount: number;
  conflicts: Array<{ id: string; nameOrTitle: string; reason: string }>;
}

export interface MigrationResult {
  version: string;
  environment: string;
  dryRun: boolean;
  executed: boolean;
  completed: boolean;
  skippedAlreadyCompleted?: boolean;
  abortedReason?: string;
  entities: {
    services?: EntityMigrationReport;
    gallery?: EntityMigrationReport;
    testimonials?: EntityMigrationReport;
    faqs?: EntityMigrationReport;
  };
  errors: string[];
}

export async function runSafeMigration(options: MigrationOptions = {}): Promise<MigrationResult> {
  const env = options.nodeEnv ?? process.env.NODE_ENV ?? "development";
  const isProduction = env === "production";

  const enableMigration =
    options.enableMigration ?? (process.env.ENABLE_DATA_MIGRATION === "true");
  const allowProduction =
    options.allowProduction ?? (process.env.ALLOW_PRODUCTION_MIGRATION === "true");
  const dryRun =
    options.dryRun !== undefined
      ? options.dryRun
      : process.env.MIGRATION_DRY_RUN !== "false"; // default is true
  const backupConfirmed =
    options.backupConfirmed ?? (process.env.MIGRATION_BACKUP_CONFIRMED === "true");

  const log = (...args: unknown[]) => {
    if (!options.silent) {
      console.log(...args);
    }
  };
  const warn = (...args: unknown[]) => {
    if (!options.silent) {
      console.warn(...args);
    }
  };

  const result: MigrationResult = {
    version: MIGRATION_VERSION,
    environment: env,
    dryRun,
    executed: false,
    completed: false,
    entities: {},
    errors: [],
  };

  log(`[MIGRATION] Starting migration check: ${MIGRATION_VERSION}`);
  log(`[MIGRATION] Environment: ${env}`);
  log(`[MIGRATION] Dry run: ${dryRun}`);

  // 44.1 Explicit Migration Flag
  if (!enableMigration) {
    const reason = "ENABLE_DATA_MIGRATION is not enabled (false or missing). Migration aborted safely.";
    warn(`[MIGRATION] ${reason}`);
    result.abortedReason = reason;
    return result;
  }

  // 44.2 Production Safety
  if (isProduction && !allowProduction) {
    const reason = "NODE_ENV is production and ALLOW_PRODUCTION_MIGRATION is false or missing. Migration aborted safely.";
    warn(`[MIGRATION] ${reason}`);
    result.abortedReason = reason;
    return result;
  }

  // 44.11 Backup Requirement in Production when Dry Run is False
  if (isProduction && !dryRun && !backupConfirmed) {
    const reason = "Production migration requires MIGRATION_BACKUP_CONFIRMED=true. Migration aborted safely.";
    warn(`[MIGRATION] ${reason}`);
    result.abortedReason = reason;
    return result;
  }

  try {
    await connectToDatabase();
    log("[MIGRATION] MongoDB connection: available");
  } catch (err) {
    const reason = `MongoDB connection unavailable: ${err instanceof Error ? err.message : String(err)}`;
    warn(`[MIGRATION] ${reason}`);
    result.abortedReason = reason;
    result.errors.push(reason);
    return result;
  }

  // 44.9 Check if this migration version already completed
  try {
    const existingMigration = await Migration.findOne({ version: MIGRATION_VERSION, completed: true });
    if (existingMigration) {
      log(`[MIGRATION] Version ${MIGRATION_VERSION} has already completed on ${existingMigration.completedAt?.toISOString() || "previous run"}. Skipping.`);
      result.skippedAlreadyCompleted = true;
      result.completed = true;
      result.executed = false;
      return result;
    }
  } catch (e) {
    log("[MIGRATION] Note: Migration collection check initiated.");
  }

  result.executed = true;

  try {
    // 44.14 Migration Entity Order:
    // 1. Services & Bridal Packages
    // 2. Gallery
    // 3. Testimonials
    // 4. FAQ

    // 1. SERVICES
    log("\n[MIGRATION] Processing Entity 1/4: Services...");
    const servicesReport = await migrateServices(dryRun, log);
    result.entities.services = servicesReport;

    // 2. GALLERY
    log("\n[MIGRATION] Processing Entity 2/4: Gallery...");
    const galleryReport = await migrateGallery(dryRun, log);
    result.entities.gallery = galleryReport;

    // 3. TESTIMONIALS
    log("\n[MIGRATION] Processing Entity 3/4: Testimonials...");
    const testimonialsReport = await migrateTestimonials(dryRun, log);
    result.entities.testimonials = testimonialsReport;

    // 4. FAQ
    log("\n[MIGRATION] Processing Entity 4/4: FAQs...");
    const faqsReport = await migrateFaqs(dryRun, log);
    result.entities.faqs = faqsReport;

    // If dry run, do not record migration as complete
    if (dryRun) {
      log("\n[MIGRATION] DRY RUN FINISHED: No database changes performed because dry-run is enabled.");
      result.completed = false;
      return result;
    }

    // Record migration completion only after all entities succeeded
    await Migration.findOneAndUpdate(
      { version: MIGRATION_VERSION },
      {
        version: MIGRATION_VERSION,
        completed: true,
        completedAt: new Date(),
        details: {
          services: servicesReport,
          gallery: galleryReport,
          testimonials: testimonialsReport,
          faqs: faqsReport,
        },
      },
      { upsert: true, new: true }
    );

    result.completed = true;
    log(`\n[MIGRATION] ✅ Migration ${MIGRATION_VERSION} completed successfully.`);
    return result;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    warn(`[MIGRATION] ❌ Migration failed midway: ${errorMsg}`);
    result.errors.push(errorMsg);
    result.completed = false;
    return result;
  }
}

// ---------------- ENTITY MIGRATION HELPERS ----------------

async function migrateServices(dryRun: boolean, log: (...args: unknown[]) => void): Promise<EntityMigrationReport> {
  const localItems = getLocalServices();
  const dbItems = await Service.find({ isDeleted: false }).lean();

  const report: EntityMigrationReport = {
    mongoCount: dbItems.length,
    localCount: localItems.length,
    candidatesCount: 0,
    insertedCount: 0,
    conflictsCount: 0,
    conflicts: [],
  };

  const dbIdMap = new Map(dbItems.map((item) => [String(item._id), item]));
  const dbTitleMap = new Map(dbItems.map((item) => [item.title.toLowerCase().trim(), item]));

  for (const local of localItems) {
    const matchedById = dbIdMap.get(local._id);
    const matchedByTitle = dbTitleMap.get(local.title.toLowerCase().trim());

    if (matchedById) {
      // Record exists with matching stable ID
      // Check for value discrepancies
      if (
        matchedById.price !== local.price ||
        matchedById.description !== local.description ||
        matchedById.category !== local.category
      ) {
        report.conflictsCount++;
        report.conflicts.push({
          id: local._id,
          nameOrTitle: local.title,
          reason: `Value mismatch (MongoDB price: "${matchedById.price}" vs Local: "${local.price}"). MongoDB preserved.`,
        });
      }
      continue;
    }

    if (matchedByTitle) {
      // Same entity title exists in DB under different ID
      if (matchedByTitle.price !== local.price || matchedByTitle.description !== local.description) {
        report.conflictsCount++;
        report.conflicts.push({
          id: local._id,
          nameOrTitle: local.title,
          reason: `Title exists in MongoDB with different values (MongoDB ID: ${matchedByTitle._id}). MongoDB preserved.`,
        });
      }
      continue;
    }

    // Local record does not exist in DB - candidate for migration
    report.candidatesCount++;

    if (!dryRun) {
      const payload: Partial<ServiceRecord> = {
        title: local.title,
        description: local.description,
        price: local.price,
        category: local.category,
        imageUrl: local.imageUrl || "/images/portfolio/bridal-pink-saree-gold-jewellery.jpg",
        features: local.features || [],
        tagline: local.tagline,
        ctaText: local.ctaText || "Book Now",
      };
      await Service.create(payload);
      report.insertedCount++;
    }
  }

  log(`[MIGRATION] Services: MongoDB=${report.mongoCount}, Local=${report.localCount}, Candidates=${report.candidatesCount}, Inserted=${report.insertedCount}, Conflicts=${report.conflictsCount}`);
  return report;
}

async function migrateGallery(dryRun: boolean, log: (...args: unknown[]) => void): Promise<EntityMigrationReport> {
  const localItems = getLocalGallery();
  const dbItems = await Gallery.find({ isDeleted: false }).lean();

  const report: EntityMigrationReport = {
    mongoCount: dbItems.length,
    localCount: localItems.length,
    candidatesCount: 0,
    insertedCount: 0,
    conflictsCount: 0,
    conflicts: [],
  };

  const dbIdMap = new Map(dbItems.map((item) => [String(item._id), item]));
  const dbUrlMap = new Map(dbItems.map((item) => [item.imageUrl.toLowerCase().trim(), item]));

  for (const local of localItems) {
    const matchedById = dbIdMap.get(local._id);
    const matchedByUrl = dbUrlMap.get(local.imageUrl.toLowerCase().trim());

    if (matchedById || matchedByUrl) {
      const matched = matchedById || matchedByUrl!;
      if (matched.category !== local.category || matched.altText !== local.altText) {
        report.conflictsCount++;
        report.conflicts.push({
          id: local._id,
          nameOrTitle: local.altText || local.imageUrl,
          reason: `Gallery metadata mismatch (MongoDB category: ${matched.category} vs Local: ${local.category}). MongoDB preserved.`,
        });
      }
      continue;
    }

    report.candidatesCount++;

    if (!dryRun) {
      await Gallery.create({
        imageUrl: local.imageUrl,
        altText: local.altText,
        category: local.category,
      });
      report.insertedCount++;
    }
  }

  log(`[MIGRATION] Gallery: MongoDB=${report.mongoCount}, Local=${report.localCount}, Candidates=${report.candidatesCount}, Inserted=${report.insertedCount}, Conflicts=${report.conflictsCount}`);
  return report;
}

async function migrateTestimonials(dryRun: boolean, log: (...args: unknown[]) => void): Promise<EntityMigrationReport> {
  const localItems = getLocalTestimonials(false);
  const dbItems = await Testimonial.find({ isDeleted: false }).lean();

  const report: EntityMigrationReport = {
    mongoCount: dbItems.length,
    localCount: localItems.length,
    candidatesCount: 0,
    insertedCount: 0,
    conflictsCount: 0,
    conflicts: [],
  };

  const dbIdMap = new Map(dbItems.map((item) => [String(item._id), item]));
  const dbCustomerMap = new Map(dbItems.map((item) => [item.customerName.toLowerCase().trim(), item]));

  for (const local of localItems) {
    const matchedById = dbIdMap.get(local._id);
    const matchedByName = dbCustomerMap.get(local.customerName.toLowerCase().trim());

    if (matchedById || matchedByName) {
      const matched = matchedById || matchedByName!;
      if (matched.rating !== local.rating || matched.review !== local.review) {
        report.conflictsCount++;
        report.conflicts.push({
          id: local._id,
          nameOrTitle: local.customerName,
          reason: `Review content mismatch. MongoDB record preserved.`,
        });
      }
      continue;
    }

    report.candidatesCount++;

    if (!dryRun) {
      await Testimonial.create({
        customerName: local.customerName,
        review: local.review,
        rating: local.rating,
        isFeatured: local.isFeatured ?? false,
      });
      report.insertedCount++;
    }
  }

  log(`[MIGRATION] Testimonials: MongoDB=${report.mongoCount}, Local=${report.localCount}, Candidates=${report.candidatesCount}, Inserted=${report.insertedCount}, Conflicts=${report.conflictsCount}`);
  return report;
}

async function migrateFaqs(dryRun: boolean, log: (...args: unknown[]) => void): Promise<EntityMigrationReport> {
  const localItems = getLocalFaqs();
  const dbItems = await FAQ.find({ isDeleted: false }).lean();

  const report: EntityMigrationReport = {
    mongoCount: dbItems.length,
    localCount: localItems.length,
    candidatesCount: 0,
    insertedCount: 0,
    conflictsCount: 0,
    conflicts: [],
  };

  const dbIdMap = new Map(dbItems.map((item) => [String(item._id), item]));
  const dbQuestionMap = new Map(dbItems.map((item) => [item.question.toLowerCase().trim(), item]));

  for (const local of localItems) {
    const matchedById = dbIdMap.get(local._id);
    const matchedByQ = dbQuestionMap.get(local.question.toLowerCase().trim());

    if (matchedById || matchedByQ) {
      const matched = matchedById || matchedByQ!;
      if (matched.answer !== local.answer) {
        report.conflictsCount++;
        report.conflicts.push({
          id: local._id,
          nameOrTitle: local.question,
          reason: `FAQ answer mismatch. MongoDB record preserved.`,
        });
      }
      continue;
    }

    report.candidatesCount++;

    if (!dryRun) {
      await FAQ.create({
        question: local.question,
        answer: local.answer,
        order: local.order ?? 0,
      });
      report.insertedCount++;
    }
  }

  log(`[MIGRATION] FAQs: MongoDB=${report.mongoCount}, Local=${report.localCount}, Candidates=${report.candidatesCount}, Inserted=${report.insertedCount}, Conflicts=${report.conflictsCount}`);
  return report;
}
