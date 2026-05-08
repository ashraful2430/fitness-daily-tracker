"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, DollarSign, Loader2, Trash2, X } from "lucide-react";
import type { LoanRecord } from "@/types/money";

interface Props {
  loans: LoanRecord[];
  availableBalance: number;
  onPay: (id: string, amount: number) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const savageMessages = [
  "Bro you're broke 💀 Top up your balance first!",
  "Your wallet said 'lol no' 😭 Go earn more!",
  "Not enough funds! Time to get that bag! 💪",
  "Your bank account just ghosted you 😂",
  "Insufficient funds! The streets are calling 🏃",
  "You can't pay what you don't have! Hustle up! 🔥",
  "Empty pockets can't write cheques, king 👑",
];

function PayModal({
  loan,
  availableBalance,
  onConfirm,
  onClose,
}: {
  loan: LoanRecord;
  availableBalance: number;
  onConfirm: (amount: number) => Promise<void>;
  onClose: () => void;
}) {
  const remaining = loan.amount - (loan.paidAmount ?? 0);
  const [mode, setMode] = useState<"full" | "partial">("full");
  const [partialAmount, setPartialAmount] = useState("");
  const [error, setError] = useState("");
  const [savageError, setSavageError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savageMsg] = useState(
    () => savageMessages[Math.floor(Math.random() * savageMessages.length)],
  );

  const handleSubmit = async () => {
    const payAmount = mode === "full" ? remaining : parseFloat(partialAmount);

    if (mode === "partial") {
      if (!partialAmount || isNaN(payAmount) || payAmount <= 0) {
        setError("Enter a valid amount greater than 0");
        return;
      }
      if (payAmount > remaining) {
        setError(`Cannot exceed remaining $${remaining.toLocaleString()}`);
        return;
      }
    }

    if (payAmount > availableBalance) {
      setSavageError(savageMsg);
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(payAmount);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetErrors = () => {
    setError("");
    setSavageError("");
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 px-4"
      >
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white shadow-2xl dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-200 bg-green-50 px-6 py-4 dark:border-white/10 dark:bg-green-500/10">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Record Payment
            </h2>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4 p-6">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {loan.personName}
              </p>
              <div className="mt-2 flex items-baseline gap-4">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Total</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">
                    ${loan.amount.toLocaleString()}
                  </p>
                </div>
                {(loan.paidAmount ?? 0) > 0 && (
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Already paid</p>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">
                      ${(loan.paidAmount ?? 0).toLocaleString()}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Remaining</p>
                  <p className="text-lg font-bold text-red-600 dark:text-red-400">
                    ${remaining.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 dark:border-white/10 dark:bg-white/5">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Your available balance
              </p>
              <p
                className={`text-sm font-black ${
                  availableBalance > 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                ${availableBalance.toLocaleString()}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {(["full", "partial"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setMode(m);
                    setPartialAmount("");
                    resetErrors();
                  }}
                  className={`rounded-xl border py-2.5 text-sm font-semibold transition ${
                    mode === m
                      ? "border-green-500 bg-green-50 text-green-700 dark:bg-green-500/20 dark:text-green-300"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/5"
                  }`}
                >
                  {m === "full"
                    ? `Pay Full ($${remaining.toLocaleString()})`
                    : "Pay Partial"}
                </button>
              ))}
            </div>

            {mode === "partial" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <input
                  type="number"
                  value={partialAmount}
                  onChange={(e) => {
                    setPartialAmount(e.target.value);
                    resetErrors();
                  }}
                  placeholder={`Max $${remaining.toLocaleString()}`}
                  min="0.01"
                  step="0.01"
                  max={remaining}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
                />
              </motion.div>
            )}

            {error && <p className="text-xs text-red-500">{error}</p>}

            {savageError && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-xl border border-red-200 bg-red-50 p-4 text-center dark:border-red-500/20 dark:bg-red-500/10"
              >
                <p className="text-sm font-black text-red-600 dark:text-red-300">
                  {savageError}
                </p>
                <p className="mt-1 text-xs text-red-500 dark:text-red-400">
                  You have ${availableBalance.toLocaleString()}, need $
                  {(mode === "full"
                    ? remaining
                    : parseFloat(partialAmount) || 0
                  ).toLocaleString()}
                </p>
              </motion.div>
            )}

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={isSubmitting}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSubmitting ? "Saving..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}

function ConfirmDeleteModal({
  personName,
  onConfirm,
  onClose,
}: {
  personName: string;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 px-4"
      >
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white shadow-2xl dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-200 bg-red-50 px-6 py-4 dark:border-white/10 dark:bg-red-500/10">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Delete Loan
            </h2>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="space-y-4 p-6">
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-500/20 dark:bg-red-500/10">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
              <p className="text-sm text-red-700 dark:text-red-300">
                Delete loan for{" "}
                <span className="font-bold">{personName}</span>? This cannot be
                undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isDeleting}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleConfirm()}
                disabled={isDeleting}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}

const statusStyles: Record<string, string> = {
  PAID: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300",
  PARTIALLY_PAID:
    "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  ACTIVE: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300",
};

export default function LoansTable({
  loans,
  availableBalance,
  onPay,
  onDelete,
}: Props) {
  const [payingLoan, setPayingLoan] = useState<LoanRecord | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<LoanRecord | null>(
    null,
  );

  if (!loans.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white/60 py-16 text-center dark:border-white/10 dark:bg-white/5">
        <p className="text-slate-500 dark:text-slate-400">
          No loans recorded yet.
        </p>
        <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
          Add a loan to track money you owe.
        </p>
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-xl dark:border-white/10 dark:bg-white/5"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10">
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Person
                </th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Total
                </th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Remaining
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Reason
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Date
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Status
                </th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {loans.map((loan) => {
                const remaining = loan.amount - (loan.paidAmount ?? 0);
                return (
                  <tr
                    key={loan._id}
                    className="transition hover:bg-slate-50 dark:hover:bg-white/[0.03]"
                  >
                    <td className="px-5 py-4 font-medium text-slate-900 dark:text-white">
                      {loan.personName}
                    </td>
                    <td className="px-5 py-4 text-right font-bold text-slate-900 dark:text-white">
                      ${loan.amount.toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-right font-bold text-red-600 dark:text-red-400">
                      {remaining > 0 ? `$${remaining.toLocaleString()}` : "—"}
                    </td>
                    <td className="max-w-[160px] truncate px-5 py-4 text-slate-600 dark:text-slate-300">
                      {loan.reason}
                    </td>
                    <td className="px-5 py-4 text-slate-500 dark:text-slate-400">
                      {new Date(loan.date).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyles[loan.status] ?? statusStyles.ACTIVE}`}
                      >
                        {loan.status === "PARTIALLY_PAID"
                          ? "PARTIAL"
                          : loan.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {loan.status !== "PAID" && (
                          <button
                            onClick={() => setPayingLoan(loan)}
                            className="rounded-lg border border-green-200 bg-green-50 p-1.5 text-green-700 transition hover:bg-green-100 dark:border-green-500/20 dark:bg-green-500/10 dark:text-green-300 dark:hover:bg-green-500/20"
                            title="Record Payment"
                          >
                            <DollarSign className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setConfirmingDelete(loan)}
                          className="rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-red-500/10 dark:hover:text-red-300"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      <AnimatePresence>
        {payingLoan && (
          <PayModal
            loan={payingLoan}
            availableBalance={availableBalance}
            onConfirm={(amount) => onPay(payingLoan._id, amount)}
            onClose={() => setPayingLoan(null)}
          />
        )}
        {confirmingDelete && (
          <ConfirmDeleteModal
            personName={confirmingDelete.personName}
            onConfirm={async () => {
              await onDelete(confirmingDelete._id);
              setConfirmingDelete(null);
            }}
            onClose={() => setConfirmingDelete(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
