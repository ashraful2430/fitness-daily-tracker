import type { NextRequest } from "next/server";
import { proxyToExternal } from "@/lib/proxy";

export async function POST(req: NextRequest) {
  const response = await proxyToExternal(req, "/api/auth/logout");

  response.cookies.set("token", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });

  return response;
}
