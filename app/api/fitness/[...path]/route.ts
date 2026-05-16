import type { NextRequest } from "next/server";
import { proxyToExternal } from "@/lib/proxy";

async function handler(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  return proxyToExternal(req, `/api/fitness/${path.join("/")}`);
}

export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as PATCH,
  handler as DELETE,
};
