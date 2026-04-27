import { CheckCircle2, Circle, Flame, Plus } from "lucide-react";

const habits = [
  { name: "Drink water", completed: true },
  { name: "Morning walk", completed: true },
  { name: "Read 10 pages", completed: false },
  { name: "Sleep before 11 PM", completed: false },
];

export default function HabitTracker() {
  return (
    <section id="habits" className="scroll-mt-8 px-6 lg:px-10">
      <div className="rounded-[2rem] bg-white p-6 shadow-xl shadow-slate-200/70">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-fuchsia-500">
              Habits
            </p>
            <h2 className="mt-2 text-3xl font-black">Daily Habit Tracker</h2>
          </div>

          <button className="flex items-center gap-2 rounded-2xl bg-fuchsia-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-fuchsia-200 transition hover:scale-105">
            <Plus size={18} />
            Add habit
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {habits.map((habit) => (
            <div
              key={habit.name}
              className="flex items-center justify-between rounded-3xl border border-slate-100 bg-slate-50 p-5"
            >
              <div className="flex items-center gap-4">
                {habit.completed ? (
                  <CheckCircle2 className="text-emerald-500" />
                ) : (
                  <Circle className="text-slate-300" />
                )}

                <p className="font-bold text-slate-700">{habit.name}</p>
              </div>

              <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-500">
                Today
              </span>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-3xl bg-gradient-to-br from-orange-500 to-pink-500 p-6 text-white">
          <div className="flex items-center gap-3">
            <Flame />
            <h3 className="text-xl font-black">Current Streak</h3>
          </div>

          <p className="mt-3 text-5xl font-black">14 days</p>
          <p className="mt-2 text-sm font-semibold text-white/80">
            Keep your habit chain alive.
          </p>
        </div>
      </div>
    </section>
  );
}
