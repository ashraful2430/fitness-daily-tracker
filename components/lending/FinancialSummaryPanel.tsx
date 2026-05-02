"use client";

import {
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
} from "lucide-react";
import { motion } from "framer-motion";
import type { FinancialSummary } from "@/types/money";

interface FinancialSummaryPanelProps {
  summary: FinancialSummary | null;
}

export default function FinancialSummaryPanel({
  summary,
}: FinancialSummaryPanelProps) {
  if (!summary) return null;

  const statCards = [
    {
      label: "Personal Balance",
      value: summary.personalBalance,
      icon: Wallet,
      color: "blue",
      textColor: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      label: "Total Lent",
      value: summary.totalLent,
      icon: TrendingUp,
      color: "green",
      textColor: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-900/20",
    },
    {
      label: "Outstanding Loans",
      value: summary.totalOutstandingLoans,
      icon: TrendingDown,
      color: "orange",
      textColor: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
    },
    {
      label: "Borrowed Liability",
      value: summary.totalBorrowedLiability,
      icon: DollarSign,
      color: "red",
      textColor: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-50 dark:bg-red-900/20",
    },
    {
      label: "Net Position",
      value: summary.netPosition,
      icon: BarChart3,
      color: summary.netPosition >= 0 ? "green" : "red",
      textColor:
        summary.netPosition >= 0
          ? "text-green-600 dark:text-green-400"
          : "text-red-600 dark:text-red-400",
      bgColor:
        summary.netPosition >= 0
          ? "bg-green-50 dark:bg-green-900/20"
          : "bg-red-50 dark:bg-red-900/20",
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"
    >
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            variants={item}
            className={`${stat.bgColor} rounded-lg p-4 border border-slate-200 dark:border-slate-700`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  {stat.label}
                </p>
                <p className={`text-2xl font-bold mt-2 ${stat.textColor}`}>
                  ${Math.abs(stat.value ?? 0).toFixed(0)}
                </p>
              </div>
              <Icon className={`w-5 h-5 ${stat.textColor} flex-shrink-0`} />
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
