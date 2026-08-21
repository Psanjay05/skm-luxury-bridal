import fs from "fs";
import path from "path";
import {
  INITIAL_SERVICES,
  INITIAL_TESTIMONIALS,
  INITIAL_GALLERY_ITEMS,
  INITIAL_FAQS,
  INITIAL_BOOKINGS,
  INITIAL_MESSAGES,
} from "@/lib/initial-data";

const DATA_DIR = path.join(process.cwd(), "data");

function ensureDirectoryExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readJsonFile<T>(filename: string, defaultData: T): T {
  ensureDirectoryExists();
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    try {
      fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2), "utf8");
    } catch (e) {
      console.warn(`[LOCAL_STORE] Failed to write initial ${filename}:`, e);
    }
    return defaultData;
  }
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch (e) {
    console.error(`[LOCAL_STORE] Failed to read ${filename}, returning default:`, e);
    return defaultData;
  }
}

function writeJsonFile<T>(filename: string, data: T): void {
  ensureDirectoryExists();
  const filePath = path.join(DATA_DIR, filename);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
  } catch (e) {
    console.error(`[LOCAL_STORE] Failed to write ${filename}:`, e);
  }
}

function generateId(): string {
  const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, "0");
  const random = Array.from({ length: 16 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join("");
  return `${timestamp}${random}`;
}

// ---------------- SERVICES ----------------

export interface ServiceRecord {
  _id: string;
  title: string;
  price: string;
  tagline?: string;
  description: string;
  imageUrl: string;
  iconUrl?: string;
  category: string;
  ctaText?: string;
  features?: string[];
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export function getLocalServices(category?: string): ServiceRecord[] {
  const all = readJsonFile<ServiceRecord[]>("services.json", INITIAL_SERVICES as ServiceRecord[]);
  const nonDeleted = all.filter((s) => !s.isDeleted);
  if (category && category !== "all") {
    return nonDeleted.filter((s) => s.category === category);
  }
  return nonDeleted;
}

export function getLocalServiceById(id: string): ServiceRecord | null {
  const all = readJsonFile<ServiceRecord[]>("services.json", INITIAL_SERVICES as ServiceRecord[]);
  return all.find((s) => s._id === id && !s.isDeleted) || null;
}

export function saveLocalService(data: Omit<ServiceRecord, "_id">): ServiceRecord {
  const all = readJsonFile<ServiceRecord[]>("services.json", INITIAL_SERVICES as ServiceRecord[]);
  const now = new Date().toISOString();
  const newService: ServiceRecord = {
    ...data,
    _id: generateId(),
    isDeleted: false,
    createdAt: now,
    updatedAt: now,
  };
  all.unshift(newService);
  writeJsonFile("services.json", all);
  return newService;
}

export function updateLocalService(id: string, data: Partial<ServiceRecord>): ServiceRecord | null {
  const all = readJsonFile<ServiceRecord[]>("services.json", INITIAL_SERVICES as ServiceRecord[]);
  const index = all.findIndex((s) => s._id === id);
  const now = new Date().toISOString();

  // BUG 2 FIX: Always coerce price to string to prevent accidental numeric storage
  const safeData = data.price !== undefined ? { ...data, price: String(data.price).trim() } : data;

  if (index !== -1) {
    all[index] = {
      ...all[index],
      ...safeData,
      _id: id,
      updatedAt: now,
    };
    writeJsonFile("services.json", all);
    return all[index];
  }

  const initial = INITIAL_SERVICES.find((s) => s._id === id);
  if (initial) {
    const created: ServiceRecord = {
      ...initial,
      ...data,
      _id: id,
      updatedAt: now,
      createdAt: now,
    };
    all.unshift(created);
    writeJsonFile("services.json", all);
    return created;
  }

  const fallbackRecord: ServiceRecord = {
    title: (data.title as string) || "Custom Service",
    price: (data.price as string) || "From ₹9,999",
    description: (data.description as string) || "Bridal service package",
    imageUrl: (data.imageUrl as string) || "/images/portfolio/bridal-pink-saree-gold-jewellery.jpg",
    category: (data.category as string) || "makeup",
    ...data,
    _id: id,
    updatedAt: now,
    createdAt: now,
  };
  all.unshift(fallbackRecord);
  writeJsonFile("services.json", all);
  return fallbackRecord;
}

export function deleteLocalService(id: string): boolean {
  const all = readJsonFile<ServiceRecord[]>("services.json", INITIAL_SERVICES as ServiceRecord[]);
  const index = all.findIndex((s) => s._id === id);
  if (index !== -1) {
    all[index].isDeleted = true;
    all[index].updatedAt = new Date().toISOString();
    writeJsonFile("services.json", all);
    return true;
  }
  return false;
}

// ---------------- TESTIMONIALS ----------------

export interface TestimonialRecord {
  _id: string;
  customerName: string;
  review: string;
  rating: number;
  isFeatured?: boolean;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export function getLocalTestimonials(featuredOnly?: boolean): TestimonialRecord[] {
  const all = readJsonFile<TestimonialRecord[]>("testimonials.json", INITIAL_TESTIMONIALS as TestimonialRecord[]);
  const nonDeleted = all.filter((t) => !t.isDeleted);
  if (featuredOnly) {
    return nonDeleted.filter((t) => t.isFeatured);
  }
  return nonDeleted;
}

export function saveLocalTestimonial(data: Omit<TestimonialRecord, "_id">): TestimonialRecord {
  const all = readJsonFile<TestimonialRecord[]>("testimonials.json", INITIAL_TESTIMONIALS as TestimonialRecord[]);
  const now = new Date().toISOString();
  const record: TestimonialRecord = {
    ...data,
    _id: generateId(),
    isDeleted: false,
    createdAt: now,
    updatedAt: now,
  };
  all.unshift(record);
  writeJsonFile("testimonials.json", all);
  return record;
}

export function updateLocalTestimonial(id: string, data: Partial<TestimonialRecord>): TestimonialRecord | null {
  const all = readJsonFile<TestimonialRecord[]>("testimonials.json", INITIAL_TESTIMONIALS as TestimonialRecord[]);
  const index = all.findIndex((t) => t._id === id);
  const now = new Date().toISOString();

  if (index !== -1) {
    all[index] = { ...all[index], ...data, _id: id, updatedAt: now };
    writeJsonFile("testimonials.json", all);
    return all[index];
  }

  const initial = INITIAL_TESTIMONIALS.find((t) => t._id === id);
  if (initial) {
    const created: TestimonialRecord = { ...initial, ...data, _id: id, updatedAt: now, createdAt: now };
    all.unshift(created);
    writeJsonFile("testimonials.json", all);
    return created;
  }

  return null;
}

export function deleteLocalTestimonial(id: string): boolean {
  const all = readJsonFile<TestimonialRecord[]>("testimonials.json", INITIAL_TESTIMONIALS as TestimonialRecord[]);
  const index = all.findIndex((t) => t._id === id);
  if (index !== -1) {
    all[index].isDeleted = true;
    all[index].updatedAt = new Date().toISOString();
    writeJsonFile("testimonials.json", all);
    return true;
  }
  return false;
}

// ---------------- GALLERY ----------------

export interface GalleryRecord {
  _id: string;
  imageUrl: string;
  altText: string;
  category: string;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export function getLocalGallery(category?: string): GalleryRecord[] {
  const all = readJsonFile<GalleryRecord[]>("gallery.json", INITIAL_GALLERY_ITEMS as GalleryRecord[]);
  const nonDeleted = all.filter((g) => !g.isDeleted);
  if (category && category !== "all") {
    return nonDeleted.filter((g) => g.category === category);
  }
  return nonDeleted;
}

export function saveLocalGallery(data: Omit<GalleryRecord, "_id">): GalleryRecord {
  const all = readJsonFile<GalleryRecord[]>("gallery.json", INITIAL_GALLERY_ITEMS as GalleryRecord[]);
  const now = new Date().toISOString();
  const record: GalleryRecord = {
    ...data,
    _id: generateId(),
    isDeleted: false,
    createdAt: now,
    updatedAt: now,
  };
  all.unshift(record);
  writeJsonFile("gallery.json", all);
  return record;
}

export function updateLocalGallery(id: string, data: Partial<GalleryRecord>): GalleryRecord | null {
  const all = readJsonFile<GalleryRecord[]>("gallery.json", INITIAL_GALLERY_ITEMS as GalleryRecord[]);
  const index = all.findIndex((g) => g._id === id);
  const now = new Date().toISOString();

  if (index !== -1) {
    all[index] = { ...all[index], ...data, _id: id, updatedAt: now };
    writeJsonFile("gallery.json", all);
    return all[index];
  }

  const initial = INITIAL_GALLERY_ITEMS.find((g) => g._id === id);
  if (initial) {
    const created: GalleryRecord = { ...initial, ...data, _id: id, updatedAt: now, createdAt: now };
    all.unshift(created);
    writeJsonFile("gallery.json", all);
    return created;
  }

  return null;
}

export function deleteLocalGallery(id: string): boolean {
  const all = readJsonFile<GalleryRecord[]>("gallery.json", INITIAL_GALLERY_ITEMS as GalleryRecord[]);
  const index = all.findIndex((g) => g._id === id);
  if (index !== -1) {
    all[index].isDeleted = true;
    all[index].updatedAt = new Date().toISOString();
    writeJsonFile("gallery.json", all);
    return true;
  }
  return false;
}

// ---------------- FAQS ----------------

export interface FAQRecord {
  _id: string;
  question: string;
  answer: string;
  order: number;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const DEFAULT_FAQS: FAQRecord[] = INITIAL_FAQS as FAQRecord[];

export function getLocalFaqs(): FAQRecord[] {
  const all = readJsonFile<FAQRecord[]>("faq.json", DEFAULT_FAQS);
  return all.filter((f) => !f.isDeleted).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function saveLocalFaq(data: Omit<FAQRecord, "_id">): FAQRecord {
  const all = readJsonFile<FAQRecord[]>("faq.json", DEFAULT_FAQS);
  const now = new Date().toISOString();
  const record: FAQRecord = {
    ...data,
    _id: generateId(),
    isDeleted: false,
    createdAt: now,
    updatedAt: now,
  };
  all.push(record);
  writeJsonFile("faq.json", all);
  return record;
}

export function updateLocalFaq(id: string, data: Partial<FAQRecord>): FAQRecord | null {
  const all = readJsonFile<FAQRecord[]>("faq.json", DEFAULT_FAQS);
  const index = all.findIndex((f) => f._id === id);
  const now = new Date().toISOString();

  if (index !== -1) {
    all[index] = { ...all[index], ...data, _id: id, updatedAt: now };
    writeJsonFile("faq.json", all);
    return all[index];
  }

  const initial = DEFAULT_FAQS.find((f) => f._id === id);
  if (initial) {
    const created: FAQRecord = { ...initial, ...data, _id: id, updatedAt: now, createdAt: now };
    all.push(created);
    writeJsonFile("faq.json", all);
    return created;
  }

  return null;
}

export function deleteLocalFaq(id: string): boolean {
  const all = readJsonFile<FAQRecord[]>("faq.json", DEFAULT_FAQS);
  const index = all.findIndex((f) => f._id === id);
  if (index !== -1) {
    all[index].isDeleted = true;
    all[index].updatedAt = new Date().toISOString();
    writeJsonFile("faq.json", all);
    return true;
  }
  return false;
}

// ---------------- BOOKINGS ----------------

export interface BookingRecord {
  _id: string;
  bookingReference: string;
  customerName: string;
  email?: string;
  phone: string;
  service: string;
  preferredDate: string;
  preferredTime: string;
  location: string;
  message?: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export function getLocalBookings(): BookingRecord[] {
  const all = readJsonFile<BookingRecord[]>("bookings.json", INITIAL_BOOKINGS as BookingRecord[]);
  return all.filter((b) => !b.isDeleted);
}

export function saveLocalBooking(data: Omit<BookingRecord, "_id">): BookingRecord {
  const all = readJsonFile<BookingRecord[]>("bookings.json", INITIAL_BOOKINGS as BookingRecord[]);
  const now = new Date().toISOString();
  const record: BookingRecord = {
    ...data,
    _id: generateId(),
    isDeleted: false,
    createdAt: now,
    updatedAt: now,
  };
  all.unshift(record);
  writeJsonFile("bookings.json", all);
  return record;
}

export function updateLocalBooking(id: string, data: Partial<BookingRecord>): BookingRecord | null {
  const all = readJsonFile<BookingRecord[]>("bookings.json", INITIAL_BOOKINGS as BookingRecord[]);
  const index = all.findIndex((b) => b._id === id || b.bookingReference === id);
  const now = new Date().toISOString();

  if (index !== -1) {
    all[index] = { ...all[index], ...data, updatedAt: now };
    writeJsonFile("bookings.json", all);
    return all[index];
  }
  return null;
}

// ---------------- CONTACT MESSAGES ----------------

export interface MessageRecord {
  _id: string;
  name: string;
  email?: string;
  phone: string;
  message: string;
  status: "unread" | "read";
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export function getLocalMessages(): MessageRecord[] {
  const all = readJsonFile<MessageRecord[]>("messages.json", INITIAL_MESSAGES as MessageRecord[]);
  return all.filter((m) => !m.isDeleted);
}

export function saveLocalMessage(data: Omit<MessageRecord, "_id">): MessageRecord {
  const all = readJsonFile<MessageRecord[]>("messages.json", INITIAL_MESSAGES as MessageRecord[]);
  const now = new Date().toISOString();
  const record: MessageRecord = {
    ...data,
    _id: generateId(),
    isDeleted: false,
    createdAt: now,
    updatedAt: now,
  };
  all.unshift(record);
  writeJsonFile("messages.json", all);
  return record;
}

export function updateLocalMessage(id: string, data: Partial<MessageRecord>): MessageRecord | null {
  const all = readJsonFile<MessageRecord[]>("messages.json", INITIAL_MESSAGES as MessageRecord[]);
  const index = all.findIndex((m) => m._id === id);
  const now = new Date().toISOString();

  if (index !== -1) {
    all[index] = { ...all[index], ...data, updatedAt: now };
    writeJsonFile("messages.json", all);
    return all[index];
  }
  return null;
}
