import fs from "fs";
import path from "path";
import {
  INITIAL_SERVICES,
  INITIAL_TESTIMONIALS,
  INITIAL_GALLERY_ITEMS,
  INITIAL_FAQS,
  INITIAL_BOOKINGS,
  INITIAL_MESSAGES,
} from "../src/lib/initial-data.ts";

const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

fs.writeFileSync(path.join(DATA_DIR, "services.json"), JSON.stringify(INITIAL_SERVICES, null, 2), "utf8");
console.log(`✓ Seeded ${INITIAL_SERVICES.length} services to data/services.json`);

fs.writeFileSync(path.join(DATA_DIR, "bookings.json"), JSON.stringify(INITIAL_BOOKINGS, null, 2), "utf8");
console.log(`✓ Seeded ${INITIAL_BOOKINGS.length} bookings to data/bookings.json`);

fs.writeFileSync(path.join(DATA_DIR, "messages.json"), JSON.stringify(INITIAL_MESSAGES, null, 2), "utf8");
console.log(`✓ Seeded ${INITIAL_MESSAGES.length} contact messages to data/messages.json`);

fs.writeFileSync(path.join(DATA_DIR, "testimonials.json"), JSON.stringify(INITIAL_TESTIMONIALS, null, 2), "utf8");
console.log(`✓ Seeded ${INITIAL_TESTIMONIALS.length} testimonials to data/testimonials.json`);

fs.writeFileSync(path.join(DATA_DIR, "gallery.json"), JSON.stringify(INITIAL_GALLERY_ITEMS, null, 2), "utf8");
console.log(`✓ Seeded ${INITIAL_GALLERY_ITEMS.length} gallery items to data/gallery.json`);

fs.writeFileSync(path.join(DATA_DIR, "faq.json"), JSON.stringify(INITIAL_FAQS, null, 2), "utf8");
console.log(`✓ Seeded ${INITIAL_FAQS.length} FAQs to data/faq.json`);

console.log("\n=== ALL DATA FILES SEEDED SUCCESSFULLY ===");
