import { redirect } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import PomodoroTimer from "@/components/pomodoro/PomodoroTimer";
import { getCurrentUserId } from "@/lib/auth";

export default async function FocusPage() {
  const userId = await getCurrentUserId();

  if (!userId) redirect("/auth");

  return (
    <main className="min-h-screen bg-[#F7F7FB] text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 py-10">
          <PomodoroTimer />
        </div>
      </div>
    </main>
  );
}
