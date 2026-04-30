import { CheckCircle2, Circle, Flame, Plus, Sparkles } from "lucide-react";

const habits = [
  { name: "Drink water", completed: true },
  { name: "Morning walk", completed: true },
  { name: "Read 10 pages", completed: false },
  { name: "Sleep before 11 PM", completed: false },
];

export default function HabitTracker() {
  const completedCount = habits.filter((habit) => habit.completed).length;

  return (
    <section id="habits" className="scroll-mt-8 px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
      <div className="relative overflow-hidden rounded-[2.2rem] border border-slate-200 bg-white/85 p-6 shadow-[0_30px_90px_rgba(148,163,184,0.16)] backdrop-blur-xl dark:border-white/[0.08] dark:bg-[#111321]/88 dark:shadow-[0_30px_90px_rgba(0,0,0,0.3)] md:p-8">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-fuchsia-400/40 to-transparent" />
        <div className="absolute -right-20 top-0 h-64 w-64 rounded-full bg-fuchsia-500/12 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-56 w-56 rounded-full bg-orange-400/10 blur-3xl" />

        <div className="relative z-10 grid gap-5 xl:grid-cols-[0.94fr_1.06fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-[linear-gradient(135deg,rgba(76,29,149,0.96),rgba(190,24,93,0.82))] p-6 text-white shadow-[0_30px_90px_rgba(76,29,149,0.24)] dark:border-white/[0.08]">
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-fuchsia-100/85">
              Habit Engine
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.03em] sm:text-4xl">
              Build steadier routines with less friction.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-fuchsia-50/80 sm:text-base">
              Keep your daily rituals visible, celebrate the small wins, and make
              consistency feel rewarding instead of repetitive.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                { label: "Completed", value: `${completedCount}/${habits.length}` },
                { label: "Consistency", value: `${Math.round((completedCount / habits.length) * 100)}%` },
                { label: "Current Streak", value: "14 days" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-[1.4rem] border border-white/10 bg-white/10 p-4 backdrop-blur"
                >
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/65">
                    {item.label}
                  </p>
                  <p className="mt-2 text-2xl font-black">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-slate-50/80 p-5 dark:border-white/[0.08] dark:bg-white/[0.04]">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-fuchsia-600 dark:text-fuchsia-300">
                  Daily Rituals
                </p>
                <h3 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
                  Habit board
                </h3>
              </div>

              <button className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-rose-500 px-5 py-3 text-sm font-black text-white shadow-[0_18px_45px_rgba(190,24,93,0.22)] transition hover:scale-[1.01]">
                <Plus size={18} />
                Add habit
              </button>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {habits.map((habit) => (
                <div
                  key={habit.name}
                  className="rounded-[1.8rem] border border-slate-200 bg-white/85 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(148,163,184,0.18)] dark:border-white/[0.08] dark:bg-white/[0.04] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                      {habit.completed ? (
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
                          <CheckCircle2 className="h-5 w-5" />
                        </div>
                      ) : (
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-white/[0.06] dark:text-slate-500">
                          <Circle className="h-5 w-5" />
                        </div>
                      )}

                      <div>
                        <p className="font-black text-slate-900 dark:text-white">
                          {habit.name}
                        </p>
                        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
                          Daily check-in
                        </p>
                      </div>
                    </div>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500 dark:bg-white/[0.06] dark:text-slate-300">
                      Today
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-5 rounded-[2rem] border border-slate-200 bg-white/80 p-6 shadow-[0_20px_70px_rgba(148,163,184,0.12)] dark:border-white/[0.08] dark:bg-[#0d1020]/85 dark:shadow-[0_20px_70px_rgba(0,0,0,0.24)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                Momentum
              </p>
              <h3 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
                Streak energy
              </h3>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500 dark:text-slate-400">
                Small repeatable actions compound faster when the feedback loop feels clear.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-[1.6rem] bg-gradient-to-r from-orange-500 to-fuchsia-500 px-5 py-4 text-white shadow-[0_24px_60px_rgba(249,115,22,0.24)]">
              <Flame className="h-5 w-5" />
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-white/75">
                  Current streak
                </p>
                <p className="text-3xl font-black">14 days</p>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              "Make daily wins visible",
              "Reduce missed-check friction",
              "Keep momentum emotionally rewarding",
            ].map((item) => (
              <div
                key={item}
                className="rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-bold text-slate-700 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-200"
              >
                <Sparkles className="mb-3 h-4 w-4 text-fuchsia-500 dark:text-fuchsia-300" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
