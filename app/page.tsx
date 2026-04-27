"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Activity,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Dumbbell,
  LineChart,
  Menu,
  Moon,
  PiggyBank,
  ShieldCheck,
  Sparkles,
  Timer,
} from "lucide-react";
import ThemeToggle from "@/components/theme/ThemeToggle";

const features = [
  {
    title: "Learning",
    description: "Track courses, subjects, study time, and practice sessions.",
    icon: BookOpen,
  },
  {
    title: "Fitness",
    description: "Track workouts, activity, water intake, and consistency.",
    icon: Dumbbell,
  },
  {
    title: "Money",
    description: "Track income, expenses, savings, and monthly balance.",
    icon: PiggyBank,
  },
  {
    title: "Focus Timer",
    description: "Run focused sessions and measure productive time.",
    icon: Timer,
  },
];

const stats = [
  { label: "Daily Progress", value: "82%" },
  { label: "Focus Time", value: "3h" },
  { label: "Saved", value: "$420" },
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#F7F7FB] text-slate-950 dark:bg-slate-950 dark:text-white">
      <section className="relative px-4 py-4 sm:px-6 lg:px-10">
        <div className="absolute left-1/2 top-0 -z-10 h-[320px] w-[320px] -translate-x-1/2 rounded-full bg-indigo-400/30 blur-3xl sm:h-[520px] sm:w-[520px] dark:bg-indigo-600/20" />

        <nav className="mx-auto flex max-w-7xl items-center justify-between rounded-3xl border border-white/60 bg-white/85 px-4 py-3 shadow-xl shadow-slate-200/60 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-none sm:px-5">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white sm:h-11 sm:w-11">
              <Activity size={21} />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-base font-black sm:text-lg">
                Planify Life
              </h1>
              <p className="hidden text-xs font-semibold text-slate-500 dark:text-slate-400 sm:block">
                Personal tracking system
              </p>
            </div>
          </Link>

          <div className="hidden items-center gap-6 text-sm font-bold text-slate-600 dark:text-slate-300 lg:flex">
            <a href="#features">Features</a>
            <a href="#reports">Reports</a>
            <a href="#security">Security</a>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />

            <Link
              href="/auth"
              className="hidden rounded-2xl px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10 sm:block"
            >
              Login
            </Link>

            <Link
              href="/auth"
              className="rounded-2xl bg-indigo-600 px-4 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-200 transition hover:scale-105 dark:shadow-none sm:px-5 sm:text-sm"
            >
              Get Started
            </Link>
          </div>
        </nav>

        <div className="mx-auto grid max-w-7xl items-center gap-10 py-12 sm:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center lg:text-left"
          >
            <div className="mb-5 inline-flex max-w-full items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs font-bold text-indigo-700 dark:border-indigo-400/20 dark:bg-indigo-400/10 dark:text-indigo-300 sm:text-sm">
              <Sparkles size={16} />
              <span className="truncate">
                Built for students, workers, learners, and creators
              </span>
            </div>

            <h2 className="mx-auto max-w-5xl text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl md:text-6xl lg:mx-0 xl:text-7xl">
              Track learning, health, money, and focus in one place.
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-base font-medium leading-7 text-slate-600 dark:text-slate-300 sm:text-lg lg:mx-0">
              Create custom categories, measure daily progress, monitor
              expenses, track focus sessions, and review reports across days,
              weeks, months, and years.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Link
                href="/auth"
                className="rounded-2xl bg-indigo-600 px-6 py-4 text-center text-sm font-black text-white shadow-xl shadow-indigo-200 transition hover:scale-105 dark:shadow-none"
              >
                Start Tracking
              </Link>

              <Link
                href="/dashboard"
                className="rounded-2xl bg-white px-6 py-4 text-center text-sm font-black text-slate-800 shadow-xl shadow-slate-200 transition hover:scale-105 dark:bg-white/10 dark:text-white dark:shadow-none"
              >
                Open Dashboard
              </Link>
            </div>

            <div className="mt-7 grid gap-3 text-left text-sm font-bold text-slate-500 dark:text-slate-400 sm:grid-cols-3">
              {[
                "Custom categories",
                "Personal reports",
                "Mobile responsive",
              ].map((item) => (
                <span
                  key={item}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-white/70 px-4 py-3 shadow-sm dark:bg-white/5 sm:justify-start"
                >
                  <CheckCircle2 size={17} className="text-emerald-500" />
                  {item}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, rotateY: 20, y: 30 }}
            animate={{ opacity: 1, rotateY: 0, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative mx-auto w-full max-w-[520px] lg:max-w-none"
          >
            <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-fuchsia-400/30 blur-3xl sm:h-44 sm:w-44" />
            <div className="absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-cyan-400/30 blur-3xl sm:h-44 sm:w-44" />

            <div className="relative rounded-[2rem] border border-white/70 bg-white/90 p-3 shadow-2xl shadow-slate-300/70 backdrop-blur dark:border-white/10 dark:bg-white/10 dark:shadow-none sm:rounded-[2.5rem] sm:p-5">
              <div className="rounded-[1.5rem] bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-500 p-5 text-white sm:rounded-[2rem] sm:p-6">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-white/70 sm:text-sm">
                      Today’s Overview
                    </p>
                    <h3 className="text-xl font-black sm:text-2xl">
                      Life Dashboard
                    </h3>
                  </div>
                  <BarChart3 className="shrink-0" />
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {stats.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl bg-white/15 p-4 backdrop-blur sm:rounded-3xl"
                    >
                      <p className="text-xs font-bold text-white/70">
                        {item.label}
                      </p>
                      <p className="mt-2 text-2xl font-black">{item.value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-2xl bg-white/15 p-4 sm:rounded-3xl">
                  <div className="mb-3 flex items-center justify-between text-sm font-bold">
                    <span>Weekly Progress</span>
                    <span>74%</span>
                  </div>
                  <div className="h-3 rounded-full bg-white/20">
                    <div className="h-3 w-[74%] rounded-full bg-white" />
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-5 dark:bg-white/10 sm:rounded-3xl">
                  <BookOpen className="text-indigo-600 dark:text-indigo-300" />
                  <p className="mt-4 text-sm font-bold text-slate-500 dark:text-slate-300">
                    Learning
                  </p>
                  <p className="text-3xl font-black">6h</p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-5 dark:bg-white/10 sm:rounded-3xl">
                  <PiggyBank className="text-emerald-600 dark:text-emerald-300" />
                  <p className="mt-4 text-sm font-bold text-slate-500 dark:text-slate-300">
                    Balance
                  </p>
                  <p className="text-3xl font-black">$1,280</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="features" className="px-4 py-12 sm:px-6 sm:py-16 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-3xl text-center lg:text-left">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-indigo-600">
              Features
            </p>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl md:text-5xl">
              Flexible enough for every type of user.
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
              Students, job holders, DevOps learners, freelancers, and creators
              can organize their own tracking system.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                  className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/70 transition hover:-translate-y-2 dark:border-white/10 dark:bg-white/10 dark:shadow-none"
                >
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-400/20 dark:text-indigo-300">
                    <Icon size={24} />
                  </div>
                  <h3 className="text-xl font-black">{feature.title}</h3>
                  <p className="mt-3 text-sm font-medium leading-6 text-slate-600 dark:text-slate-300">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="reports" className="px-4 py-12 sm:px-6 sm:py-16 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-2">
          <div className="rounded-[2rem] bg-slate-950 p-6 text-white dark:bg-white/10 sm:p-8 lg:rounded-[2.5rem]">
            <LineChart className="text-indigo-300" />
            <h2 className="mt-6 text-3xl font-black sm:text-4xl">
              Reports for daily, weekly, monthly, and yearly progress.
            </h2>
            <p className="mt-4 leading-7 text-slate-300">
              Review where your time, energy, and money went across learning,
              fitness, habits, focus, and expenses.
            </p>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-xl shadow-slate-200/70 dark:bg-white/10 dark:shadow-none sm:p-8 lg:rounded-[2.5rem]">
            <Moon className="text-indigo-600 dark:text-indigo-300" />
            <h2 className="mt-6 text-3xl font-black sm:text-4xl">
              Dark mode and responsive design included.
            </h2>
            <p className="mt-4 leading-7 text-slate-600 dark:text-slate-300">
              Built for desktop, tablet, and mobile so users can track progress
              anywhere.
            </p>
          </div>
        </div>
      </section>

      <section id="security" className="px-4 py-12 sm:px-6 sm:py-16 lg:px-10">
        <div className="mx-auto max-w-7xl rounded-[2rem] bg-gradient-to-br from-indigo-600 to-fuchsia-600 p-6 text-white sm:p-8 md:p-12 lg:rounded-[2.5rem]">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <ShieldCheck size={42} />
              <h2 className="mt-5 text-3xl font-black sm:text-4xl">
                Ready for real users and future deployment lessons.
              </h2>
            </div>

            <p className="text-base leading-8 text-white/80 sm:text-lg">
              Planify Life is structured with authentication, MongoDB, protected
              routes, admin access, API routes, SEO metadata, health checks, and
              deployment-ready architecture.
            </p>
          </div>
        </div>
      </section>

      <footer className="px-6 py-8 text-center text-sm font-semibold text-slate-500 dark:text-slate-400">
        © 2026 Planify Life. Built for better daily progress.
      </footer>
    </main>
  );
}
