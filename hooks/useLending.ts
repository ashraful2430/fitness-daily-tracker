"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { ApiError, isUnauthorizedError, lendingAPI } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type {
  Loan,
  ExternalDebt,
  FinancialSummary,
  LendingStats,
  CreateLoanRequest,
  RepaymentRequest,
  LendingTransaction,
} from "@/types/money";

type FormErrors = Record<string, string>;

interface LendingState {
  loans: Loan[];
  debts: ExternalDebt[];
  summary: FinancialSummary | null;
  stats: LendingStats | null;
  selectedLoan: Loan | null;
  selectedLoanTransactions: LendingTransaction[];
  isLoading: boolean;
  isCreatingLoan: boolean;
  isProcessingRepayment: boolean;
  error: string | null;
}

const defaultSummary: FinancialSummary = {
  personalBalance: 0,
  totalLent: 0,
  totalOutstandingLoans: 0,
  totalBorrowedLiability: 0,
  netPosition: 0,
  activeDebts: [],
};

const defaultStats: LendingStats = {
  totalActiveLoans: 0,
  totalPartiallyPaidLoans: 0,
  totalClosedLoans: 0,
  totalMoneyLent: 0,
  averageLoanAmount: 0,
  totalMoneyReceived: 0,
};

function getMessage(error: unknown, fallbackMessage: string) {
  return error instanceof Error ? error.message : fallbackMessage;
}

export function useLending() {
  const { user, loading: authLoading, clearUser } = useAuth();
  const [state, setState] = useState<LendingState>({
    loans: [],
    debts: [],
    summary: defaultSummary,
    stats: defaultStats,
    selectedLoan: null,
    selectedLoanTransactions: [],
    isLoading: true,
    isCreatingLoan: false,
    isProcessingRepayment: false,
    error: null,
  });

  const isMounted = useRef(true);
  const lastToastMessage = useRef<string | null>(null);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const clearToastLock = useCallback(() => {
    lastToastMessage.current = null;
  }, []);

  const handleError = useCallback(
    (error: unknown, fallbackMessage: string, notify = true) => {
      if (isUnauthorizedError(error)) {
        clearUser();
        return;
      }

      const message = getMessage(error, fallbackMessage);

      if (isMounted.current) {
        setState((prev) => ({
          ...prev,
          error: message,
        }));
      }

      if (notify && message !== lastToastMessage.current) {
        lastToastMessage.current = message;
        toast.error(message);
      }
    },
    [clearUser],
  );

  // Load all lending data
  const loadAllData = useCallback(async () => {
    if (!user?.id) {
      if (isMounted.current) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
        }));
      }
      return;
    }

    try {
      if (isMounted.current) {
        setState((prev) => ({
          ...prev,
          isLoading: true,
          error: null,
        }));
      }

      const [loans, debts, summary, stats] = await Promise.all([
        lendingAPI.getAllLoans(),
        lendingAPI.getExternalDebts(),
        lendingAPI.getFinancialSummary(),
        lendingAPI.getLendingStats(),
      ]);

      if (isMounted.current) {
        setState((prev) => ({
          ...prev,
          loans,
          debts,
          summary,
          stats,
          isLoading: false,
          error: null,
        }));
      }
    } catch (error) {
      handleError(error, "Failed to load lending data", false);
      if (isMounted.current) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
        }));
      }
    }
  }, [user?.id, handleError]);

  // Initial load
  useEffect(() => {
    if (!authLoading) {
      loadAllData();
    }
  }, [authLoading, loadAllData]);

  // Create loan
  const createLoan = useCallback(
    async (data: CreateLoanRequest) => {
      try {
        if (isMounted.current) {
          setState((prev) => ({
            ...prev,
            isCreatingLoan: true,
            error: null,
          }));
        }

        const response = await lendingAPI.createLoan(data);

        if (isMounted.current) {
          setState((prev) => ({
            ...prev,
            loans: [...prev.loans, response.loan],
            summary: prev.summary ? {
              ...prev.summary,
              personalBalance:
                data.sourceType === "PERSONAL"
                  ? prev.summary.personalBalance - data.amount
                  : prev.summary.personalBalance,
              totalLent:
                prev.summary.totalLent +
                (data.sourceType === "PERSONAL" ? data.amount : 0),
              totalOutstandingLoans:
                data.sourceType === "PERSONAL"
                  ? prev.summary.totalOutstandingLoans + data.amount
                  : prev.summary.totalOutstandingLoans,
              totalBorrowedLiability:
                data.sourceType === "BORROWED"
                  ? prev.summary.totalBorrowedLiability + data.amount
                  : prev.summary.totalBorrowedLiability,
            } : prev.summary,
            isCreatingLoan: false,
          }));

          toast.success("Loan created successfully");
        }

        return response.loan;
      } catch (error) {
        handleError(error, "Failed to create loan");
        if (isMounted.current) {
          setState((prev) => ({
            ...prev,
            isCreatingLoan: false,
          }));
        }
        throw error;
      }
    },
    [handleError],
  );

  // Process repayment
  const processRepayment = useCallback(
    async (loanId: string, data: RepaymentRequest) => {
      try {
        if (isMounted.current) {
          setState((prev) => ({
            ...prev,
            isProcessingRepayment: true,
            error: null,
          }));
        }

        const response = await lendingAPI.repayLoan(loanId, data);

        if (isMounted.current) {
          setState((prev) => {
            const updatedLoans = prev.loans.map((loan) =>
              loan._id === loanId ? response.loan : loan,
            );

            return {
              ...prev,
              loans: updatedLoans,
              selectedLoan: response.loan,
              summary: prev.summary ? {
                ...prev.summary,
                personalBalance: prev.summary.personalBalance + data.repaymentAmount,
                totalOutstandingLoans:
                  prev.summary.totalOutstandingLoans -
                  data.repaymentAmount,
              } : prev.summary,
              isProcessingRepayment: false,
            };
          });

          toast.success("Repayment processed successfully");
        }

        return response;
      } catch (error) {
        handleError(error, "Failed to process repayment");
        if (isMounted.current) {
          setState((prev) => ({
            ...prev,
            isProcessingRepayment: false,
          }));
        }
        throw error;
      }
    },
    [handleError],
  );

  // Load loan details
  const loadLoanDetails = useCallback(
    async (loanId: string) => {
      try {
        const details = await lendingAPI.getLoanDetails(loanId);
        if (isMounted.current) {
          setState((prev) => ({
            ...prev,
            selectedLoan: details.loan,
            selectedLoanTransactions: details.transactions,
          }));
        }
      } catch (error) {
        handleError(error, "Failed to load loan details", false);
      }
    },
    [handleError],
  );

  // Refresh summary
  const refreshSummary = useCallback(async () => {
    try {
      const summary = await lendingAPI.getFinancialSummary();
      if (isMounted.current) {
        setState((prev) => ({
          ...prev,
          summary,
        }));
      }
    } catch (error) {
      handleError(error, "Failed to refresh summary", false);
    }
  }, [handleError]);

  // Refresh all data
  const refresh = useCallback(async () => {
    await loadAllData();
    clearToastLock();
  }, [loadAllData, clearToastLock]);

  return {
    ...state,
    createLoan,
    processRepayment,
    loadLoanDetails,
    refreshSummary,
    refresh,
  };
}
