"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, AlertTriangle } from "lucide-react";
import type { FundingSource } from "@/types/money";
import { ApiError } from "@/lib/api";

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

type FormErrors = Partial<Record<"personName" | "amount" | "fundingSource" | "date", string>>;
const fieldNames = ["personName", "amount", "fundingSource", "date"] as const;

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
      } catch (error) {
        if (
          error instanceof ApiError &&
          fieldNames.includes(error.field as (typeof fieldNames)[number])
        ) {
          const field = error.field as keyof FormErrors;
          setErrors({ [field]: error.message });
        }
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
            className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:p-6"
          >
            <div className="max-h-[calc(100vh-1.5rem)] w-full max-w-md overflow-hidden rounded-[22px] border border-slate-200/80 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.28)] ring-1 ring-white/70 dark:border-white/10 dark:bg-slate-900 dark:ring-white/5 dark:shadow-[0_28px_90px_rgba(0,0,0,0.55)]">
              <div className="flex items-center justify-between border-b border-slate-200/80 bg-slate-50/90 px-5 py-5 dark:border-white/10 dark:bg-white/[0.04] sm:px-6">
                <h2 className="text-xl font-bold leading-tight text-slate-950 dark:text-white">
                  Add Lending Record
                </h2>
                <button
                  onClick={handleClose}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white/90 text-slate-500 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 active:scale-95 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:border-white/20 dark:hover:bg-white/10 dark:hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form
                onSubmit={(e) => void handleSubmit(e)}
                className="max-h-[calc(100vh-6.5rem)] space-y-4 overflow-y-auto p-5 sm:p-6"
              >
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Person Name *
                  </label>
                  <input
                    type="text"
                    value={personName}
                    onChange={(e) => setPersonName(e.target.value)}
                    placeholder="Who did you lend money to?"
                    className={`h-[52px] w-full rounded-xl border bg-white px-4 text-base text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:bg-slate-950/40 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-400 dark:focus:ring-blue-400/10 ${
                      errors.personName
                        ? "border-rose-500"
                        : "border-slate-300 dark:border-white/10"
                    }`}
                  />
                  {errors.personName && (
                    <p className="mt-1.5 text-xs font-medium text-rose-500">
                      {errors.personName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Amount *
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    min="0.01"
                    step="0.01"
                    className={`h-[52px] w-full rounded-xl border bg-white px-4 text-base text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:bg-slate-950/40 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-400 dark:focus:ring-blue-400/10 ${
                      errors.amount
                        ? "border-rose-500"
                        : "border-slate-300 dark:border-white/10"
                    }`}
                  />
                  {errors.amount && (
                    <p className="mt-1.5 text-xs font-medium text-rose-500">{errors.amount}</p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Funding Source *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["PERSONAL", "BORROWED"] as FundingSource[]).map((src) => (
                      <button
                        key={src}
                        type="button"
                        onClick={() => setFundingSource(src)}
                        className={`min-h-[52px] rounded-xl border text-sm font-semibold shadow-sm transition active:scale-[0.98] ${
                          fundingSource === src
                            ? src === "PERSONAL"
                              ? "border-blue-500 bg-blue-50 text-blue-700 ring-4 ring-blue-500/10 dark:bg-blue-500/15 dark:text-blue-200 dark:ring-blue-400/10"
                              : "border-amber-500 bg-amber-50 text-amber-700 ring-4 ring-amber-500/10 dark:bg-amber-500/15 dark:text-amber-200 dark:ring-amber-400/10"
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300 dark:hover:bg-white/[0.07]"
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
                    className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-400/20 dark:bg-amber-400/10"
                  >
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                    <p className="text-xs font-medium leading-5 text-amber-700 dark:text-amber-200">
                      This will also create a loan debt entry on your behalf.
                    </p>
                  </motion.div>
                )}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Date{" "}
                    <span className="font-medium text-slate-400">(optional)</span>
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="h-[52px] w-full rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-950 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-slate-950/40 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400/10"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="min-h-[52px] rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 active:scale-[0.98] disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(37,99,235,0.24)] transition hover:-translate-y-px hover:brightness-105 active:scale-[0.98] disabled:translate-y-0 disabled:opacity-60"
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
