import type { NextRequest } from "next/server";
import { proxyToExternal } from "@/lib/proxy";

export async function GET(req: NextRequest) {
  return proxyToExternal(req, "/api/score-sections");
}

export async function POST(req: NextRequest) {
  return proxyToExternal(req, "/api/score-sections");
}

export async function PATCH(req: NextRequest) {
  return proxyToExternal(req, "/api/score-sections");
}

export async function DELETE(req: NextRequest) {
  return proxyToExternal(req, "/api/score-sections");
}
