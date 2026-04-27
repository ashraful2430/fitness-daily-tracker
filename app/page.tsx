import Sidebar from "@/components/layout/Sidebar";
import Dashboard from "@/components/dashboard/Dashboard";
import FitnessTracker from "@/components/fitness/FitnessTracker";
import HabitTracker from "@/components/habits/Habits";
import PomodoroTimer from "@/components/pomodoro/PomodoroTimer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F7F7FB] text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar />

        <div className="flex-1 space-y-10">
          <Dashboard />
          <FitnessTracker />
          <HabitTracker />
          <PomodoroTimer />
        </div>
      </div>
    </main>
  );
}
