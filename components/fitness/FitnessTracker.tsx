import { Dumbbell, Footprints, HeartPulse, Plus } from "lucide-react";

const workouts = [
  { title: "Strength Training", time: "30 min", status: "Planned" },
  { title: "Cardio Walk", time: "25 min", status: "Completed" },
  { title: "Stretching", time: "10 min", status: "Pending" },
];

export default function FitnessTracker() {
  return (
    <section className="px-6 lg:px-10">
      <div className="rounded-[2rem] bg-white p-6 shadow-xl shadow-slate-200/70">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-indigo-500">
              Fitness
            </p>
            <h2 className="mt-2 text-3xl font-black">Workout Tracker</h2>
          </div>

          <button className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:scale-105">
            <Plus size={18} />
            Add workout
          </button>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {workouts.map((workout) => (
            <div
              key={workout.title}
              className="rounded-3xl border border-slate-100 bg-slate-50 p-5"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                <Dumbbell size={22} />
              </div>

              <h3 className="text-lg font-black">{workout.title}</h3>
              <p className="mt-2 text-sm font-semibold text-slate-500">
                {workout.time}
              </p>

              <span className="mt-5 inline-flex rounded-full bg-white px-4 py-2 text-xs font-bold text-slate-600 shadow-sm">
                {workout.status}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl bg-gradient-to-br from-rose-500 to-orange-400 p-6 text-white">
            <HeartPulse />
            <p className="mt-4 text-sm font-semibold text-white/80">
              Calories Burned
            </p>
            <p className="mt-1 text-4xl font-black">420</p>
          </div>

          <div className="rounded-3xl bg-gradient-to-br from-emerald-500 to-lime-400 p-6 text-white">
            <Footprints />
            <p className="mt-4 text-sm font-semibold text-white/80">
              Steps Today
            </p>
            <p className="mt-1 text-4xl font-black">8,240</p>
          </div>
        </div>
      </div>
    </section>
  );
}
