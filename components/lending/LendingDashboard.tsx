"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  AlertCircle,
  Loader2,
  Wallet,
  TrendingDown,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import { useLoansLending } from "@/hooks/useLoansLending";
import LoansTable from "./LoansTable";
import LendingTable from "./LendingTable";
import AddLoanModal from "./AddLoanModal";
import AddLendingModal from "./AddLendingModal";
import { normalizeFinanceSummary } from "@/lib/financeSummary";

type Tab = "loans" | "lending";

export default function LendingDashboard() {
  const {
    loans,
    lendings,
    summary,
    isLoading,
    error,
    createLoan,
    payLoan,
    deleteLoan,
    createLending,
    markRepaid,
    deleteLending,
  } = useLoansLending();

  const [tab, setTab] = useState<Tab>("loans");
  const [showAddLoan, setShowAddLoan] = useState(false);
  const [showAddLending, setShowAddLending] = useState(false);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-[#09090f]">
        <Loader2 className="h-9 w-9 animate-spin text-blue-500" />
      </div>
    );
  }

  const finance = normalizeFinanceSummary(summary);
  const netBalance = finance.netBalance;

  const summaryCards = [
    {
      label: "Available Balance",
      value: finance.availableBalance,
      subtitle: `Accounts: $${finance.balanceAccounts.toLocaleString()}`,
      Icon: Wallet,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-500/10",
    },
    {
      label: "Loan Debt",
      value: finance.loanDebt,
      subtitle: `Direct $${finance.directLoans.toLocaleString()} + linked $${finance.borrowedLendingLoans.toLocaleString()}`,
      Icon: TrendingDown,
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-500/10",
    },
    {
      label: "Lending Outstanding",
      value: finance.lendingOutstanding,
      subtitle: `Open lending: $${finance.lending.toLocaleString()}`,
      Icon: TrendingUp,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-500/10",
    },
    {
      label: "Net Balance",
      value: netBalance,
      subtitle: "Available minus debt.",
      Icon: DollarSign,
      color:
        netBalance >= 0
          ? "text-green-600 dark:text-green-400"
          : "text-red-600 dark:text-red-400",
      bg:
        netBalance >= 0
          ? "bg-green-50 dark:bg-green-500/10"
          : "bg-red-50 dark:bg-red-500/10",
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-950 dark:bg-[#09090f] dark:text-white">
      {/* Background glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-500/20 via-cyan-400/10 to-transparent blur-3xl sm:w-[720px]" />
        <div className="absolute top-64 -left-24 h-[320px] w-[320px] rounded-full bg-gradient-to-b from-blue-500/15 to-transparent blur-2xl" />
        <div className="absolute bottom-0 right-0 h-[420px] w-[520px] rounded-full bg-gradient-to-t from-cyan-400/10 to-transparent blur-3xl" />
      </div>

      <div className="relative px-4 py-6 sm:p-6 md:p-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-black tracking-[-0.04em] sm:text-4xl md:text-5xl">
                Loans & Lending
              </h1>
              <p className="text-slate-600 dark:text-slate-300/80">
                Track what you owe and what others owe you.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowAddLoan(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/20"
              >
                <Plus className="h-4 w-4" />
                Add Loan
              </button>
              <button
                onClick={() => setShowAddLending(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-lg transition hover:brightness-105"
              >
                <Plus className="h-4 w-4" />
                Add Lending
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-500/20 dark:bg-red-500/10"
            >
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-300" />
              <p className="text-sm text-red-700 dark:text-red-100/80">
                {error}
              </p>
            </motion.div>
          )}

          {/* Finance Summary Cards */}
          <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {summaryCards.map((card) => (
              <motion.div
                key={card.label}
                whileHover={{ y: -2 }}
                className="rounded-2xl border border-slate-200 bg-white/80 p-5 backdrop-blur-xl dark:border-white/10 dark:bg-white/5"
              >
                <div className="mb-3 flex items-center gap-2">
                  <span className={`rounded-lg p-1.5 ${card.bg}`}>
                    <card.Icon className={`h-4 w-4 ${card.color}`} />
                  </span>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {card.label}
                  </p>
                </div>
                <p className={`text-2xl font-black tracking-tight ${card.color}`}>
                  {card.value < 0 ? "-" : ""}$
                  {Math.abs(card.value).toLocaleString()}
                </p>
                <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                  {card.subtitle}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="mb-8 grid gap-3 rounded-2xl border border-slate-200 bg-white/80 p-4 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 sm:grid-cols-2 lg:grid-cols-6">
            {[
              ["Salary", finance.salary],
              ["External Income", finance.externalIncome],
              ["Savings", finance.savings],
              ["Active Loans", finance.activeLoans],
              ["Repaid Loans", finance.repaidLoans],
              ["Personal Lending", finance.lendingFromPersonal],
            ].map(([label, value]) => (
              <div key={label} className="min-w-0">
                <p className="truncate text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {label}
                </p>
                <p className="mt-1 text-base font-black text-slate-950 dark:text-white">
                  ${(value as number).toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="mb-6 flex gap-1 rounded-xl border border-slate-200 bg-slate-100/80 p-1 dark:border-white/10 dark:bg-white/5">
            {(["loans", "lending"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
                  tab === t
                    ? "bg-white text-slate-900 shadow dark:bg-white/10 dark:text-white"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                {t === "loans"
                  ? `My Loans (${loans.length})`
                  : `My Lending (${lendings.length})`}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {tab === "loans" ? (
              <LoansTable
                key="loans"
                loans={loans}
                availableBalance={finance.availableBalance}
                onPay={(id, amount) => payLoan(id, amount)}
                onDelete={deleteLoan}
              />
            ) : (
              <LendingTable
                key="lending"
                lendings={lendings}
                onMarkRepaid={(id, amount) => markRepaid(id, amount)}
                onDelete={deleteLending}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      <AddLoanModal
        isOpen={showAddLoan}
        onClose={() => setShowAddLoan(false)}
        onSuccess={async () => setShowAddLoan(false)}
        onCreate={createLoan}
      />
      <AddLendingModal
        isOpen={showAddLending}
        onClose={() => setShowAddLending(false)}
        onSuccess={async () => setShowAddLending(false)}
        onCreate={createLending}
      />
    </div>
  );
}
