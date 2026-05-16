import { type NextRequest, NextResponse } from "next/server";

const EXTERNAL_API = (
  process.env.EXTERNAL_API_URL || "http://127.0.0.1:5000"
).replace(/\/$/, "");

export async function proxyToExternal(
  req: NextRequest,
  path: string,
): Promise<NextResponse> {
  const url = `${EXTERNAL_API}${path}${req.nextUrl.search}`;
  const contentType = req.headers.get("content-type");
  const cookie = req.headers.get("cookie");
  const authorization = req.headers.get("authorization");

  const headers: Record<string, string> = {};

  if (contentType) {
    headers["Content-Type"] = contentType;
  }

  if (cookie) {
    headers["Cookie"] = cookie;
  }

  if (authorization) {
    headers["Authorization"] = authorization;
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

  const proxiedResponse = NextResponse.json(data, { status: response.status });
  const getSetCookie = (
    response.headers as Headers & { getSetCookie?: () => string[] }
  ).getSetCookie;
  const setCookieHeaders = getSetCookie?.call(response.headers) ?? [];
  const singleSetCookie = response.headers.get("set-cookie");

  for (const cookie of setCookieHeaders.length
    ? setCookieHeaders
    : singleSetCookie
      ? [singleSetCookie]
      : []) {
    proxiedResponse.headers.append("Set-Cookie", cookie);
  }

  return proxiedResponse;
}
