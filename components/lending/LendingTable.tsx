"use client";

import { motion } from "framer-motion";
import { CheckCheck, Trash2 } from "lucide-react";
import type { LendingRecord } from "@/types/money";

interface Props {
  lendings: LendingRecord[];
  onMarkRepaid: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function LendingTable({
  lendings,
  onMarkRepaid,
  onDelete,
}: Props) {
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
            {lendings.map((record) => (
              <tr
                key={record._id}
                className="transition hover:bg-slate-50 dark:hover:bg-white/[0.03]"
              >
                <td className="px-5 py-4 font-medium text-slate-900 dark:text-white">
                  {record.personName}
                </td>
                <td className="px-5 py-4 text-right font-bold text-slate-900 dark:text-white">
                  ${record.amount.toLocaleString()}
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      record.fundingSource === "PERSONAL"
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
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
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      record.status === "REPAID"
                        ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300"
                        : "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300"
                    }`}
                  >
                    {record.status}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-2">
                    {record.status === "ACTIVE" && (
                      <button
                        onClick={() => void onMarkRepaid(record._id)}
                        className="rounded-lg border border-green-200 bg-green-50 p-1.5 text-green-700 transition hover:bg-green-100 dark:border-green-500/20 dark:bg-green-500/10 dark:text-green-300 dark:hover:bg-green-500/20"
                        title="Mark as Repaid"
                      >
                        <CheckCheck className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => void onDelete(record._id)}
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
