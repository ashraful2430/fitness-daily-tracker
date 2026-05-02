"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronDown,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import type { Loan, LendingTransaction } from "@/types/money";

interface LoanDetailsModalProps {
  isOpen: boolean;
  loan: Loan | null;
  transactions: LendingTransaction[];
  onClose: () => void;
  onRepayClick: () => void;
}

export default function LoanDetailsModal({
  isOpen,
  loan,
  transactions,
  onClose,
  onRepayClick,
}: LoanDetailsModalProps) {
  if (!loan) return null;

  const getStatusIcon = () => {
    switch (loan.status) {
      case "ACTIVE":
        return <Clock className="w-5 h-5 text-blue-500" />;
      case "PARTIALLY_PAID":
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      case "CLOSED":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (loan.status) {
      case "ACTIVE":
        return "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20";
      case "PARTIALLY_PAID":
        return "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20";
      case "CLOSED":
        return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20";
      default:
        return "";
    }
  };

  const getStatusLabel = () => {
    switch (loan.status) {
      case "ACTIVE":
        return "Active";
      case "PARTIALLY_PAID":
        return "Partially Paid";
      case "CLOSED":
        return "Closed";
      default:
        return loan.status;
    }
  };

  const percentagePaid = (loan.totalRepaid / loan.amount) * 100;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg max-h-[90vh] overflow-y-auto z-50"
          >
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Loan Details
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Borrower & Status */}
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    {loan.borrowerName}
                  </h3>
                  <div
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${getStatusColor()}`}
                  >
                    {getStatusIcon()}
                    <span className="text-sm font-medium">
                      {getStatusLabel()}
                    </span>
                  </div>
                </div>

                {/* Loan Amount Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <p className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                      Total Amount
                    </p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      ${loan.amount.toFixed(0)}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <p className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                      Type
                    </p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {loan.sourceType === "PERSONAL" ? "Personal" : "Borrowed"}
                    </p>
                  </div>
                </div>

                {/* Progress */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Repayment Progress
                    </p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {percentagePaid.toFixed(0)}%
                    </p>
                  </div>
                  <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentagePaid}%` }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                    />
                  </div>
                </div>

                {/* Repayment Summary */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">
                      Repaid
                    </p>
                    <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
                      ${loan.totalRepaid.toFixed(0)}
                    </p>
                  </div>
                  <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <p className="text-xs text-orange-600 dark:text-orange-400 mb-1">
                      Remaining
                    </p>
                    <p className="text-lg font-bold text-orange-900 dark:text-orange-100">
                      ${loan.remainingAmount.toFixed(0)}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                      Created
                    </p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">
                      {formatDate(loan.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Metadata */}
                {loan.borrowedFromName && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                    <p className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                      Borrowed From
                    </p>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {loan.borrowedFromName}
                    </p>
                  </div>
                )}

                {loan.note && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                    <p className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                      Note
                    </p>
                    <p className="text-slate-900 dark:text-white">
                      {loan.note}
                    </p>
                  </div>
                )}

                {/* Transaction History */}
                <div>
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                    Transaction History
                  </h4>
                  <div className="space-y-2">
                    {transactions.length === 0 ? (
                      <p className="text-sm text-slate-600 dark:text-slate-400 text-center py-4">
                        No transactions yet
                      </p>
                    ) : (
                      transactions.map((transaction) => (
                        <div
                          key={transaction._id}
                          className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-full ${
                                transaction.type === "DISBURSEMENT"
                                  ? "bg-green-100 dark:bg-green-900/30"
                                  : "bg-blue-100 dark:bg-blue-900/30"
                              }`}
                            >
                              {transaction.type === "DISBURSEMENT" ? (
                                <ArrowDownLeft className="w-4 h-4 text-green-600 dark:text-green-400" />
                              ) : (
                                <ArrowUpRight className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900 dark:text-white">
                                {transaction.type === "DISBURSEMENT"
                                  ? "Loan Disbursed"
                                  : "Repayment"}
                              </p>
                              <p className="text-xs text-slate-600 dark:text-slate-400">
                                {formatDate(transaction.createdAt)}
                              </p>
                            </div>
                          </div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">
                            ${transaction.amount.toFixed(0)}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                {loan.status !== "CLOSED" && (
                  <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        onRepayClick();
                        onClose();
                      }}
                      className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
                    >
                      Process Repayment
                    </motion.button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
