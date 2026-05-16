import type { NextRequest } from "next/server";
import { proxyToExternal } from "@/lib/proxy";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return proxyToExternal(req, `/api/workouts/${id}`);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return proxyToExternal(req, `/api/workouts/${id}`);
}
