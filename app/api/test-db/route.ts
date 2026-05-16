import type { NextRequest } from "next/server";
import { proxyToExternal } from "@/lib/proxy";

export async function GET(req: NextRequest) {
  return proxyToExternal(req, "/api/test-db");
}
