import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getCurrentUserId } from "@/lib/auth";
import Workout from "@/models/Workout";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();

    const userId = await getCurrentUserId();
    const { id } = await params;

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const workout = await Workout.findOneAndUpdate({ _id: id, userId }, body, {
      new: true,
    });

    return NextResponse.json({
      message: "Workout updated successfully",
      workout,
    });
  } catch {
    return NextResponse.json(
      { message: "Failed to update workout" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();

    const userId = await getCurrentUserId();
    const { id } = await params;

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await Workout.findOneAndDelete({ _id: id, userId });

    return NextResponse.json({
      message: "Workout deleted successfully",
    });
  } catch {
    return NextResponse.json(
      { message: "Failed to delete workout" },
      { status: 500 },
    );
  }
}
