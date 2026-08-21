import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import Admin from "@/models/Admin";
import bcrypt from "bcryptjs";
import { z } from "zod";

const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  username: z.string().min(3, "Username must be at least 3 characters").optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, "New password must be at least 6 characters").optional(),
});

// GET /api/admin/profile (Fetch current admin user info)
export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
      await connectToDatabase();
      const admin = await Admin.findOne({
        username: (session.user as any).username || "admin",
      }).select("-password");

      if (admin) {
        return NextResponse.json({
          success: true,
          data: {
            name: admin.name,
            username: admin.username,
            updatedAt: admin.updatedAt,
          },
        });
      }
    } catch (dbErr) {
      console.warn("[GET_ADMIN_PROFILE] DB offline, returning session info:", dbErr);
    }

    return NextResponse.json({
      success: true,
      data: {
        name: session.user.name || "Maha Shree",
        username: (session.user as any).username || "admin",
      },
    });
  } catch (err: any) {
    console.error("[GET_PROFILE_ERROR]", err);
    return NextResponse.json({ success: false, error: err.message || "Failed to fetch profile" }, { status: 500 });
  }
}

// PUT /api/admin/profile (Update username, name, or password)
export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = updateProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, username, currentPassword, newPassword } = parsed.data;
    const sessionUsername = (session.user as any).username || "admin";

    await connectToDatabase();
    let admin = await Admin.findOne({ username: sessionUsername });

    // If admin document doesn't exist in DB yet (e.g. initial dev login), create it
    if (!admin) {
      // SKM-006 FIX: Require an explicit newPassword; do NOT fall back to hardcoded secret
      if (!newPassword) {
        return NextResponse.json(
          { success: false, error: "Cannot initialize admin profile without a new password. Please provide a new password." },
          { status: 400 }
        );
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      admin = await Admin.create({
        username: username || sessionUsername,
        password: hashedPassword,
        name: name || session.user.name || "Maha Shree",
      });
      return NextResponse.json({
        success: true,
        message: "Admin profile initialized and updated successfully.",
        data: { name: admin.name, username: admin.username },
      });
    }

    // If changing password, verify current password
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { success: false, error: "Current password is required to set a new password." },
          { status: 400 }
        );
      }

      const isMatch = await bcrypt.compare(currentPassword, admin.password);
      if (!isMatch) {
        return NextResponse.json(
          { success: false, error: "Incorrect current password." },
          { status: 400 }
        );
      }

      admin.password = await bcrypt.hash(newPassword, 10);
    }

    if (name) admin.name = name;

    if (username && username !== admin.username) {
      const existing = await Admin.findOne({ username });
      if (existing && existing._id.toString() !== admin._id.toString()) {
        return NextResponse.json(
          { success: false, error: "Username is already taken by another account." },
          { status: 400 }
        );
      }
      admin.username = username;
    }

    await admin.save();

    return NextResponse.json({
      success: true,
      message: "Admin profile and credentials updated successfully!",
      data: {
        name: admin.name,
        username: admin.username,
      },
    });
  } catch (err: any) {
    console.error("[UPDATE_PROFILE_ERROR]", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update profile." },
      { status: 500 }
    );
  }
}
