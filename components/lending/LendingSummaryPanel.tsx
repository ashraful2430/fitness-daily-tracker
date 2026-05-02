"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { HandCoins, ArrowRight, Loader2 } from "lucide-react";
import { useLending } from "@/hooks/useLending";

export default function LendingSummaryPanel() {
  const lending = useLending();

  // Normalize values to strict numbers
  const totalLent = lending.summary?.totalLent ?? 0;
  const totalOutstanding = lending.summary?.totalOutstandingLoans ?? 0;

  if (lending.isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60 dark:border-white/[0.08] dark:bg-[#120d27] dark:shadow-black/30 h-[220px] flex items-center justify-center"
      >
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60 dark:border-white/[0.08] dark:bg-[#120d27] dark:shadow-black/30"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/35 to-transparent" />
      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 opacity-15 blur-3xl" />

      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[1.15rem] bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg shadow-slate-900/10">
            <HandCoins className="h-5 w-5" />
          </div>
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">
            Lending Manager
          </p>
          <p className="mt-2 text-2xl font-black tracking-[-0.03em] text-slate-950 dark:text-white">
            {lending.loans.length} Active
          </p>
        </div>

        <Link
          href="/lending"
          className="inline-flex items-center justify-center rounded-lg px-3 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10 transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30">
          <p className="text-xs text-green-600 dark:text-green-400 font-semibold mb-1">
            Total Lent
          </p>
          <p className="text-lg font-bold text-green-900 dark:text-green-100">
            ${totalLent.toFixed(0)}
          </p>
        </div>

        <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/30">
          <p className="text-xs text-orange-600 dark:text-orange-400 font-semibold mb-1">
            Outstanding
          </p>
          <p className="text-lg font-bold text-orange-900 dark:text-orange-100">
            ${totalOutstanding.toFixed(0)}
          </p>
        </div>
      </div>

      <p className="mt-4 text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">
        Manage your loans and track lending activities
      </p>
    </motion.div>
  );
}
