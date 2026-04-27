import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/Users";
import { getCurrentUserId } from "@/lib/auth";

export async function GET() {
  try {
    await connectDB();

    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const user = await User.findById(userId).select("-password");
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json(
      { message: "Unable to get user." },
      { status: 500 },
    );
  }
}
