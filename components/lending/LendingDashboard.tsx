"use client";

import { useCallback, useState } from "react";
import { Plus, AlertCircle, Loader2, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useLending } from "@/hooks/useLending";
import CreateLoanModal from "./CreateLoanModal";
import LoansList from "./LoansList";
import LoanDetailsModal from "./LoanDetailsModal";
import RepaymentModal from "./RepaymentModal";
import FinancialSummaryPanel from "./FinancialSummaryPanel";
import ExternalDebtsPanel from "./ExternalDebtsPanel";
import type { Loan } from "@/types/money";

export default function LendingDashboard() {
  const lending = useLending();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showLoanDetails, setShowLoanDetails] = useState(false);
  const [showRepaymentForm, setShowRepaymentForm] = useState(false);

  const handleCreateClick = useCallback(() => {
    setShowCreateForm(true);
  }, []);

  const handleCloseCreateForm = useCallback(() => {
    setShowCreateForm(false);
  }, []);

  const handleLoanSelect = useCallback(
    (loan: Loan) => {
      lending.loadLoanDetails(loan._id);
      setShowLoanDetails(true);
    },
    [lending],
  );

  const handleRepayClick = useCallback(() => {
    setShowRepaymentForm(true);
  }, []);

  const handleCloseRepaymentForm = useCallback(() => {
    setShowRepaymentForm(false);
  }, []);

  const handleCloseLoanDetails = useCallback(() => {
    setShowLoanDetails(false);
  }, []);

  const handleCreateLoanSuccess = useCallback(async () => {
    setShowCreateForm(false);
    await lending.refresh();
  }, [lending]);

  const handleRepaymentSuccess = useCallback(async () => {
    setShowRepaymentForm(false);
    await lending.refresh();
  }, [lending]);

  if (lending.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#09090f]">
        <Loader2 className="w-9 h-9 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#09090f] text-white overflow-hidden">
      {/* Background glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[420px] w-[720px] rounded-full bg-gradient-to-r from-blue-500/20 via-cyan-400/10 to-transparent blur-3xl" />
        <div className="absolute top-64 -left-24 h-[320px] w-[320px] rounded-full bg-gradient-to-b from-blue-500/15 to-transparent blur-2xl" />
        <div className="absolute bottom-0 right-0 h-[420px] w-[520px] rounded-full bg-gradient-to-t from-cyan-400/10 to-transparent blur-3xl" />
      </div>

      <div className="relative p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2">
                <span className="inline-flex items-center justify-center h-8 px-3 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl text-[12px] font-bold tracking-wide text-slate-200">
                  Premium
                </span>
                <ShieldCheck className="w-4 h-4 text-cyan-300" />
              </div>

              <h1 className="text-4xl md:text-5xl font-black tracking-[-0.04em]">
                Lending Manager
              </h1>

              <p className="text-slate-300/80 max-w-2xl">
                Track loans, monitor repayment progress, and manage external
                debts with a clean, high-trust dashboard.
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCreateClick}
              className="group inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 text-slate-900 font-semibold shadow-[0_20px_80px_-20px_rgba(34,211,238,0.45)] transition-all hover:brightness-105 active:brightness-95"
            >
              <Plus className="w-5 h-5 text-slate-900" />
              <span>Create Loan</span>
              <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity text-slate-900/80 font-bold">
                →
              </span>
            </motion.button>
          </div>

          {/* Error Banner */}
          {lending.error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-2xl border border-red-500/20 bg-red-500/10 backdrop-blur-xl flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-red-100">Error</h3>
                <p className="text-sm text-red-100/80">{lending.error}</p>
              </div>
            </motion.div>
          )}

          {/* Summary Panels */}
          <div className="mb-6">
            <FinancialSummaryPanel summary={lending.summary} />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            {/* Loans List */}
            <div className="lg:col-span-2">
              <LoansList
                loans={lending.loans}
                onSelectLoan={handleLoanSelect}
                isLoading={lending.isLoading}
              />
            </div>

            {/* External Debts */}
            <div>
              <ExternalDebtsPanel debts={lending.debts} />
            </div>
          </div>

          {/* Statistics */}
          {lending.stats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              {[
                {
                  label: "Active Loans",
                  value: lending.stats.totalActiveLoans,
                  variant: "blue",
                },
                {
                  label: "Average Loan",
                  value: `$${lending.stats.averageLoanAmount.toFixed(0)}`,
                  variant: "indigo",
                },
                {
                  label: "Total Received",
                  value: `$${lending.stats.totalMoneyReceived.toFixed(0)}`,
                  variant: "green",
                },
              ].map((stat) => (
                <motion.div
                  key={stat.label}
                  whileHover={{ y: -3 }}
                  className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 shadow-[0_20px_60px_-40px_rgba(59,130,246,0.35)]"
                >
                  <div className="text-xs font-semibold text-slate-300/70 mb-1">
                    {stat.label}
                  </div>
                  <div className="text-3xl font-black tracking-[-0.04em]">
                    {typeof stat.value === "number" ? stat.value : stat.value}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Modals */}
        <CreateLoanModal
          isOpen={showCreateForm}
          onClose={handleCloseCreateForm}
          onSuccess={handleCreateLoanSuccess}
        />

        <LoanDetailsModal
          isOpen={showLoanDetails}
          loan={lending.selectedLoan}
          transactions={lending.selectedLoanTransactions}
          onClose={handleCloseLoanDetails}
          onRepayClick={handleRepayClick}
        />

        <RepaymentModal
          isOpen={showRepaymentForm}
          loan={lending.selectedLoan}
          isProcessing={lending.isProcessingRepayment}
          onClose={handleCloseRepaymentForm}
          onSuccess={handleRepaymentSuccess}
        />
      </div>
    </div>
  );
}
