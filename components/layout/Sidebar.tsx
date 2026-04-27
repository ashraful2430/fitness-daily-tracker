import { Activity, BarChart3, Dumbbell, Flame, Timer } from "lucide-react";

const menuItems = [
  { label: "Dashboard", icon: BarChart3 },
  { label: "Fitness", icon: Dumbbell },
  { label: "Habits", icon: Flame },
  { label: "Pomodoro", icon: Timer },
];

export default function Sidebar() {
  return (
    <aside className="hidden w-72 border-r border-slate-200 bg-white p-6 lg:block">
      <div className="mb-10 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white">
          <Activity size={22} />
        </div>

        <div>
          <h1 className="text-xl font-bold">FitTrack</h1>
          <p className="text-sm text-slate-500">Daily productivity system</p>
        </div>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item, index) => {
          const Icon = item.icon;

          return (
            <button
              key={item.label}
              className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                index === 0
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
