import { redirect } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import { getCurrentUserId } from "@/lib/auth";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = await getCurrentUserId();

  if (!userId) {
    redirect("/auth");
  }

  return (
    <main className="min-h-screen bg-[#F7F7FB] text-slate-900 dark:bg-slate-950 dark:text-white">
      <div className="min-h-screen lg:flex">
        <Sidebar />
        <div className="flex-1">{children}</div>
      </div>
    </main>
  );
}
