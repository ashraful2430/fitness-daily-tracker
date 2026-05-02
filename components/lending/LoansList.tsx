"use client";

import { motion } from "framer-motion";
import { Loader2, FileText } from "lucide-react";
import LoanCard from "./LoanCard";
import type { Loan } from "@/types/money";

interface LoansListProps {
  loans: Loan[];
  onSelectLoan: (loan: Loan) => void;
  isLoading?: boolean;
}

export default function LoansList({
  loans,
  onSelectLoan,
  isLoading = false,
}: LoansListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_20px_80px_-40px_rgba(34,211,238,0.35)]">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-300" />
      </div>
    );
  }

  if (loans.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-12 text-center shadow-[0_20px_80px_-40px_rgba(34,211,238,0.25)] overflow-hidden"
      >
        <FileText className="w-12 h-12 text-cyan-200 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-white mb-2">No loans yet</h3>
        <p className="text-slate-600 dark:text-slate-400">
          Create your first loan to get started tracking lending activities
        </p>
      </motion.div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden shadow-[0_20px_80px_-40px_rgba(34,211,238,0.18)]"
    >
      <div className="p-6 border-b border-slate-200 dark:border-slate-700">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          My Loans
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          {loans.length} active loan{loans.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="divide-y divide-slate-200 dark:divide-slate-700">
        {loans.map((loan) => (
          <LoanCard
            key={loan._id}
            loan={loan}
            onClick={() => onSelectLoan(loan)}
          />
        ))}
      </div>
    </motion.div>
  );
}
