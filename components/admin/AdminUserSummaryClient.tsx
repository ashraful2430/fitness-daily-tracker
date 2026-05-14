"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { adminAPI } from "@/lib/api";

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function Card({ title, value, sub }: { title: string; value: string; sub: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">{title}</p>
      <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{sub}</p>
    </div>
  );
}

export default function AdminUserSummaryClient({ userId }: { userId: string }) {
  const summaryQuery = useQuery({
    queryKey: ["admin", "user-summary", userId],
    queryFn: () => adminAPI.getUserSummary(userId),
  });

  if (summaryQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-500">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (summaryQuery.isError || !summaryQuery.data) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
          Failed to load user summary.
        </div>
        <button onClick={() => void summaryQuery.refetch()} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white dark:bg-slate-100 dark:text-slate-900">Retry</button>
      </div>
    );
  }

  const { user, summary } = summaryQuery.data;

  return (
    <div className="space-y-5 px-4 py-5 sm:px-6 lg:px-8">
      <section className="rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-[#121026]/90">
        <Link href="/admin/users" className="text-xs font-bold text-cyan-600 dark:text-cyan-300">? Back to users</Link>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white">{user.name}</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full border border-slate-300 px-2.5 py-1 font-bold text-slate-700 dark:border-white/20 dark:text-slate-200">Role: {user.role}</span>
          <span className={`rounded-full border px-2.5 py-1 font-bold ${user.isBlocked ? "border-rose-300 text-rose-700 dark:border-rose-400/30 dark:text-rose-300" : "border-emerald-300 text-emerald-700 dark:border-emerald-400/30 dark:text-emerald-300"}`}>
            {user.isBlocked ? "Blocked" : "Active"}
          </span>
          <span className="rounded-full border border-slate-300 px-2.5 py-1 font-bold text-slate-700 dark:border-white/20 dark:text-slate-200">Streak: {user.loginStreak}</span>
          <span className="rounded-full border border-slate-300 px-2.5 py-1 font-bold text-slate-700 dark:border-white/20 dark:text-slate-200">Longest: {user.longestLoginStreak}</span>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Card title="Workouts" value={`${summary.workouts.total}`} sub={`${summary.workouts.thisMonth} this month`} />
        <Card title="Learning" value={`${summary.learning.totalSessions}`} sub={`${summary.learning.completedSessions} completed`} />
        <Card title="Score Sections" value={`${summary.scoreSections.completedToday}/${summary.scoreSections.totalToday}`} sub="Today completion" />
        <Card title="Total Income" value={money(summary.finance.totalIncome)} sub="Finance summary" />
        <Card title="Total Expense" value={money(summary.finance.totalExpense)} sub="Finance summary" />
        <Card title="Total Savings" value={money(summary.finance.totalSavings)} sub="Finance summary" />
        <Card title="Available Balance" value={money(summary.finance.availableBalance)} sub="Current balance" />
        <Card title="Loan Debt" value={money(summary.finance.loanDebt)} sub="Outstanding debt" />
        <Card title="Loans" value={`${summary.loans.active}/${summary.loans.total}`} sub="Active / total" />
        <Card title="Lending" value={`${summary.lending.active}/${summary.lending.total}`} sub="Active / total" />
      </section>
    </div>
  );
}
