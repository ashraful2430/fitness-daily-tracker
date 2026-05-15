import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const EXTERNAL_API =
  process.env.EXTERNAL_API_URL ||
  "https://fitness-daily-tracker-backend-main.vercel.app";

export async function proxyToExternal(
  req: NextRequest,
  path: string,
): Promise<NextResponse> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const url = `${EXTERNAL_API}${path}${req.nextUrl.search}`;
  const contentType = req.headers.get("content-type");

  const headers: Record<string, string> = {};

  if (contentType) {
    headers["Content-Type"] = contentType;
  }

  if (token) {
    headers["Cookie"] = `token=${token}`;
  }

  const hasBody = req.method !== "GET" && req.method !== "HEAD";
  const body = hasBody ? await req.arrayBuffer() : undefined;

  const response = await fetch(url, {
    method: req.method,
    headers,
    body,
  });

  const data = await response.json().catch(() => null);

  return NextResponse.json(data, { status: response.status });
}
