"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, AlertTriangle } from "lucide-react";
import type { FundingSource } from "@/types/money";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>;
  onCreate: (payload: {
    personName: string;
    amount: number;
    fundingSource: FundingSource;
    date?: string;
  }) => Promise<void>;
}

type FormErrors = Partial<Record<"personName" | "amount", string>>;

export default function AddLendingModal({
  isOpen,
  onClose,
  onSuccess,
  onCreate,
}: Props) {
  const [personName, setPersonName] = useState("");
  const [amount, setAmount] = useState("");
  const [fundingSource, setFundingSource] = useState<FundingSource>("PERSONAL");
  const [date, setDate] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = useCallback((): boolean => {
    const next: FormErrors = {};
    if (!personName.trim()) next.personName = "Person name is required";
    const num = parseFloat(amount);
    if (!amount || isNaN(num) || num <= 0)
      next.amount = "Amount must be greater than 0";
    setErrors(next);
    return Object.keys(next).length === 0;
  }, [personName, amount]);

  const reset = useCallback(() => {
    setPersonName("");
    setAmount("");
    setFundingSource("PERSONAL");
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
          fundingSource,
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
    [validate, onCreate, personName, amount, fundingSource, date, reset, onSuccess],
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
              <div className="flex items-center justify-between border-b border-slate-200 bg-blue-50 px-6 py-4 dark:border-white/10 dark:bg-blue-500/10">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Add Lending Record
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
                    placeholder="Who did you lend money to?"
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
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Funding Source *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["PERSONAL", "BORROWED"] as FundingSource[]).map((src) => (
                      <button
                        key={src}
                        type="button"
                        onClick={() => setFundingSource(src)}
                        className={`rounded-xl border py-2.5 text-sm font-semibold transition ${
                          fundingSource === src
                            ? src === "PERSONAL"
                              ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300"
                              : "border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
                            : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/5"
                        }`}
                      >
                        {src === "PERSONAL" ? "Personal" : "Borrowed"}
                      </button>
                    ))}
                  </div>
                </div>

                {fundingSource === "BORROWED" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-500/20 dark:bg-amber-500/10"
                  >
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      This will also create a loan debt entry on your behalf.
                    </p>
                  </motion.div>
                )}

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
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 py-2.5 text-sm font-semibold text-white transition hover:brightness-105 disabled:opacity-50"
                  >
                    {isSubmitting && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    {isSubmitting ? "Adding..." : "Add Record"}
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
