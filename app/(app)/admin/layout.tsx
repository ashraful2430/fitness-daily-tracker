import { redirect } from "next/navigation";
import { cookies } from "next/headers";

const EXTERNAL_API =
  process.env.EXTERNAL_API_URL ||
  "https://fitness-daily-tracker-backend-main.vercel.app";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/auth");
  }

  const response = await fetch(`${EXTERNAL_API}/api/auth/me`, {
    headers: {
      Cookie: `token=${token}`,
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  }).catch(() => null);

  if (!response?.ok) {
    redirect("/auth");
  }

  const body = (await response.json().catch(() => null)) as {
    data?: { role?: string };
    user?: { role?: string };
  } | null;

  const role = body?.data?.role ?? body?.user?.role;

  if (role !== "admin") {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
