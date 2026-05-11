import type { NextRequest } from "next/server";
import { proxyToExternal } from "@/lib/proxy";

async function handler(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  return proxyToExternal(req, `/api/lending/${path.join("/")}`);
}

export { handler as PATCH, handler as DELETE };
