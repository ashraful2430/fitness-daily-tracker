import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/Users";
import { getCurrentUserId } from "@/lib/auth";

const STREAK_WINDOW_MS = 24 * 60 * 60 * 1000;

export async function GET() {
  try {
    await connectDB();

    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json(
        { success: false, data: null, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return NextResponse.json(
        { success: false, data: null, message: "User not found" },
        { status: 404 },
      );
    }

    const lastLoginDate = user.lastLoginDate ? new Date(user.lastLoginDate) : null;
    const effectiveCurrentStreak =
      lastLoginDate &&
      Date.now() - lastLoginDate.getTime() > STREAK_WINDOW_MS
        ? 0
        : (user.loginStreak ?? 0);

    return NextResponse.json({
      success: true,
      data: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        loginStreak: effectiveCurrentStreak,
        longestLoginStreak: user.longestLoginStreak ?? 0,
        lastLoginDate: user.lastLoginDate ?? null,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Unable to get user." },
      { status: 500 },
    );
  }
}
