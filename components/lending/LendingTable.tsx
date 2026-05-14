"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DollarSign, Loader2, Trash2, X } from "lucide-react";
import PremiumModal, {
  ModalCancelButton,
  ModalConfirmButton,
} from "@/components/ui/PremiumModal";
import type { LendingRecord } from "@/types/money";

interface Props {
  lendings: LendingRecord[];
  onMarkRepaid: (id: string, amount: number) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

function RepayModal({
  record,
  onConfirm,
  onClose,
}: {
  record: LendingRecord;
  onConfirm: (amount: number) => Promise<void>;
  onClose: () => void;
}) {
  const remaining = record.amount - (record.repaidAmount ?? 0);
  const [mode, setMode] = useState<"full" | "partial">("full");
  const [partialAmount, setPartialAmount] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const payAmount =
      mode === "full" ? remaining : parseFloat(partialAmount);

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

    setIsSubmitting(true);
    try {
      await onConfirm(payAmount);
      onClose();
    } finally {
      setIsSubmitting(false);
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
          <div className="flex items-center justify-between border-b border-slate-200 bg-blue-50 px-6 py-4 dark:border-white/10 dark:bg-blue-500/10">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Record Repayment
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
                {record.personName}
              </p>
              <div className="mt-2 flex items-baseline gap-4">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Lent Money</p>
                  <p className="text-lg font-bold text-cyan-600 dark:text-cyan-400">
                    ${record.amount.toLocaleString()}
                  </p>
                </div>
                {(record.repaidAmount ?? 0) > 0 && (
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Already repaid</p>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">
                      ${(record.repaidAmount ?? 0).toLocaleString()}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Active Lending</p>
                  <p
                    className={`text-lg font-bold ${
                      record.fundingSource === "BORROWED"
                        ? "text-rose-500 dark:text-rose-400"
                        : "text-cyan-600 dark:text-cyan-400"
                    }`}
                  >
                    ${remaining.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {(["full", "partial"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => { setMode(m); setError(""); setPartialAmount(""); }}
                  className={`rounded-xl border py-2.5 text-sm font-semibold transition ${
                    mode === m
                      ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/5"
                  }`}
                >
                  {m === "full" ? `Full ($${remaining.toLocaleString()})` : "Partial"}
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
                  onChange={(e) => { setPartialAmount(e.target.value); setError(""); }}
                  placeholder={`Max $${remaining.toLocaleString()}`}
                  min="0.01"
                  step="0.01"
                  max={remaining}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
                />
              </motion.div>
            )}

            {error && (
              <p className="text-xs text-red-500">{error}</p>
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
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 py-2.5 text-sm font-semibold text-white transition hover:brightness-105 disabled:opacity-50"
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
    <PremiumModal
      open
      onClose={onClose}
      variant="error"
      size="sm"
      title="Delete lending record"
      subtitle="Permanent action"
      description={`Delete lending record for ${personName}? This action cannot be undone.`}
      footer={
        <>
          <ModalCancelButton onClick={onClose} disabled={isDeleting} />
          <ModalConfirmButton
            onClick={() => void handleConfirm()}
            variant="error"
            disabled={isDeleting}
          >
            {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isDeleting ? "Deleting..." : "Delete record"}
          </ModalConfirmButton>
        </>
      }
    />
  );
}

const statusStyles: Record<string, string> = {
  REPAID: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300",
  PARTIALLY_REPAID: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  ACTIVE: "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300",
};

export default function LendingTable({
  lendings,
  onMarkRepaid,
  onDelete,
}: Props) {
  const [repayingRecord, setRepayingRecord] = useState<LendingRecord | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<LendingRecord | null>(null);

  if (!lendings.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white/60 py-16 text-center dark:border-white/10 dark:bg-white/5">
        <p className="text-slate-500 dark:text-slate-400">
          No lending records yet.
        </p>
        <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
          Add a record to track money others owe you.
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
                  Lent Money
                </th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Active Lending
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Source
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
              {lendings.map((record) => {
                const remaining = record.amount - (record.repaidAmount ?? 0);
                return (
                  <tr
                    key={record._id}
                    className="transition hover:bg-slate-50 dark:hover:bg-white/[0.03]"
                  >
                    <td className="px-5 py-4 font-medium text-slate-900 dark:text-white">
                      {record.personName}
                    </td>
                    <td className="px-5 py-4 text-right font-bold text-cyan-600 dark:text-cyan-400">
                      ${record.amount.toLocaleString()}
                    </td>
                    <td
                      className={`px-5 py-4 text-right font-bold ${
                        record.fundingSource === "BORROWED"
                          ? "text-rose-500 dark:text-rose-400"
                          : "text-cyan-600 dark:text-cyan-400"
                      }`}
                    >
                      {remaining > 0 ? `$${remaining.toLocaleString()}` : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          record.fundingSource === "PERSONAL"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300"
                            : "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300"
                        }`}
                      >
                        {record.fundingSource}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-500 dark:text-slate-400">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyles[record.status] ?? statusStyles.ACTIVE}`}
                      >
                        {record.status === "PARTIALLY_REPAID"
                          ? "PARTIAL"
                          : record.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {record.status !== "REPAID" && (
                          <button
                            onClick={() => setRepayingRecord(record)}
                            className="rounded-lg border border-blue-200 bg-blue-50 p-1.5 text-blue-700 transition hover:bg-blue-100 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-500/20"
                            title="Record Repayment"
                          >
                            <DollarSign className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setConfirmingDelete(record)}
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
        {repayingRecord && (
          <RepayModal
            record={repayingRecord}
            onConfirm={(amount) => onMarkRepaid(repayingRecord._id, amount)}
            onClose={() => setRepayingRecord(null)}
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
