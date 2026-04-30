"use client";

import { ArrowRight, BookOpen, Brain, Clock3, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useLearningSummary } from "@/hooks/useLearningSummary";

function formatMinutes(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value);
}

export default function LearningSummaryPanel() {
  const router = useRouter();
  const { summary, loading, error, refresh } = useLearningSummary();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.52 }}
      className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 dark:border-white/[0.08] dark:bg-[#0f0c1f] dark:shadow-black/20"
    >
      <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />

      <div className="relative z-10">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-black uppercase tracking-[0.22em] text-cyan-500 dark:text-cyan-300">
              Learning
            </p>
            <h3 className="text-xl font-black text-slate-950 dark:text-white">
              Study Momentum
            </h3>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Quick pulse from your learning tracker
            </p>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-500 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-slate-400">
            <Brain className="h-5 w-5" />
          </div>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-24 animate-pulse rounded-[1.5rem] bg-slate-50 dark:bg-white/[0.04]"
              />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 p-5 dark:border-rose-500/20 dark:bg-rose-500/10">
            <p className="text-sm font-semibold text-rose-700 dark:text-rose-200">
              {error}
            </p>
            <button
              onClick={refresh}
              className="mt-4 rounded-2xl bg-rose-600 px-4 py-2 text-sm font-black text-white"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  icon: Clock3,
                  label: "Today",
                  value: `${formatMinutes(summary.todayMinutes)}m`,
                  color: "from-cyan-500 to-sky-400",
                },
                {
                  icon: Trophy,
                  label: "Streak",
                  value: `${summary.currentStreak}d`,
                  color: "from-orange-500 to-amber-400",
                },
                {
                  icon: BookOpen,
                  label: "Completion",
                  value: `${summary.completionRate}%`,
                  color: "from-emerald-500 to-lime-400",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 dark:border-white/[0.08] dark:bg-white/[0.04]"
                >
                  <div
                    className={`mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${item.color} text-white shadow-lg shadow-slate-900/10`}
                  >
                    <item.icon className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                    {item.label}
                  </p>
                  <p className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-col gap-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 dark:border-white/[0.08] dark:bg-white/[0.04] lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-bold text-slate-500">Active session</p>
                <p className="mt-1 text-lg font-black text-slate-950 dark:text-white">
                  {summary.activeSession?.title ?? "No timer running"}
                </p>
                <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                  {summary.activeSession
                    ? `${summary.activeSession.subject} • ${summary.activeSession.plannedMinutes} min planned`
                    : "Open Learning to create and start a study block."}
                </p>
              </div>

              <button
                onClick={() => router.push("/learning")}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-cyan-950/25 transition hover:scale-[1.01]"
              >
                Open Learning
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
