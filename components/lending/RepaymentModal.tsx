"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { lendingAPI } from "@/lib/api";
import type { Loan } from "@/types/money";

interface RepaymentModalProps {
  isOpen: boolean;
  loan: Loan | null;
  isProcessing: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type FormErrors = Record<string, string>;

export default function RepaymentModal({
  isOpen,
  loan,
  isProcessing,
  onClose,
  onSuccess,
}: RepaymentModalProps) {
  const [amount, setAmount] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens with new loan
  useEffect(() => {
    if (isOpen && loan) {
      setAmount("");
      setErrors({});
    }
  }, [isOpen, loan]);

  const validateForm = useCallback((): boolean => {
    if (!loan) return false;

    const newErrors: FormErrors = {};

    if (!amount) {
      newErrors.amount = "Repayment amount is required";
    } else {
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        newErrors.amount = "Repayment amount must be greater than zero";
      } else if (numAmount > loan.remainingAmount) {
        newErrors.amount = `Repayment amount cannot exceed remaining balance ($${loan.remainingAmount.toFixed(0)})`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [loan, amount]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!loan || !validateForm()) {
        return;
      }

      setIsSubmitting(true);

      try {
        await lendingAPI.repayLoan(loan._id, {
          repaymentAmount: parseFloat(amount),
        });

        toast.success("Repayment processed successfully!");
        setAmount("");
        setErrors({});
        onClose();
        onSuccess();
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to process repayment";
        toast.error(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    },
    [loan, validateForm, amount, onClose, onSuccess],
  );

  if (!loan) return null;

  const willBeClosed = parseFloat(amount) === loan.remainingAmount;

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
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
          >
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Process Repayment
                </h2>
                <button
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Loan Info */}
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                    Borrower
                  </p>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
                    {loan.borrowerName}
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                        Loan Amount
                      </p>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        ${loan.amount.toFixed(0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                        Already Repaid
                      </p>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        ${loan.totalRepaid.toFixed(0)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Remaining Amount */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                    Remaining Balance
                  </label>
                  <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                      ${loan.remainingAmount.toFixed(0)}
                    </p>
                  </div>
                </div>

                {/* Repayment Amount */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                    Repayment Amount *
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    max={loan.remainingAmount}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      errors.amount
                        ? "border-red-500"
                        : "border-slate-300 dark:border-slate-600"
                    } bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {errors.amount && (
                    <p className="mt-1 text-sm text-red-500">{errors.amount}</p>
                  )}
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Max: ${loan.remainingAmount.toFixed(0)}
                  </p>
                </div>

                {/* Status Preview */}
                {amount && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">
                      Status After Repayment
                    </p>
                    <p className="font-semibold text-blue-900 dark:text-blue-100">
                      {willBeClosed ? "Loan will be CLOSED" : "Loan will remain PARTIALLY_PAID"}
                    </p>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isSubmitting || isProcessing}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isSubmitting || isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Process Repayment"
                    )}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
