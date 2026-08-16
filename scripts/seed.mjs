import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/skm_luxury_bridal";

// Schemas
const AdminSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, default: "Admin" },
  },
  { timestamps: true }
);

const ServiceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    iconUrl: { type: String },
    ctaText: { type: String, default: "Book Now" },
    category: { type: String, default: "makeup" },
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

const Admin = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);
const Service = mongoose.models.Service || mongoose.model("Service", ServiceSchema);
const Gallery = mongoose.models.Gallery || mongoose.model("Gallery", GallerySchema);
const FAQ = mongoose.models.FAQ || mongoose.model("FAQ", FAQSchema);
const Testimonial = mongoose.models.Testimonial || mongoose.model("Testimonial", TestimonialSchema);

const INITIAL_SERVICES = [
  {
    title: "Royal HD Bridal Makeover",
    description: "Flawless sweat-proof high-definition base makeup, false lash application, custom lip artistry, and saree draping for Muhurtham.",
    imageUrl: "/images/portfolio/bridal-pink-saree-gold-jewellery.jpg",
    category: "makeup",
    ctaText: "Book Royal Package",
  },
  {
    title: "Airbrush Luxury Bridal Package",
    description: "Ultra long-lasting 18+ hour waterproof airbrush makeup finish, premium temple hair ornament styling, and jewelry draping.",
    imageUrl: "/images/portfolio/before-after-hd-makeover.jpg",
    category: "makeup",
    ctaText: "Book Airbrush Package",
  },
  {
    title: "Reception & Engagement Glam",
    description: "Soft glam HD finish, customized hairstyle, modern drape pleating, and accessory placement for reception functions.",
    imageUrl: "/images/portfolio/bridal-close-up-portrait.jpg",
    category: "makeup",
    ctaText: "Book Reception Look",
  },
  {
    title: "Saree Pre-Pleating & Box Folding",
    description: "Professional saree pre-pleating, iron pressing, and box folding for silk sarees for hassle-free drape on wedding day.",
    imageUrl: "/images/portfolio/full-bridal-pose-silk-saree.jpg",
    category: "saree",
    ctaText: "Book Saree Draping",
  },
  {
    title: "Temple & Antique Jewellery Rental",
    description: "Premium gold-plated temple necklaces, waist belts (ottiyanam), maang tikka, and bangles for bridal functions.",
    imageUrl: "/images/portfolio/traditional-south-indian-bride.jpg",
    category: "jewellery",
    ctaText: "Explore Rental Sets",
  },
];

const INITIAL_GALLERY = [
  {
    imageUrl: "/images/portfolio/before-after-hd-makeover.jpg",
    altText: "HD Bridal Makeover Transformation by Maha Shree",
    category: "Before & After",
  },
  {
    imageUrl: "/images/portfolio/traditional-south-indian-bride.jpg",
    altText: "Outdoor Traditional South Indian Bride Look",
    category: "Bridal",
  },
  {
    imageUrl: "/images/portfolio/bridal-pink-saree-gold-jewellery.jpg",
    altText: "Royal Pink Silk Bridal Makeup & Antique Gold",
    category: "Bridal",
  },
  {
    imageUrl: "/images/portfolio/full-bridal-pose-silk-saree.jpg",
    altText: "Pre-Pleated Silk Saree & Temple Belt Pose",
    category: "Bridal",
  },
  {
    imageUrl: "/images/portfolio/bridal-close-up-portrait.jpg",
    altText: "Glowing HD Bridal Portrait by Maha Shree",
    category: "Jewellery",
  },
];

const INITIAL_FAQS = [
  {
    question: "How far in advance should I book my bridal makeover?",
    answer: "We recommend booking 3 to 6 months prior to your wedding date to secure your date, especially during peak marriage seasons in Tamil Nadu.",
    order: 1,
  },
  {
    question: "Do you travel to venues outside Salem?",
    answer: "Yes! Lead artist Maha Shree and our senior styling team travel across Tamil Nadu, Bangalore, and South India for outstation weddings.",
    order: 2,
  },
  {
    question: "Is a trial makeup session included or available?",
    answer: "Yes, bridal trial sessions can be scheduled at our Salem studio to customize HD foundation shade match, eye artistry, and drape pleating.",
    order: 3,
  },
  {
    question: "What is the difference between HD and Airbrush Bridal Makeup?",
    answer: "HD Makeup uses ultra-fine pigments for high-definition camera clarity and natural finish. Airbrush uses a specialized air compressor for 18+ hour waterproof finish, ideal for heavy stage lighting.",
    order: 4,
  },
];

const INITIAL_TESTIMONIALS = [
  {
    customerName: "Priya & Karthik",
    review: "Maha Shree ma'am created the absolute bridal look of my dreams! The HD makeup lasted all day through heat and tears without cracking or getting shiny.",
    rating: 5,
    isFeatured: true,
  },
  {
    customerName: "Ananya R.",
    review: "The saree draping precision and hair styling for my Muhurtham were flawless. Every relative complimented my look. SKM is the best in Salem!",
    rating: 5,
    isFeatured: true,
  },
  {
    customerName: "Deepika S.",
    review: "I took the Royal Airbrush Bridal Package. Truly felt like royalty on my reception night! Highly recommend Maha Shree for all brides.",
    rating: 5,
    isFeatured: true,
  },
];

async function seedDatabase() {
  try {
    console.log(`Connecting to MongoDB at: ${MONGODB_URI}`);
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB.");

    // Seed Admin
    const adminUser = process.env.ADMIN_USERNAME || "admin";
    const adminPass = process.env.ADMIN_PASSWORD || process.env.ADMIN_DEFAULT_PASSWORD || "LuxuryBridal@2026";
    const existingAdmin = await Admin.findOne({ username: adminUser });
    if (!existingAdmin) {
      console.log(`Creating default admin user (${adminUser})...`);
      const hashedPassword = await bcrypt.hash(adminPass, 12);
      await Admin.create({
        username: adminUser,
        password: hashedPassword,
        name: "Maha Shree",
      });
      console.log(`Admin user created (Username: ${adminUser})`);
    } else {
      console.log("Admin user exists.");
    }

    // Seed Services
    const serviceCount = await Service.countDocuments({ isDeleted: false });
    if (serviceCount === 0) {
      console.log("Seeding services catalog...");
      await Service.insertMany(INITIAL_SERVICES);
      console.log("Services seeded.");
    }

    // Seed Gallery
    const galleryCount = await Gallery.countDocuments({ isDeleted: false });
    if (galleryCount === 0) {
      console.log("Seeding gallery portfolio...");
      await Gallery.insertMany(INITIAL_GALLERY);
      console.log("Gallery seeded.");
    }

    // Seed FAQs
    const faqCount = await FAQ.countDocuments({ isDeleted: false });
    if (faqCount === 0) {
      console.log("Seeding FAQ items...");
      await FAQ.insertMany(INITIAL_FAQS);
      console.log("FAQs seeded.");
    }

    // Seed Testimonials
    const testimonialCount = await Testimonial.countDocuments({ isDeleted: false });
    if (testimonialCount === 0) {
      console.log("Seeding client testimonials...");
      await Testimonial.insertMany(INITIAL_TESTIMONIALS);
      console.log("Testimonials seeded.");
    }

    console.log("✅ Database seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
