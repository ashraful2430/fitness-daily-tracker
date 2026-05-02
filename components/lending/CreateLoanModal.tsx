"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { lendingAPI } from "@/lib/api";
import type { CreateLoanRequest, SourceType } from "@/types/money";

interface CreateLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type FormErrors = Record<string, string>;

export default function CreateLoanModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateLoanModalProps) {
  const [borrowerName, setBorrowerName] = useState("");
  const [amount, setAmount] = useState("");
  const [sourceType, setSourceType] = useState<SourceType>("PERSONAL");
  const [creditorName, setCreditorName] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!borrowerName.trim()) {
      newErrors.borrowerName = "Borrower name is required";
    } else if (borrowerName.trim().length < 2) {
      newErrors.borrowerName = "Borrower name must be at least 2 characters";
    } else if (borrowerName.trim().length > 50) {
      newErrors.borrowerName = "Borrower name cannot exceed 50 characters";
    }

    if (!amount) {
      newErrors.amount = "Amount is required";
    } else {
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        newErrors.amount = "Amount must be greater than zero";
      } else if (numAmount > 999999) {
        newErrors.amount = "Amount cannot exceed 999,999";
      }
    }

    if (sourceType === "BORROWED") {
      if (!creditorName.trim()) {
        newErrors.creditorName = "Creditor name is required when borrowing";
      } else if (creditorName.trim().length < 2) {
        newErrors.creditorName = "Creditor name must be at least 2 characters";
      } else if (creditorName.trim().length > 50) {
        newErrors.creditorName = "Creditor name cannot exceed 50 characters";
      }
    }

    if (note && note.length > 500) {
      newErrors.note = "Note cannot exceed 500 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [borrowerName, amount, sourceType, creditorName, note]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      setIsSubmitting(true);

      try {
        const payload: CreateLoanRequest = {
          borrowerName: borrowerName.trim(),
          amount: parseFloat(amount),
          sourceType,
          borrowedFromName:
            sourceType === "BORROWED" ? creditorName.trim() : undefined,
          note: note.trim() || undefined,
        };

        await lendingAPI.createLoan(payload);

        toast.success("Loan created successfully!");
        handleClose();
        onSuccess();
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to create loan";
        toast.error(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      validateForm,
      borrowerName,
      amount,
      sourceType,
      creditorName,
      note,
      onSuccess,
    ],
  );

  const handleClose = useCallback(() => {
    setBorrowerName("");
    setAmount("");
    setSourceType("PERSONAL");
    setCreditorName("");
    setNote("");
    setErrors({});
    onClose();
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
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
                  Create New Loan
                </h2>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Borrower Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                    Borrower Name *
                  </label>
                  <input
                    type="text"
                    value={borrowerName}
                    onChange={(e) => setBorrowerName(e.target.value)}
                    placeholder="Enter borrower's name"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      errors.borrowerName
                        ? "border-red-500"
                        : "border-slate-300 dark:border-slate-600"
                    } bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {errors.borrowerName && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.borrowerName}
                    </p>
                  )}
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                    Amount *
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      errors.amount
                        ? "border-red-500"
                        : "border-slate-300 dark:border-slate-600"
                    } bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {errors.amount && (
                    <p className="mt-1 text-sm text-red-500">{errors.amount}</p>
                  )}
                </div>

                {/* Funding Source */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 dark:text-white mb-3">
                    Funding Source *
                  </label>
                  <div className="space-y-2">
                    <label
                      className="flex items-center gap-3 p-3 rounded-lg border-2 border-slate-300 dark:border-slate-600 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                      style={{
                        borderColor:
                          sourceType === "PERSONAL" ? "#3b82f6" : undefined,
                        backgroundColor:
                          sourceType === "PERSONAL"
                            ? "rgba(59, 130, 246, 0.05)"
                            : undefined,
                      }}
                    >
                      <input
                        type="radio"
                        name="sourceType"
                        value="PERSONAL"
                        checked={sourceType === "PERSONAL"}
                        onChange={(e) =>
                          setSourceType(e.target.value as SourceType)
                        }
                        className="w-4 h-4"
                      />
                      <span className="text-slate-900 dark:text-white font-medium">
                        From Personal Balance
                      </span>
                    </label>

                    <label
                      className="flex items-center gap-3 p-3 rounded-lg border-2 border-slate-300 dark:border-slate-600 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                      style={{
                        borderColor:
                          sourceType === "BORROWED" ? "#3b82f6" : undefined,
                        backgroundColor:
                          sourceType === "BORROWED"
                            ? "rgba(59, 130, 246, 0.05)"
                            : undefined,
                      }}
                    >
                      <input
                        type="radio"
                        name="sourceType"
                        value="BORROWED"
                        checked={sourceType === "BORROWED"}
                        onChange={(e) =>
                          setSourceType(e.target.value as SourceType)
                        }
                        className="w-4 h-4"
                      />
                      <span className="text-slate-900 dark:text-white font-medium">
                        From Borrowed (External Debt)
                      </span>
                    </label>
                  </div>
                </div>

                {/* Creditor Name (conditional) */}
                {sourceType === "BORROWED" && (
                  <div>
                    <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                      Creditor Name *
                    </label>
                    <input
                      type="text"
                      value={creditorName}
                      onChange={(e) => setCreditorName(e.target.value)}
                      placeholder="Enter creditor's name"
                      className={`w-full px-4 py-2 rounded-lg border ${
                        errors.creditorName
                          ? "border-red-500"
                          : "border-slate-300 dark:border-slate-600"
                      } bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    {errors.creditorName && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.creditorName}
                      </p>
                    )}
                  </div>
                )}

                {/* Note */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                    Note (Optional)
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Add any additional notes..."
                    maxLength={500}
                    rows={3}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      errors.note
                        ? "border-red-500"
                        : "border-slate-300 dark:border-slate-600"
                    } bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
                  />
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {note.length}/500
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isSubmitting && (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    )}
                    {isSubmitting ? "Creating..." : "Create Loan"}
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
