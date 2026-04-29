import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { buildWeeklyStats } from "@/lib/dashboard";
import { connectDB } from "@/lib/mongodb";
import Workout from "@/models/Workout";

export async function GET() {
  try {
    await connectDB();

    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const workouts = await Workout.find({ userId }).sort({ createdAt: -1 }).lean();
    const data = buildWeeklyStats(workouts);

    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to load weekly stats" },
      { status: 500 },
    );
  }
}
