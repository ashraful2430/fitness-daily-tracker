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
    <section id="fitness" className="scroll-mt-8 px-6 lg:px-10">
      <div className="rounded-[2rem] bg-white p-6 shadow-xl shadow-slate-200/70">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-indigo-500">
              Fitness
            </p>
            <h2 className="mt-2 text-3xl font-black">Workout Tracker</h2>
          </div>
        </div>

        <div className="mb-6 grid gap-3 rounded-3xl border border-slate-100 bg-slate-50 p-4 lg:grid-cols-5">
          <input
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-indigo-500"
            placeholder="Workout title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <input
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-indigo-500"
            placeholder="Duration min"
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />

          <select
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-indigo-500"
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

          <input
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-indigo-500"
            placeholder="Calories"
            type="number"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
          />

          <button
            onClick={addWorkout}
            disabled={adding}
            className="flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {adding ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Plus size={18} />
            )}
            Add workout
          </button>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {loading ? (
            <div className="col-span-full flex justify-center rounded-3xl bg-slate-50 p-10">
              <Loader2 className="animate-spin text-indigo-600" />
            </div>
          ) : workouts.length === 0 ? (
            <div className="col-span-full rounded-3xl bg-slate-50 p-10 text-center">
              <p className="font-bold text-slate-600">
                Login and add your first workout to start tracking
                progress.{" "}
              </p>
            </div>
          ) : (
            workouts.map((workout) => (
              <div
                key={workout._id}
                className="rounded-3xl border border-slate-100 bg-slate-50 p-5"
              >
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                    <Dumbbell size={22} />
                  </div>

                  <button
                    onClick={() => deleteWorkout(workout._id)}
                    className="rounded-xl bg-white p-2 text-slate-400 transition hover:text-red-500"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <h3 className="text-lg font-black">{workout.title}</h3>

                <p className="mt-2 text-sm font-semibold text-slate-500">
                  {workout.duration} min • {workout.type} • {workout.calories}{" "}
                  cal
                </p>

                <button
                  onClick={() => toggleComplete(workout)}
                  className={`mt-5 flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition ${
                    workout.status === "completed"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-white text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"
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

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-500 p-6 text-white">
            <Dumbbell />
            <p className="mt-4 text-sm font-semibold text-white/80">
              Completed Workouts
            </p>
            <p className="mt-1 text-4xl font-black">
              {completedCount}/{workouts.length}
            </p>
          </div>

          <div className="rounded-3xl bg-gradient-to-br from-rose-500 to-orange-400 p-6 text-white">
            <HeartPulse />
            <p className="mt-4 text-sm font-semibold text-white/80">
              Calories Burned
            </p>
            <p className="mt-1 text-4xl font-black">{totalCalories}</p>
          </div>

          <div className="rounded-3xl bg-gradient-to-br from-emerald-500 to-lime-400 p-6 text-white">
            <Footprints />
            <p className="mt-4 text-sm font-semibold text-white/80">
              Active Minutes
            </p>
            <p className="mt-1 text-4xl font-black">{totalDuration}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
