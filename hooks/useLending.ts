"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { isUnauthorizedError, lendingAPI } from "@/lib/api";
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

interface LendingState {
  loans: Loan[];
  debts: ExternalDebt[];
  summary: FinancialSummary;
  stats: LendingStats;
  selectedLoan: Loan | null;
  selectedLoanTransactions: LendingTransaction[];
  isLoading: boolean;
  isCreatingLoan: boolean;
  isProcessingRepayment: boolean;
  error: string | null;
}

const defaultSummary: FinancialSummary = {
  totalBalance: 0,
  totalExpenses: 0,
  totalLoansGiven: 0,
  totalDebt: 0,
  netPosition: 0,
};

const defaultStats: LendingStats = {
  totalActiveLoans: 0,
  totalPartiallyPaidLoans: 0,
  totalClosedLoans: 0,
  totalMoneyLent: 0,
  averageLoanAmount: 0,
  totalMoneyReceived: 0,
};

const initialState: LendingState = {
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
};

function getMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export function useLending() {
  const { user, loading: authLoading, clearUser } = useAuth();

  const [state, setState] = useState<LendingState>(initialState);

  const isMounted = useRef(false);
  const lastToast = useRef<string | null>(null);

  const safeSetState = useCallback(
    (updater: React.SetStateAction<LendingState>) => {
      if (isMounted.current) {
        setState(updater);
      }
    },
    [],
  );

  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleError = useCallback(
    (error: unknown, fallback: string, notify = true) => {
      if (isUnauthorizedError(error)) {
        clearUser();
        return;
      }

      const message = getMessage(error, fallback);

      safeSetState((prev) => ({
        ...prev,
        error: message,
      }));

      if (notify && message !== lastToast.current) {
        lastToast.current = message;
        toast.error(message);
      }
    },
    [clearUser, safeSetState],
  );

  const loadAllData = useCallback(async () => {
    if (authLoading) return;

    if (!user?.id) {
      safeSetState((prev) => ({
        ...prev,
        loans: [],
        debts: [],
        summary: defaultSummary,
        stats: defaultStats,
        selectedLoan: null,
        selectedLoanTransactions: [],
        isLoading: false,
      }));
      return;
    }

    try {
      safeSetState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
      }));

      const [loans, debts, summary, stats] = await Promise.all([
        lendingAPI.getAllLoans(),
        lendingAPI.getExternalDebts(),
        lendingAPI.getFinancialSummary(),
        lendingAPI.getLendingStats(),
      ]);

      safeSetState((prev) => ({
        ...prev,
        loans: loans ?? [],
        debts: debts ?? [],
        summary: summary ?? defaultSummary,
        stats: stats ?? defaultStats,
        isLoading: false,
      }));
    } catch (error) {
      handleError(error, "Failed to load lending data", false);

      safeSetState((prev) => ({
        ...prev,
        isLoading: false,
      }));
    }
  }, [authLoading, user?.id, handleError, safeSetState]);

  useEffect(() => {
    void loadAllData();
  }, [loadAllData]);

  const createLoan = useCallback(
    async (data: CreateLoanRequest) => {
      try {
        safeSetState((prev) => ({
          ...prev,
          isCreatingLoan: true,
          error: null,
        }));

        const res = await lendingAPI.createLoan(data);

        safeSetState((prev) => {
          const currentSummary = prev.summary ?? defaultSummary;

          return {
            ...prev,
            loans: [...prev.loans, res.loan],
            summary: {
              ...currentSummary,
              totalBalance:
                data.sourceType === "PERSONAL"
                  ? currentSummary.totalBalance - data.amount
                  : currentSummary.totalBalance,
              totalLoansGiven:
                currentSummary.totalLoansGiven +
                (data.sourceType === "PERSONAL" ? data.amount : 0),
              totalDebt:
                currentSummary.totalDebt +
                (data.sourceType === "BORROWED" ? data.amount : 0),
              netPosition:
                data.sourceType === "PERSONAL"
                  ? currentSummary.netPosition - data.amount
                  : currentSummary.netPosition,
            },
            isCreatingLoan: false,
          };
        });

        toast.success("Loan created successfully");
        return res.loan;
      } catch (error) {
        handleError(error, "Failed to create loan");

        safeSetState((prev) => ({
          ...prev,
          isCreatingLoan: false,
        }));

        throw error;
      }
    },
    [handleError, safeSetState],
  );

  const processRepayment = useCallback(
    async (loanId: string, data: RepaymentRequest) => {
      try {
        safeSetState((prev) => ({
          ...prev,
          isProcessingRepayment: true,
          error: null,
        }));

        const res = await lendingAPI.repayLoan(loanId, data);

        safeSetState((prev) => {
          const currentSummary = prev.summary ?? defaultSummary;

          return {
            ...prev,
            loans: prev.loans.map((loan) =>
              loan._id === loanId ? res.loan : loan,
            ),
            selectedLoan: res.loan,
            summary: {
              ...currentSummary,
              totalBalance: currentSummary.totalBalance + data.amount,
              totalLoansGiven: Math.max(
                currentSummary.totalLoansGiven - data.amount,
                0,
              ),
              netPosition: currentSummary.netPosition + data.amount,
            },
            isProcessingRepayment: false,
          };
        });

        toast.success("Repayment processed successfully");
        return res;
      } catch (error) {
        handleError(error, "Failed to process repayment");

        safeSetState((prev) => ({
          ...prev,
          isProcessingRepayment: false,
        }));

        throw error;
      }
    },
    [handleError, safeSetState],
  );

  const loadLoanDetails = useCallback(
    async (loanId: string) => {
      if (!loanId) return;

      try {
        const res = await lendingAPI.getLoanDetails(loanId);

        safeSetState((prev) => ({
          ...prev,
          selectedLoan: res.loan,
          selectedLoanTransactions: res.transactions ?? [],
        }));
      } catch (error) {
        handleError(error, "Failed to load loan details", false);
      }
    },
    [handleError, safeSetState],
  );

  const refresh = useCallback(async () => {
    lastToast.current = null;
    await loadAllData();
  }, [loadAllData]);

  return {
    ...state,
    createLoan,
    processRepayment,
    loadLoanDetails,
    refresh,
  };
}
