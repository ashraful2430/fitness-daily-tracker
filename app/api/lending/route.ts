import type { NextRequest } from "next/server";
import { proxyToExternal } from "@/lib/proxy";

export async function GET(req: NextRequest) {
  return proxyToExternal(req, "/api/lending");
}

export async function POST(req: NextRequest) {
  return proxyToExternal(req, "/api/lending");
}
