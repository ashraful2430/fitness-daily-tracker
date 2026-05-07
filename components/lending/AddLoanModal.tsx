"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>;
  onCreate: (payload: {
    personName: string;
    amount: number;
    reason: string;
    date?: string;
  }) => Promise<void>;
}

type FormErrors = Partial<Record<"personName" | "amount" | "reason", string>>;

export default function AddLoanModal({
  isOpen,
  onClose,
  onSuccess,
  onCreate,
}: Props) {
  const [personName, setPersonName] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [date, setDate] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = useCallback((): boolean => {
    const next: FormErrors = {};
    if (!personName.trim()) next.personName = "Person name is required";
    const num = parseFloat(amount);
    if (!amount || isNaN(num) || num <= 0)
      next.amount = "Amount must be greater than 0";
    if (!reason.trim()) next.reason = "Reason is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  }, [personName, amount, reason]);

  const reset = useCallback(() => {
    setPersonName("");
    setAmount("");
    setReason("");
    setDate("");
    setErrors({});
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validate()) return;
      setIsSubmitting(true);
      try {
        await onCreate({
          personName: personName.trim(),
          amount: parseFloat(amount),
          reason: reason.trim(),
          date: date || undefined,
        });
        reset();
        await onSuccess();
      } catch {
        // errors shown via toast in hook
      } finally {
        setIsSubmitting(false);
      }
    },
    [validate, onCreate, personName, amount, reason, date, reset, onSuccess],
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 px-4"
          >
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white shadow-2xl dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-200 bg-red-50 px-6 py-4 dark:border-white/10 dark:bg-red-500/10">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Add Loan
                </h2>
                <button
                  onClick={handleClose}
                  className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4 p-6">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Person Name *
                  </label>
                  <input
                    type="text"
                    value={personName}
                    onChange={(e) => setPersonName(e.target.value)}
                    placeholder="Who do you owe money to?"
                    className={`w-full rounded-lg border px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500 ${
                      errors.personName
                        ? "border-red-500"
                        : "border-slate-300 dark:border-slate-600"
                    }`}
                  />
                  {errors.personName && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.personName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Amount *
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    min="0.01"
                    step="0.01"
                    className={`w-full rounded-lg border px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500 ${
                      errors.amount
                        ? "border-red-500"
                        : "border-slate-300 dark:border-slate-600"
                    }`}
                  />
                  {errors.amount && (
                    <p className="mt-1 text-xs text-red-500">{errors.amount}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Reason *
                  </label>
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Why did you borrow this money?"
                    className={`w-full rounded-lg border px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500 ${
                      errors.reason
                        ? "border-red-500"
                        : "border-slate-300 dark:border-slate-600"
                    }`}
                  />
                  {errors.reason && (
                    <p className="mt-1 text-xs text-red-500">{errors.reason}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Date{" "}
                    <span className="text-slate-400">(optional)</span>
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                  >
                    {isSubmitting && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    {isSubmitting ? "Adding..." : "Add Loan"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
