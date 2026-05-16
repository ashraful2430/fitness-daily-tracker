import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/Users";
import { createToken } from "@/lib/auth";

const LOGIN_TTL_SECONDS = 60 * 60 * 24;
const STREAK_WINDOW_MS = 24 * 60 * 60 * 1000;

export async function POST(req: Request) {
  try {
    await connectDB();

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required." },
        { status: 400 },
      );
    }

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid email or password." },
        { status: 401 },
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Invalid email or password." },
        { status: 401 },
      );
    }

    const now = new Date();
    const lastLoginDate = user.lastLoginDate ? new Date(user.lastLoginDate) : null;
    const currentStreak = Number(user.loginStreak ?? 0);
    const longestStreak = Number(user.longestLoginStreak ?? 0);

    let nextStreak = 1;

    if (lastLoginDate) {
      const elapsedMs = now.getTime() - lastLoginDate.getTime();
      const sameDay = now.toDateString() === lastLoginDate.toDateString();

      if (sameDay) {
        nextStreak = Math.max(currentStreak, 1);
      } else if (elapsedMs <= STREAK_WINDOW_MS) {
        nextStreak = Math.max(currentStreak + 1, 1);
      } else {
        // Missed the 24h login window: reset streak and start again from today.
        nextStreak = 1;
      }
    }

    user.loginStreak = nextStreak;
    user.longestLoginStreak = Math.max(longestStreak, nextStreak);
    user.lastLoginDate = now;
    await user.save();

    const token = createToken(user._id.toString());

    const response = NextResponse.json({
      success: true,
      message: "Login successful.",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        gender: user.gender ?? "",
        occupation: user.occupation ?? "",
        loginStreak: user.loginStreak ?? 0,
        longestLoginStreak: user.longestLoginStreak ?? 0,
        lastLoginDate: user.lastLoginDate ?? null,
      },
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
      maxAge: LOGIN_TTL_SECONDS,
    });

    return response;
  } catch (err) {
    console.error("[login]", err);
    return NextResponse.json(
      { success: false, message: "Login failed." },
      { status: 500 },
    );
  }
}
