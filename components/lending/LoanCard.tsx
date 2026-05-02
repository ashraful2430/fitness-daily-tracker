"use client";

import { motion } from "framer-motion";
import { ChevronRight, CheckCircle, AlertCircle, Clock } from "lucide-react";
import type { Loan } from "@/types/money";

interface LoanCardProps {
  loan: Loan;
  onClick: () => void;
}

export default function LoanCard({ loan, onClick }: LoanCardProps) {
  // Normalize numeric values
  const amount = loan.amount ?? 0;
  const totalRepaid = loan.totalRepaid ?? 0;
  const remainingAmount = loan.remainingAmount ?? 0;

  // Safe percentage calculation
  const percentagePaid = amount > 0 ? (totalRepaid / amount) * 100 : 0;

  const getStatusIcon = () => {
    switch (loan.status) {
      case "ACTIVE":
        return <Clock className="w-4 h-4 text-blue-500" />;
      case "PARTIALLY_PAID":
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case "CLOSED":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (loan.status) {
      case "ACTIVE":
        return "text-blue-600 dark:text-blue-400";
      case "PARTIALLY_PAID":
        return "text-orange-600 dark:text-orange-400";
      case "CLOSED":
        return "text-green-600 dark:text-green-400";
      default:
        return "text-slate-600 dark:text-slate-400";
    }
  };

  const getStatusLabel = () => {
    switch (loan.status) {
      case "ACTIVE":
        return "Active";
      case "PARTIALLY_PAID":
        return "Partial";
      case "CLOSED":
        return "Completed";
      default:
        return loan.status;
    }
  };

  return (
    <motion.button
      whileHover={{ backgroundColor: "rgba(255,255,255,0.04)" }}
      onClick={onClick}
      className="w-full p-6 text-left transition-all rounded-xl hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/50"
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white truncate">
              {loan.borrower}
            </h3>

            <div
              className={`flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 ${getStatusColor()}`}
            >
              {getStatusIcon()}
              <span className="text-xs font-medium uppercase">
                {getStatusLabel()}
              </span>
            </div>
          </div>

          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              ${amount.toFixed(0)}
            </span>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Loaned
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentagePaid}%` }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
            />
          </div>

          {/* Stats Row */}
          <div className="flex gap-6 text-sm">
            <div>
              <p className="text-slate-600 dark:text-slate-400">Repaid</p>
              <p className="font-semibold text-slate-900 dark:text-white">
                ${totalRepaid.toFixed(0)}
              </p>
            </div>

            <div>
              <p className="text-slate-600 dark:text-slate-400">Remaining</p>
              <p className="font-semibold text-slate-900 dark:text-white">
                ${remainingAmount.toFixed(0)}
              </p>
            </div>

            <div>
              <p className="text-slate-600 dark:text-slate-400">Type</p>
              <p className="font-semibold text-slate-900 dark:text-white">
                {loan.sourceType === "PERSONAL" ? "Personal" : "Borrowed"}
              </p>
            </div>
          </div>
        </div>

        {/* Right Arrow */}
        <motion.div
          whileHover={{ x: 4 }}
          className="flex-shrink-0 text-slate-400 dark:text-slate-500 mt-1"
        >
          <ChevronRight className="w-5 h-5" />
        </motion.div>
      </div>
    </motion.button>
  );
}
