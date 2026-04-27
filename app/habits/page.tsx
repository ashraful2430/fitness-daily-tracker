import Sidebar from "@/components/layout/Sidebar";
import HabitTracker from "@/components/habits/Habits";

export default function HabitsPage() {
  return (
    <main className="min-h-screen bg-[#F7F7FB] text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 py-10">
          <HabitTracker />
        </div>
      </div>
    </main>
  );
}
