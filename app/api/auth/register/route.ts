import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/Users";
import { createToken } from "@/lib/auth";

const LOGIN_TTL_SECONDS = 60 * 60 * 24;

export async function POST(req: Request) {
  try {
    await connectDB();

    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Name, email, and password are required." },
        { status: 400 },
      );
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists." },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const now = new Date();
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      loginStreak: 1,
      longestLoginStreak: 1,
      lastLoginDate: now,
    });

    const token = createToken(user._id.toString());

    const response = NextResponse.json({
      success: true,
      message: "Account created successfully.",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
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
  } catch {
    return NextResponse.json(
      { success: false, message: "Registration failed." },
      { status: 500 },
    );
  }
}
