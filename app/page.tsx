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
  Moon,
  PiggyBank,
  ShieldCheck,
  Sparkles,
  Timer,
} from "lucide-react";
import ThemeToggle from "@/components/theme/ThemeToggle";

const features = [
  {
    title: "Learning Tracker",
    description: "Track study time, courses, subjects, and practice sessions.",
    icon: BookOpen,
  },
  {
    title: "Fitness & Health",
    description: "Track workouts, activity, water intake, and health habits.",
    icon: Dumbbell,
  },
  {
    title: "Money Tracker",
    description: "Track income, expenses, savings, and monthly balance.",
    icon: PiggyBank,
  },
  {
    title: "Focus Timer",
    description: "Start focused work sessions and measure productive time.",
    icon: Timer,
  },
];

const stats = [
  { label: "Daily Progress", value: "82%" },
  { label: "Focus Time", value: "3h 20m" },
  { label: "Saved This Month", value: "$420" },
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#F7F7FB] text-slate-950 dark:bg-slate-950 dark:text-white">
      <section className="relative px-6 py-6 lg:px-10">
        <div className="absolute left-1/2 top-0 -z-10 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-indigo-400/30 blur-3xl dark:bg-indigo-600/20" />

        <nav className="mx-auto flex max-w-7xl items-center justify-between rounded-3xl border border-white/60 bg-white/80 px-5 py-4 shadow-xl shadow-slate-200/60 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-none">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white">
              <Activity size={22} />
            </div>
            <div>
              <h1 className="text-lg font-black">Planify Life</h1>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Personal tracking system
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-6 text-sm font-bold text-slate-600 dark:text-slate-300 md:flex">
            <a href="#features">Features</a>
            <a href="#reports">Reports</a>
            <a href="#security">Security</a>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/auth"
              className="hidden rounded-2xl px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10 sm:block"
            >
              Login
            </Link>

            <Link
              href="/auth"
              className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:scale-105 dark:shadow-none"
            >
              Get Started
            </Link>
          </div>
        </nav>

        <div className="mx-auto grid max-w-7xl items-center gap-12 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:py-28">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-700 dark:border-indigo-400/20 dark:bg-indigo-400/10 dark:text-indigo-300">
              <Sparkles size={16} />
              Built for students, workers, learners, and creators
            </div>

            <h2 className="max-w-5xl text-5xl font-black leading-[1.05] tracking-tight md:text-7xl">
              Track your learning, health, money, and focus in one place.
            </h2>

            <p className="mt-6 max-w-2xl text-lg font-medium leading-8 text-slate-600 dark:text-slate-300">
              Planify Life helps you create custom categories, track daily
              progress, measure focus time, monitor expenses, and review weekly,
              monthly, and yearly reports.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/auth"
                className="rounded-2xl bg-indigo-600 px-6 py-4 text-sm font-black text-white shadow-xl shadow-indigo-200 transition hover:scale-105 dark:shadow-none"
              >
                Start Tracking
              </Link>

              <Link
                href="/dashboard"
                className="rounded-2xl bg-white px-6 py-4 text-sm font-black text-slate-800 shadow-xl shadow-slate-200 transition hover:scale-105 dark:bg-white/10 dark:text-white dark:shadow-none"
              >
                Open Dashboard
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-4 text-sm font-bold text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-2">
                <CheckCircle2 size={17} className="text-emerald-500" />
                Custom categories
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 size={17} className="text-emerald-500" />
                Personal reports
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 size={17} className="text-emerald-500" />
                Mobile responsive
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, rotateY: 20, y: 30 }}
            animate={{ opacity: 1, rotateY: 0, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-fuchsia-400/30 blur-3xl" />
            <div className="absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-cyan-400/30 blur-3xl" />

            <div className="relative rounded-[2.5rem] border border-white/70 bg-white/90 p-5 shadow-2xl shadow-slate-300/70 backdrop-blur dark:border-white/10 dark:bg-white/10 dark:shadow-none">
              <div className="rounded-[2rem] bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-500 p-6 text-white">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-white/70">
                      Today’s Overview
                    </p>
                    <h3 className="text-2xl font-black">Life Dashboard</h3>
                  </div>
                  <BarChart3 />
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  {stats.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-3xl bg-white/15 p-4 backdrop-blur"
                    >
                      <p className="text-xs font-bold text-white/70">
                        {item.label}
                      </p>
                      <p className="mt-2 text-2xl font-black">{item.value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-3xl bg-white/15 p-4">
                  <div className="mb-3 flex items-center justify-between text-sm font-bold">
                    <span>Weekly Progress</span>
                    <span>74%</span>
                  </div>

                  <div className="h-3 rounded-full bg-white/20">
                    <div className="h-3 w-[74%] rounded-full bg-white" />
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl bg-slate-50 p-5 dark:bg-white/10">
                  <BookOpen className="text-indigo-600 dark:text-indigo-300" />
                  <p className="mt-4 text-sm font-bold text-slate-500 dark:text-slate-300">
                    Learning
                  </p>
                  <p className="text-3xl font-black">6h</p>
                </div>

                <div className="rounded-3xl bg-slate-50 p-5 dark:bg-white/10">
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

      <section id="features" className="px-6 py-16 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-indigo-600">
              Features
            </p>
            <h2 className="mt-3 text-4xl font-black md:text-5xl">
              Flexible enough for every type of user.
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-300">
              Whether you are a student, office worker, DevOps learner,
              freelancer, or creator, you can organize your own tracking system.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
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

      <section id="reports" className="px-6 py-16 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2">
          <div className="rounded-[2.5rem] bg-slate-950 p-8 text-white dark:bg-white/10">
            <LineChart className="text-indigo-300" />
            <h2 className="mt-6 text-4xl font-black">
              Daily, weekly, monthly, and yearly reports.
            </h2>
            <p className="mt-4 leading-7 text-slate-300">
              See where your time, energy, and money went. Review learning
              progress, fitness consistency, habit completion, and spending
              behavior by date range.
            </p>
          </div>

          <div className="rounded-[2.5rem] bg-white p-8 shadow-xl shadow-slate-200/70 dark:bg-white/10 dark:shadow-none">
            <Moon className="text-indigo-600 dark:text-indigo-300" />
            <h2 className="mt-6 text-4xl font-black">
              Dark mode and responsive design included.
            </h2>
            <p className="mt-4 leading-7 text-slate-600 dark:text-slate-300">
              The layout is built to work across desktop, tablet, and mobile.
              Dark theme support is included so the app feels comfortable for
              daily use.
            </p>
          </div>
        </div>
      </section>

      <section id="security" className="px-6 py-16 lg:px-10">
        <div className="mx-auto max-w-7xl rounded-[2.5rem] bg-gradient-to-br from-indigo-600 to-fuchsia-600 p-8 text-white md:p-12">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <ShieldCheck size={42} />
              <h2 className="mt-5 text-4xl font-black">
                Built for real users and future deployment lessons.
              </h2>
            </div>

            <p className="text-lg leading-8 text-white/80">
              Planify Life will be structured with authentication, MongoDB,
              protected routes, admin access, API routes, SEO metadata, health
              checks, and deployment-ready files so it can later be used to
              teach students how to deploy a production-style application.
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
