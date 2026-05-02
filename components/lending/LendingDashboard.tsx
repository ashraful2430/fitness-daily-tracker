"use client";

import { useCallback, useState } from "react";
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Wallet,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import { useLending } from "@/hooks/useLending";
import CreateLoanModal from "./CreateLoanModal";
import LoansList from "./LoansList";
import LoanDetailsModal from "./LoanDetailsModal";
import RepaymentModal from "./RepaymentModal";
import FinancialSummaryPanel from "./FinancialSummaryPanel";
import ExternalDebtsPanel from "./ExternalDebtsPanel";
import type { Loan } from "@/types/money";

export default function LendingDashboard() {
  const lending = useLending();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showLoanDetails, setShowLoanDetails] = useState(false);
  const [showRepaymentForm, setShowRepaymentForm] = useState(false);
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);

  const handleCreateClick = useCallback(() => {
    setShowCreateForm(true);
  }, []);

  const handleCloseCreateForm = useCallback(() => {
    setShowCreateForm(false);
  }, []);

  const handleLoanSelect = useCallback(
    (loan: Loan) => {
      setSelectedLoanId(loan._id);
      lending.loadLoanDetails(loan._id);
      setShowLoanDetails(true);
    },
    [lending],
  );

  const handleRepayClick = useCallback(() => {
    setShowRepaymentForm(true);
  }, []);

  const handleCloseRepaymentForm = useCallback(() => {
    setShowRepaymentForm(false);
  }, []);

  const handleCloseLoanDetails = useCallback(() => {
    setShowLoanDetails(false);
    setSelectedLoanId(null);
  }, []);

  const handleCreateLoanSuccess = useCallback(async () => {
    setShowCreateForm(false);
    await lending.refresh();
  }, [lending]);

  const handleRepaymentSuccess = useCallback(async () => {
    setShowRepaymentForm(false);
    await lending.refresh();
  }, [lending]);

  if (lending.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
              Lending Manager
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Track loans and manage your lending activities
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCreateClick}
            className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Create Loan
          </motion.button>
        </div>

        {/* Error Banner */}
        {lending.error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-800 dark:text-red-200">
                Error
              </h3>
              <p className="text-red-700 dark:text-red-300 text-sm">
                {lending.error}
              </p>
            </div>
          </motion.div>
        )}

        {/* Summary Panels */}
        <FinancialSummaryPanel summary={lending.summary} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {/* Loans List - spans 2 columns on large screens */}
          <div className="lg:col-span-2">
            <LoansList
              loans={lending.loans}
              onSelectLoan={handleLoanSelect}
              isLoading={lending.isLoading}
            />
          </div>

          {/* External Debts - right column */}
          <div>
            <ExternalDebtsPanel debts={lending.debts} />
          </div>
        </div>

        {/* Statistics */}
        {lending.stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                Active Loans
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {lending.stats.totalActiveLoans}
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                Average Loan
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                ${lending.stats.averageLoanAmount.toFixed(0)}
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                Total Received
              </div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                ${lending.stats.totalMoneyReceived.toFixed(0)}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Modals */}
      <CreateLoanModal
        isOpen={showCreateForm}
        onClose={handleCloseCreateForm}
        onSuccess={handleCreateLoanSuccess}
      />

      <LoanDetailsModal
        isOpen={showLoanDetails}
        loan={lending.selectedLoan}
        transactions={lending.selectedLoanTransactions}
        onClose={handleCloseLoanDetails}
        onRepayClick={handleRepayClick}
      />

      <RepaymentModal
        isOpen={showRepaymentForm}
        loan={lending.selectedLoan}
        isProcessing={lending.isProcessingRepayment}
        onClose={handleCloseRepaymentForm}
        onSuccess={handleRepaymentSuccess}
      />
    </div>
  );
}
