"use client";

import { motion } from "framer-motion";
import { AlertCircle, CheckCircle, DollarSign } from "lucide-react";
import type { ExternalDebt } from "@/types/money";

interface ExternalDebtsPanelProps {
  debts: ExternalDebt[];
}

export default function ExternalDebtsPanel({ debts }: ExternalDebtsPanelProps) {
  const totalLiability = debts.reduce((sum, debt) => sum + debt.totalAmount, 0);
  const totalRemaining = debts.reduce(
    (sum, debt) => sum + debt.remainingAmount,
    0,
  );

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden h-fit"
    >
      {/* Header */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
          Debts I Owe
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Money you owe to creditors
        </p>
      </div>

      {/* Summary Stats */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-700 space-y-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
            Total Liability
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            ${totalLiability.toFixed(0)}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
            Still Owed
          </p>
          <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
            ${totalRemaining.toFixed(0)}
          </p>
        </div>
      </div>

      {/* Debts List */}
      <motion.div variants={container} initial="hidden" animate="show">
        {debts.length === 0 ? (
          <div className="p-6 text-center">
            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-slate-600 dark:text-slate-400">
              No external debts
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {debts.map((debt) => {
              const percentagePaid = (
                ((debt.totalAmount - debt.remainingAmount) /
                  debt.totalAmount) *
                100
              ).toFixed(0);

              return (
                <motion.div
                  key={debt._id}
                  variants={item}
                  className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white">
                        {debt.creditorName}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        {debt.isCleared ? "✓ Cleared" : "Ongoing"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900 dark:text-white">
                        ${debt.totalAmount.toFixed(0)}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Total
                      </p>
                    </div>
                  </div>

                  {/* Remaining Amount */}
                  {!debt.isCleared && (
                    <div className="text-right mb-2">
                      <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                        ${debt.remainingAmount.toFixed(0)} remaining
                      </p>
                    </div>
                  )}

                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: debt.isCleared ? "100%" : `${percentagePaid}%`,
                      }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                      className={`h-full rounded-full ${
                        debt.isCleared
                          ? "bg-green-500"
                          : "bg-gradient-to-r from-orange-500 to-red-500"
                      }`}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
