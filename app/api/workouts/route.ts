import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getCurrentUserId } from "@/lib/auth";
import Workout from "@/models/Workout";

export async function GET() {
  try {
    await connectDB();

    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const workouts = await Workout.find({ userId }).sort({ createdAt: -1 });

    return NextResponse.json({ workouts });
  } catch {
    return NextResponse.json(
      { message: "Failed to fetch workouts" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();

    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { title, duration, type, calories } = await req.json();

    if (!title || !duration) {
      return NextResponse.json(
        { message: "Title and duration are required" },
        { status: 400 },
      );
    }

    const workout = await Workout.create({
      userId,
      title,
      duration,
      type,
      calories,
    });

    return NextResponse.json(
      { message: "Workout added successfully", workout },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { message: "Failed to create workout" },
      { status: 500 },
    );
  }
}
