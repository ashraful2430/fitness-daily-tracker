import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getCurrentUserId } from "@/lib/auth";
import AlarmSound from "@/models/AlarmSound";
import User from "@/models/Users";

const MAX_AUDIO_BYTES = 1_500_000;

function serializeSound(sound: {
  _id: { toString: () => string };
  label: string;
  dataUrl: string;
  mimeType: string;
  size: number;
  createdAt?: Date;
}) {
  return {
    id: sound._id.toString(),
    label: sound.label,
    dataUrl: sound.dataUrl,
    mimeType: sound.mimeType,
    size: sound.size,
    createdAt: sound.createdAt?.toISOString?.() ?? null,
  };
}

async function getCurrentUser() {
  const userId = await getCurrentUserId();
  if (!userId) return null;
  return User.findById(userId).select("role");
}

export async function GET() {
  try {
    await connectDB();
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized", data: [] },
        { status: 401 },
      );
    }

    const sounds = await AlarmSound.find()
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    return NextResponse.json({
      success: true,
      data: sounds.map(serializeSound),
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to load alarm sounds", data: [] },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    if (user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Admin access only" },
        { status: 403 },
      );
    }

    const body = (await req.json().catch(() => null)) as {
      label?: string;
      dataUrl?: string;
      mimeType?: string;
      size?: number;
    } | null;

    const label = body?.label?.trim();
    const dataUrl = body?.dataUrl;
    const mimeType = body?.mimeType;
    const size = Number(body?.size ?? 0);

    if (!label || !dataUrl || !mimeType?.startsWith("audio/")) {
      return NextResponse.json(
        { success: false, message: "A valid audio file is required." },
        { status: 400 },
      );
    }

    if (!Number.isFinite(size) || size <= 0 || size > MAX_AUDIO_BYTES) {
      return NextResponse.json(
        { success: false, message: "Audio file must be under 1.5 MB." },
        { status: 400 },
      );
    }

    const sound = await AlarmSound.create({
      label: label.slice(0, 80),
      dataUrl,
      mimeType,
      size,
      createdBy: user._id,
    });

    return NextResponse.json({
      success: true,
      message: "Alarm sound added.",
      data: serializeSound(sound),
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to save alarm sound" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  try {
    await connectDB();
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    if (user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Admin access only" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Alarm sound id is required." },
        { status: 400 },
      );
    }

    await AlarmSound.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Alarm sound removed.",
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to remove alarm sound" },
      { status: 500 },
    );
  }
}
