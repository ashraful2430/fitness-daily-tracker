"use client";

import { Pause, Play, RotateCcw, Timer } from "lucide-react";
import { useEffect, useState } from "react";

export default function PomodoroTimer() {
  const [seconds, setSeconds] = useState(25 * 60);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!active) return;

    const interval = setInterval(() => {
      setSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [active]);

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return (
    <section className="px-6 pb-10 lg:px-10">
      <div className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-2xl shadow-slate-300">
        <div className="mb-8 flex items-center gap-3">
          <Timer className="text-indigo-300" />
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-indigo-300">
              Focus
            </p>
            <h2 className="text-3xl font-black">Pomodoro Timer</h2>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center">
          <div className="flex h-64 w-64 items-center justify-center rounded-full border-[18px] border-indigo-500 bg-white/5 text-6xl font-black shadow-inner">
            {String(minutes).padStart(2, "0")}:
            {String(remainingSeconds).padStart(2, "0")}
          </div>

          <div className="mt-8 flex gap-4">
            <button
              onClick={() => setActive(!active)}
              className="flex items-center gap-2 rounded-2xl bg-white px-6 py-3 font-bold text-slate-950 transition hover:scale-105"
            >
              {active ? <Pause size={20} /> : <Play size={20} />}
              {active ? "Pause" : "Start"}
            </button>

            <button
              onClick={() => {
                setActive(false);
                setSeconds(25 * 60);
              }}
              className="flex items-center gap-2 rounded-2xl bg-white/10 px-6 py-3 font-bold text-white ring-1 ring-white/20 transition hover:bg-white/20"
            >
              <RotateCcw size={20} />
              Reset
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
