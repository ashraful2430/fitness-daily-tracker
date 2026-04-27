"use client";

import {
  Activity,
  BarChart3,
  CalendarCheck,
  Droplets,
  Flame,
  Target,
  Timer,
} from "lucide-react";
import StatCard from "@/components/ui/StateCard";

export default function Dashboard() {
  return (
    <section id="dashboard" className="flex-1 scroll-mt-8 p-6 lg:p-10">
      <div className="mb-8 rounded-[2rem] bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-500 p-8 text-white shadow-2xl shadow-indigo-200">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr] lg:items-center">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-white/70">
              Fitness Daily Tracker
            </p>

            <h2 className="max-w-3xl text-4xl font-black tracking-tight lg:text-6xl">
              Build habits, track fitness, and protect your focus.
            </h2>

            <p className="mt-5 max-w-2xl text-base leading-7 text-white/80">
              A colorful daily system for workouts, habits, water intake,
              Pomodoro focus sessions, and weekly progress analytics.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-indigo-700 shadow-lg transition hover:scale-105">
                Start today
              </button>
              <button className="rounded-2xl bg-white/15 px-5 py-3 text-sm font-bold text-white ring-1 ring-white/30 transition hover:bg-white/20">
                View analytics
              </button>
            </div>
          </div>

          <div className="rounded-[2rem] bg-white/15 p-6 ring-1 ring-white/20 backdrop-blur">
            <div className="mb-5 flex items-center justify-between">
              <p className="font-bold">Today&apos;s score</p>
              <Activity />
            </div>

            <div className="flex h-52 items-center justify-center rounded-full bg-white/10">
              <div className="flex h-36 w-36 items-center justify-center rounded-full border-[14px] border-white/80 text-4xl font-black">
                82%
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs font-semibold text-white/80">
              <span>Workout</span>
              <span>Habits</span>
              <span>Focus</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Workout Streak"
          value="12"
          subtitle="days active"
          icon={Flame}
          tone="orange"
        />

        <StatCard
          title="Water Intake"
          value="6/8"
          subtitle="glasses today"
          icon={Droplets}
          tone="blue"
        />

        <StatCard
          title="Focus Time"
          value="3h"
          subtitle="completed today"
          icon={Timer}
          tone="purple"
        />

        <StatCard
          title="Weekly Goal"
          value="74%"
          subtitle="progress"
          icon={Target}
          tone="green"
        />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <div className="rounded-[2rem] bg-white p-6 shadow-xl shadow-slate-200/70">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-xl font-black">Today&apos;s Fitness Plan</h3>
            <CalendarCheck className="text-indigo-600" />
          </div>

          <div className="space-y-3">
            {[
              "30 min strength workout",
              "10 min stretching",
              "8,000 steps target",
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-slate-100 bg-slate-50 p-4 font-semibold text-slate-700"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-xl shadow-slate-200/70">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-xl font-black">Weekly Productivity</h3>
            <BarChart3 className="text-indigo-600" />
          </div>

          <div className="flex h-64 items-end gap-3">
            {[40, 65, 55, 80, 72, 90, 78].map((height, index) => (
              <div
                key={index}
                className="flex flex-1 flex-col items-center gap-2"
              >
                <div
                  className="w-full rounded-t-2xl bg-gradient-to-t from-indigo-600 to-fuchsia-400"
                  style={{ height: `${height}%` }}
                />
                <span className="text-xs font-bold text-slate-400">
                  {["M", "T", "W", "T", "F", "S", "S"][index]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
