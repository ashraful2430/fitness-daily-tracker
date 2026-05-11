"use client";

import {
  BrainCircuit,
  Coffee,
  Flame,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Target,
  Timer,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Mode = {
  label: string;
  minutes: number;
  icon: typeof Timer;
  description: string;
};

const modes: Mode[] = [
  {
    label: "Deep focus",
    minutes: 25,
    icon: BrainCircuit,
    description: "Classic high-intensity work block.",
  },
  {
    label: "Short reset",
    minutes: 5,
    icon: Coffee,
    description: "A quick breathing gap between sprints.",
  },
  {
    label: "Long reset",
    minutes: 15,
    icon: Sparkles,
    description: "Recover before another serious block.",
  },
];

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

export default function PomodoroTimer() {
  const [selectedMode, setSelectedMode] = useState(modes[0]);
  const [seconds, setSeconds] = useState(selectedMode.minutes * 60);
  const [active, setActive] = useState(false);
  const [completedBlocks, setCompletedBlocks] = useState(0);

  const totalSeconds = selectedMode.minutes * 60;
  const progress = useMemo(
    () => Math.round(((totalSeconds - seconds) / totalSeconds) * 100),
    [seconds, totalSeconds],
  );

  useEffect(() => {
    if (!active) return;

    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          setActive(false);
          setCompletedBlocks((current) => current + 1);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [active]);

  const changeMode = (mode: Mode) => {
    setSelectedMode(mode);
    setSeconds(mode.minutes * 60);
    setActive(false);
  };

  const reset = () => {
    setActive(false);
    setSeconds(totalSeconds);
  };

  return (
    <section id="pomodoro" className="relative min-h-screen overflow-hidden px-4 py-6 text-slate-950 dark:text-white sm:px-6 lg:px-8 xl:px-10">
      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <div className="absolute left-[10%] top-[8%] h-80 w-80 rounded-[5rem] bg-indigo-400/14 blur-[120px]" />
        <div className="absolute right-[8%] bottom-[8%] h-80 w-80 rounded-[5rem] bg-cyan-400/14 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1500px] space-y-5">
        <div className="relative overflow-hidden rounded-[2.2rem] border border-slate-200 bg-[linear-gradient(135deg,rgba(99,102,241,0.16),rgba(255,255,255,0.9),rgba(6,182,212,0.12))] p-5 shadow-[0_30px_90px_rgba(148,163,184,0.18)] backdrop-blur-xl dark:border-white/[0.08] dark:bg-[linear-gradient(135deg,rgba(99,102,241,0.18),rgba(255,255,255,0.04),rgba(6,182,212,0.11))] dark:shadow-[0_30px_90px_rgba(0,0,0,0.3)] sm:p-7 lg:p-8">
          <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/20" />
          <div className="pointer-events-none absolute -right-12 top-8 h-44 w-44 rotate-12 rounded-[3rem] border border-white/30 bg-white/20 shadow-2xl backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.04]" />

          <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1fr)_430px] xl:items-end">
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-indigo-50 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-indigo-700 dark:border-indigo-300/20 dark:bg-indigo-500/10 dark:text-indigo-200">
                <Timer className="h-4 w-4" />
                Focus Lab
              </div>
              <h1 className="mt-5 text-[clamp(2.4rem,5.4vw,5rem)] font-black leading-[0.95] tracking-[-0.04em]">
                Protect your attention with a calmer timer.
              </h1>
              <p className="mt-5 max-w-2xl text-base font-medium leading-8 text-slate-600 dark:text-slate-300">
                Switch between focused work and recovery blocks, track completed
                rounds, and keep the session interface readable on mobile,
                tablet, and desktop.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              {[
                {
                  label: "Mode",
                  value: selectedMode.label,
                  detail: `${selectedMode.minutes} minute block`,
                  icon: Target,
                },
                {
                  label: "Progress",
                  value: `${progress}%`,
                  detail: active ? "Timer is running" : "Ready when you are",
                  icon: Zap,
                },
                {
                  label: "Completed",
                  value: `${completedBlocks}`,
                  detail: "Blocks finished this session",
                  icon: Flame,
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="rounded-[1.45rem] border border-slate-200/80 bg-white/85 p-4 shadow-lg shadow-slate-200/40 backdrop-blur dark:border-white/[0.08] dark:bg-white/[0.055] dark:shadow-none"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                          {item.label}
                        </p>
                        <p className="mt-2 truncate text-2xl font-black tracking-[-0.03em]">
                          {item.value}
                        </p>
                      </div>
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-200">
                        <Icon className="h-5 w-5" />
                      </span>
                    </div>
                    <p className="mt-3 text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">
                      {item.detail}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 p-5 text-white shadow-[0_34px_100px_rgba(15,23,42,0.24)] dark:border-white/[0.08] dark:bg-[#10111b] dark:shadow-black/35 sm:p-7">
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-[4rem] bg-indigo-500/20 blur-[100px]" />
            <div className="pointer-events-none absolute -left-20 bottom-0 h-56 w-56 rounded-[4rem] bg-cyan-500/16 blur-[100px]" />

            <div className="relative">
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-cyan-300">
                Timer
              </p>

              <div className="mx-auto mt-7 flex max-w-[420px] flex-col items-center">
                <div className="relative flex aspect-square w-full max-w-[330px] items-center justify-center rounded-full border border-white/10 bg-white/[0.06] p-5 shadow-[inset_18px_18px_60px_rgba(255,255,255,0.04),inset_-24px_-24px_70px_rgba(0,0,0,0.42)]">
                  <div className="absolute inset-5 rounded-full border border-white/10" />
                  <div className="absolute inset-10 rounded-full bg-slate-950/50 shadow-inner" />
                  <div
                    className="absolute inset-3 rounded-full"
                    style={{
                      background: `conic-gradient(#22d3ee ${progress * 3.6}deg, rgba(255,255,255,0.08) 0deg)`,
                      mask: "radial-gradient(circle, transparent 62%, black 63%)",
                      WebkitMask:
                        "radial-gradient(circle, transparent 62%, black 63%)",
                    }}
                  />
                  <div className="relative text-center">
                    <p className="text-sm font-black uppercase tracking-[0.2em] text-cyan-200">
                      {selectedMode.label}
                    </p>
                    <p className="mt-3 text-[clamp(4rem,12vw,6.5rem)] font-black leading-none tracking-[-0.05em] tabular-nums">
                      {formatTime(seconds)}
                    </p>
                    <p className="mt-3 text-sm font-semibold text-slate-300">
                      {seconds === 0
                        ? "Block complete"
                        : active
                          ? "Stay with the work"
                          : "Ready to begin"}
                    </p>
                  </div>
                </div>

                <div className="mt-7 grid w-full grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setActive((current) => !current)}
                    disabled={seconds === 0}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3.5 text-sm font-black text-slate-950 shadow-xl shadow-black/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {active ? <Pause size={18} /> : <Play size={18} />}
                    {active ? "Pause" : "Start"}
                  </button>

                  <button
                    type="button"
                    onClick={reset}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/10 px-5 py-3.5 text-sm font-black text-white transition hover:bg-white/15"
                  >
                    <RotateCcw size={18} />
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-5">
            <div className="rounded-[2rem] border border-slate-200 bg-white/88 p-5 shadow-xl shadow-slate-200/55 backdrop-blur-xl dark:border-white/[0.08] dark:bg-[#0f0c1f]/90 dark:shadow-black/25 sm:p-6">
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-indigo-600 dark:text-indigo-300">
                Session Type
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-[-0.03em]">
                Choose the block that matches your energy
              </h2>

              <div className="mt-5 grid gap-3 md:grid-cols-3">
                {modes.map((mode) => {
                  const Icon = mode.icon;
                  const selected = selectedMode.label === mode.label;

                  return (
                    <button
                      key={mode.label}
                      type="button"
                      onClick={() => changeMode(mode)}
                      className={`min-h-[170px] rounded-[1.5rem] border p-4 text-left transition hover:-translate-y-1 ${
                        selected
                          ? "border-indigo-300 bg-indigo-50 shadow-lg shadow-indigo-200/60 dark:border-indigo-300/30 dark:bg-indigo-500/10 dark:shadow-none"
                          : "border-slate-200 bg-slate-50/80 hover:bg-white dark:border-white/[0.08] dark:bg-white/[0.04] dark:hover:bg-white/[0.07]"
                      }`}
                    >
                      <span
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                          selected
                            ? "bg-indigo-600 text-white"
                            : "bg-white text-slate-500 dark:bg-white/[0.06] dark:text-slate-300"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <p className="mt-4 text-base font-black">{mode.label}</p>
                      <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
                        {mode.minutes} minutes
                      </p>
                      <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
                        {mode.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {[
                "Prepare one clear task before pressing start.",
                "Keep breaks visible so recovery feels intentional.",
                "Track completed blocks as a simple focus streak.",
              ].map((item, index) => (
                <div
                  key={item}
                  className="rounded-[1.5rem] border border-slate-200 bg-white/88 p-5 text-sm font-bold leading-6 text-slate-700 shadow-lg shadow-slate-200/45 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-200 dark:shadow-none"
                >
                  <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-50 text-sm font-black text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-200">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
