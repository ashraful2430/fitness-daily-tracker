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
    headers["Authorization"] = `Bearer ${token}`;
  }

  const hasBody = req.method !== "GET" && req.method !== "HEAD";
  const body = hasBody ? await req.arrayBuffer() : undefined;

  const response = await fetch(url, {
    method: req.method,
    headers,
    body,
  }).catch((error) => {
    console.error("[proxyToExternal]", error);
    return null;
  });

  if (!response) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Backend connection failed. Check EXTERNAL_API_URL and make sure the fitness API is running.",
      },
      { status: 502 },
    );
  }

  const responseText = await response.text().catch(() => "");
  let data: unknown = null;

  if (responseText) {
    try {
      data = JSON.parse(responseText);
    } catch {
      data = {
        success: response.ok,
        message: response.ok ? "Operation successful" : responseText,
      };
    }
  }

  return NextResponse.json(data, { status: response.status });
}
