import Sidebar from "@/components/layout/Sidebar";
import PomodoroTimer from "@/components/pomodoro/PomodoroTimer";

export default function FocusPage() {
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
