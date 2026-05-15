"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  CheckCircle2,
  Dumbbell,
  Footprints,
  HeartPulse,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { emitFeedbackEffect } from "@/lib/feedbackEvents";

type Workout = {
  _id: string;
  title: string;
  duration: number;
  type: string;
  status: "planned" | "completed";
  calories: number;
};

export default function FitnessTracker() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("");
  const [type, setType] = useState("General");
  const [calories, setCalories] = useState("");

  const fetchWorkouts = async () => {
    try {
      const res = await fetch("/api/workouts");
      const data = await res.json();

      if (res.status === 401) {
        setWorkouts([]);
        return;
      }

      if (!res.ok) {
        throw new Error(data.message || "Failed to load workouts");
      }

      setWorkouts(data.workouts);
    } catch {
      toast.error("Failed to load workouts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function loadWorkouts() {
      await fetchWorkouts();
    }

    loadWorkouts();
  }, []);

  const addWorkout = async () => {
    if (!title || !duration) {
      toast.error("Workout title and duration are required");
      return;
    }

    setAdding(true);

    try {
      const res = await fetch("/api/workouts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          duration: Number(duration),
          type,
          calories: Number(calories || 0),
        }),
      });

      const data = await res.json();

      if (res.status === 401) {
        toast.error("Please login to add workout");
        return;
      }

      if (!res.ok) {
        throw new Error(data.message || "Failed to add workout");
      }

      setWorkouts((prev) => [data.workout, ...prev]);
      setTitle("");
      setDuration("");
      setType("General");
      setCalories("");

      toast.success("Workout added successfully");
      emitFeedbackEffect("fitness.workout.create.success");
    } catch {
      toast.error("Failed to add workout");
    } finally {
      setAdding(false);
    }
  };

  const toggleComplete = async (workout: Workout) => {
    const nextStatus = workout.status === "completed" ? "planned" : "completed";

    try {
      const res = await fetch(`/api/workouts/${workout._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update workout");
      }

      setWorkouts((prev) =>
        prev.map((item) => (item._id === workout._id ? data.workout : item)),
      );

      toast.success(
        nextStatus === "completed"
          ? "Workout marked completed"
          : "Workout marked planned",
      );
      emitFeedbackEffect("fitness.workout.update.success");
    } catch {
      toast.error("Failed to update workout");
    }
  };

  const deleteWorkout = async (id: string) => {
    try {
      const res = await fetch(`/api/workouts/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to delete workout");
      }

      setWorkouts((prev) => prev.filter((item) => item._id !== id));
      toast.success("Workout deleted");
      emitFeedbackEffect("fitness.workout.delete.success");
    } catch {
      toast.error("Failed to delete workout");
    }
  };

  const completedCount = workouts.filter(
    (workout) => workout.status === "completed",
  ).length;

  const totalCalories = workouts.reduce(
    (sum, workout) =>
      workout.status === "completed" ? sum + workout.calories : sum,
    0,
  );

  const totalDuration = workouts.reduce(
    (sum, workout) =>
      workout.status === "completed" ? sum + workout.duration : sum,
    0,
  );

  return (
    <section id="fitness" className="scroll-mt-8 px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
      <div className="relative overflow-hidden rounded-[2.2rem] border border-slate-200 bg-white/85 p-6 shadow-[0_30px_90px_rgba(148,163,184,0.16)] backdrop-blur-xl dark:border-white/[0.08] dark:bg-[#0f1220]/90 dark:shadow-[0_30px_90px_rgba(0,0,0,0.3)] md:p-8">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
        <div className="absolute -right-20 top-0 h-56 w-56 rounded-full bg-cyan-400/12 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />

        <div className="relative z-10">
          <div className="grid gap-5 xl:grid-cols-[1.08fr_0.92fr]">
            <div className="rounded-[2rem] border border-slate-200 bg-[linear-gradient(135deg,rgba(14,23,54,0.96),rgba(19,46,82,0.9))] p-6 text-white shadow-[0_30px_90px_rgba(15,23,42,0.24)] dark:border-white/[0.08]">
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-cyan-200">
                Fitness Lab
              </p>
              <h2 className="mt-3 max-w-2xl text-3xl font-black tracking-[-0.03em] sm:text-4xl">
                Train with more structure, recover with more awareness.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-200/78 sm:text-base">
                Capture workouts, monitor completed sessions, and keep your
                active minutes and calorie burn visible in one polished space.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {[
                  {
                    label: "Completed",
                    value: `${completedCount}/${workouts.length || 0}`,
                    icon: Dumbbell,
                  },
                  {
                    label: "Calories",
                    value: `${totalCalories}`,
                    icon: HeartPulse,
                  },
                  {
                    label: "Active Min",
                    value: `${totalDuration}`,
                    icon: Footprints,
                  },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.label}
                      className="rounded-[1.4rem] border border-white/10 bg-white/10 p-4 backdrop-blur"
                    >
                      <Icon className="h-5 w-5 text-cyan-200" />
                      <p className="mt-4 text-[11px] font-black uppercase tracking-[0.18em] text-white/65">
                        {item.label}
                      </p>
                      <p className="mt-1 text-2xl font-black">{item.value}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-slate-50/80 p-5 dark:border-white/[0.08] dark:bg-white/[0.04]">
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-cyan-600 dark:text-cyan-300">
                Add Workout
              </p>
              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-1">
                <input
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none transition focus:border-cyan-500 dark:border-white/[0.08] dark:bg-[#171b2e] dark:text-white"
                  placeholder="Workout title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />

                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none transition focus:border-cyan-500 dark:border-white/[0.08] dark:bg-[#171b2e] dark:text-white"
                    placeholder="Duration min"
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  />

                  <input
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none transition focus:border-cyan-500 dark:border-white/[0.08] dark:bg-[#171b2e] dark:text-white"
                    placeholder="Calories"
                    type="number"
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                  />
                </div>

                <select
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none transition focus:border-cyan-500 dark:border-white/[0.08] dark:bg-[#171b2e] dark:text-white"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option>General</option>
                  <option>Strength</option>
                  <option>Cardio</option>
                  <option>Yoga</option>
                  <option>Walking</option>
                  <option>Running</option>
                </select>

                <button
                  onClick={addWorkout}
                  disabled={adding}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-sm font-black text-white shadow-[0_18px_45px_rgba(59,130,246,0.22)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {adding ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Plus size={18} />
                  )}
                  Add workout
                </button>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-[2rem] border border-slate-200 bg-white/80 p-5 shadow-[0_20px_70px_rgba(148,163,184,0.12)] dark:border-white/[0.08] dark:bg-[#0d1020]/85 dark:shadow-[0_20px_70px_rgba(0,0,0,0.24)]">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                  Workout Feed
                </p>
                <h3 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
                  Today&apos;s training queue
                </h3>
              </div>
              <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-500 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-slate-300">
                {workouts.length} logged sessions
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {loading ? (
                <div className="col-span-full flex justify-center rounded-[1.8rem] border border-slate-200 bg-slate-50 p-12 dark:border-white/[0.08] dark:bg-white/[0.04]">
                  <Loader2 className="animate-spin text-cyan-500" />
                </div>
              ) : workouts.length === 0 ? (
                <div className="col-span-full rounded-[1.8rem] border border-dashed border-slate-200 bg-slate-50 p-12 text-center dark:border-white/[0.08] dark:bg-white/[0.04]">
                  <p className="font-bold text-slate-600 dark:text-slate-300">
                    Add your first workout to start building a cleaner training history.
                  </p>
                </div>
              ) : (
                workouts.map((workout) => (
                  <div
                    key={workout._id}
                    className="group rounded-[1.8rem] border border-slate-200 bg-slate-50/85 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(148,163,184,0.18)] dark:border-white/[0.08] dark:bg-white/[0.04] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
                  >
                    <div className="mb-5 flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/15 to-blue-500/15 text-cyan-700 dark:text-cyan-300">
                        <Dumbbell size={22} />
                      </div>

                      <button
                        onClick={() => deleteWorkout(workout._id)}
                        className="rounded-xl bg-white p-2 text-slate-400 transition hover:text-red-500 dark:bg-white/[0.06]"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <h3 className="text-lg font-black text-slate-950 dark:text-white">
                      {workout.title}
                    </h3>

                    <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
                      {`${workout.duration} min • ${workout.type} • ${workout.calories} cal`}
                    </p>

                    <button
                      onClick={() => toggleComplete(workout)}
                      className={`mt-5 flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition ${
                        workout.status === "completed"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                          : "bg-white text-slate-600 hover:bg-cyan-50 hover:text-cyan-700 dark:bg-white/[0.06] dark:text-slate-200 dark:hover:bg-cyan-500/10 dark:hover:text-cyan-300"
                      }`}
                    >
                      <CheckCircle2 size={15} />
                      {workout.status === "completed"
                        ? "Completed"
                        : "Mark complete"}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
