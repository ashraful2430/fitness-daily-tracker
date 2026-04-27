import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#F7F7FB] px-6 py-10 text-slate-900">
      <section className="mx-auto flex min-h-[80vh] max-w-6xl flex-col items-center justify-center text-center">
        <p className="mb-4 text-sm font-bold uppercase tracking-[0.3em] text-indigo-600">
          Planify Life
        </p>

        <h1 className="max-w-4xl text-5xl font-black tracking-tight md:text-7xl">
          Track learning, health, habits, focus, and money in one place.
        </h1>

        <p className="mt-6 max-w-2xl text-lg font-medium leading-8 text-slate-600">
          A personal productivity system for students, job holders, learners,
          and anyone who wants to organize life with clear progress tracking.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/auth"
            className="rounded-2xl bg-indigo-600 px-6 py-3 font-bold text-white shadow-lg shadow-indigo-200 transition hover:scale-105"
          >
            Get Started
          </Link>

          <Link
            href="/dashboard"
            className="rounded-2xl bg-white px-6 py-3 font-bold text-slate-700 shadow-lg shadow-slate-200 transition hover:scale-105"
          >
            Open Dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
