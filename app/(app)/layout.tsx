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
    <main className="relative min-h-screen overflow-hidden bg-[#f3ede1] text-slate-900 dark:bg-[#070912] dark:text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-[360px] bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_42%),radial-gradient(circle_at_12%_18%,rgba(245,158,11,0.12),transparent_24%),radial-gradient(circle_at_88%_14%,rgba(168,85,247,0.16),transparent_22%)] dark:bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.12),transparent_40%),radial-gradient(circle_at_12%_18%,rgba(245,158,11,0.08),transparent_24%),radial-gradient(circle_at_88%_14%,rgba(168,85,247,0.12),transparent_22%)]" />
        <div className="absolute left-[18%] top-[16%] h-72 w-72 rounded-full bg-cyan-400/10 blur-[120px] dark:bg-cyan-500/10" />
        <div className="absolute bottom-[12%] right-[8%] h-80 w-80 rounded-full bg-violet-500/10 blur-[140px] dark:bg-violet-500/10" />
        <div className="absolute inset-y-0 left-[20%] w-px bg-gradient-to-b from-transparent via-white/25 to-transparent dark:via-white/[0.05]" />
      </div>

      <div className="relative z-10 min-h-screen lg:flex">
        <Sidebar />
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-x-4 top-4 hidden h-px bg-gradient-to-r from-transparent via-slate-400/30 to-transparent dark:via-white/10 lg:block" />
          {children}
        </div>
      </div>
    </main>
  );
}
