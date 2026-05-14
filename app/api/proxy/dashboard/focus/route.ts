import type { NextRequest } from "next/server";
import { proxyToExternal } from "@/lib/proxy";

export async function POST(req: NextRequest) {
  return proxyToExternal(req, "/api/dashboard/focus");
}
