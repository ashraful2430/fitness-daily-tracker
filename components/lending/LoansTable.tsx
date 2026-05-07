"use client";

import { motion } from "framer-motion";
import { Check, Trash2 } from "lucide-react";
import type { LoanRecord } from "@/types/money";

interface Props {
  loans: LoanRecord[];
  onPay: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function LoansTable({ loans, onPay, onDelete }: Props) {
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
                Amount
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
            {loans.map((loan) => (
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
                <td className="max-w-[180px] truncate px-5 py-4 text-slate-600 dark:text-slate-300">
                  {loan.reason}
                </td>
                <td className="px-5 py-4 text-slate-500 dark:text-slate-400">
                  {new Date(loan.date).toLocaleDateString()}
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      loan.status === "PAID"
                        ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300"
                        : "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300"
                    }`}
                  >
                    {loan.status}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-2">
                    {loan.status === "ACTIVE" && (
                      <button
                        onClick={() => void onPay(loan._id)}
                        className="rounded-lg border border-green-200 bg-green-50 p-1.5 text-green-700 transition hover:bg-green-100 dark:border-green-500/20 dark:bg-green-500/10 dark:text-green-300 dark:hover:bg-green-500/20"
                        title="Mark as Paid"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => void onDelete(loan._id)}
                      className="rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-red-500/10 dark:hover:text-red-300"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
