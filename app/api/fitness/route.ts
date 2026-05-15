import type { NextRequest } from "next/server";
import { proxyToExternal } from "@/lib/proxy";

export function GET(req: NextRequest) {
  return proxyToExternal(req, "/api/fitness");
}
