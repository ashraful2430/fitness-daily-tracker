"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  CheckCircle,
  AlertCircle,
  Clock,
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
  if (!isOpen || !loan) return null;

  // Safe values
  const amount = loan.amount ?? 0;
  const totalRepaid = loan.totalRepaid ?? 0;
  const remainingAmount = loan.remainingAmount ?? 0;

  const percentagePaid = amount > 0 ? (totalRepaid / amount) * 100 : 0;

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
        return "text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700";
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
            className="fixed inset-0 bg-black/60 z-40"
          />

          {/* Modal wrapper */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-xl max-h-[90vh] overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-900">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Loan Details
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-5 overflow-y-auto space-y-5">
                {/* Borrower */}
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {loan.borrower}
                  </h3>

                  <div
                    className={`inline-flex items-center gap-2 px-3 py-1 mt-2 rounded-full ${getStatusColor()}`}
                  >
                    {getStatusIcon()}
                    <span className="text-sm font-medium">
                      {getStatusLabel()}
                    </span>
                  </div>
                </div>

                {/* Amounts */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800">
                    <p className="text-xs text-slate-500">Total</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">
                      ${amount.toFixed(0)}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800">
                    <p className="text-xs text-slate-500">Type</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">
                      {loan.sourceType === "PERSONAL" ? "Personal" : "Borrowed"}
                    </p>
                  </div>
                </div>

                {/* Progress */}
                <div>
                  <div className="flex justify-between mb-1">
                    <p className="text-sm text-slate-500">Progress</p>
                    <p className="text-sm font-semibold">
                      {percentagePaid.toFixed(0)}%
                    </p>
                  </div>

                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500"
                      style={{ width: `${percentagePaid}%` }}
                    />
                  </div>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded">
                    <p className="text-xs">Repaid</p>
                    <p className="font-bold">${totalRepaid.toFixed(0)}</p>
                  </div>

                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded">
                    <p className="text-xs">Remaining</p>
                    <p className="font-bold">${remainingAmount.toFixed(0)}</p>
                  </div>

                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded">
                    <p className="text-xs">Created</p>
                    <p className="font-bold text-xs">
                      {formatDate(loan.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Transactions */}
                <div>
                  <h4 className="font-semibold mb-2">Transactions</h4>

                  <div className="space-y-2">
                    {transactions.length === 0 ? (
                      <p className="text-sm text-slate-500">
                        No transactions yet
                      </p>
                    ) : (
                      transactions.map((t) => (
                        <div
                          key={t._id}
                          className="flex justify-between p-2 rounded bg-slate-100 dark:bg-slate-800"
                        >
                          <p className="text-sm">
                            {t.type === "DISBURSEMENT" ? "Loan" : "Repayment"}
                          </p>
                          <p className="font-semibold">
                            ${t.amount.toFixed(0)}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Action */}
                {loan.status !== "CLOSED" && (
                  <button
                    onClick={() => {
                      onRepayClick();
                      onClose();
                    }}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                  >
                    Process Repayment
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
