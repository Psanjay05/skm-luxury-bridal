import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/skm_luxury_bridal";

const AdminSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, default: "Admin" },
  },
  { timestamps: true }
);

const Admin = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);

async function seedAdmin() {
  try {
    console.log(`Connecting to MongoDB at: ${MONGODB_URI}`);
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB.");

    const existingAdmin = await Admin.findOne({ username: "admin" });
    if (existingAdmin) {
      console.log("Admin user already exists. Skipping seed.");
      process.exit(0);
    }

    console.log("Creating default admin user...");
    const hashedPassword = await bcrypt.hash("LuxuryBridal@2026", 12);

    const admin = new Admin({
      username: "admin",
      password: hashedPassword,
      name: "Maha Shree",
    });

    await admin.save();
    console.log("Admin user created successfully!");
    console.log("Username: admin");
    console.log("Password: LuxuryBridal@2026");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seedAdmin();
