"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  loansAPI,
  lendingRecordAPI,
  financeAPI,
  moneyAPI,
  isUnauthorizedError,
} from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type {
  BalanceResponse,
  LoanRecord,
  LendingRecord,
  FinanceSummary,
  FundingSource,
} from "@/types/money";

interface State {
  loans: LoanRecord[];
  lendings: LendingRecord[];
  summary: FinanceSummary | null;
  isLoading: boolean;
  error: string | null;
}

const defaultState: State = {
  loans: [],
  lendings: [],
  summary: null,
  isLoading: true,
  error: null,
};

function getMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

function getOutstandingLoanDebt(loans: LoanRecord[]) {
  return loans.reduce((sum, loan) => {
    if (loan.status === "PAID") return sum;
    return sum + Math.max(loan.amount - (loan.paidAmount ?? 0), 0);
  }, 0);
}

function getRepaidLoans(loans: LoanRecord[]) {
  return loans.reduce((sum, loan) => sum + (loan.paidAmount ?? 0), 0);
}

function getLendingOutstanding(lendings: LendingRecord[]) {
  return lendings.reduce((sum, lending) => {
    if (lending.status === "REPAID") return sum;
    return sum + Math.max(lending.amount - (lending.repaidAmount ?? 0), 0);
  }, 0);
}

function getPersonalLendingOutstanding(lendings: LendingRecord[]) {
  return lendings.reduce((sum, lending) => {
    if (lending.fundingSource !== "PERSONAL" || lending.status === "REPAID") {
      return sum;
    }
    return sum + Math.max(lending.amount - (lending.repaidAmount ?? 0), 0);
  }, 0);
}

function getBorrowedLendingOutstanding(lendings: LendingRecord[]) {
  return lendings.reduce((sum, lending) => {
    if (lending.fundingSource !== "BORROWED" || lending.status === "REPAID") {
      return sum;
    }
    return sum + Math.max(lending.amount - (lending.repaidAmount ?? 0), 0);
  }, 0);
}

function getMoneyPageBalance(balance: BalanceResponse | null | undefined) {
  if (!balance) return 0;

  if (typeof balance.totalBalance === "number") {
    return balance.totalBalance;
  }

  return (balance.sources ?? []).reduce((sum, source) => sum + source.amount, 0);
}

function buildFinanceSummary(
  loans: LoanRecord[],
  lendings: LendingRecord[],
  balance: BalanceResponse | null | undefined,
  backendSummary: FinanceSummary | null | undefined,
): FinanceSummary {
  const availableBalance = getMoneyPageBalance(balance);
  const loanDebt = getOutstandingLoanDebt(loans);
  const repaidLoans = getRepaidLoans(loans);
  const lendingOutstanding = getLendingOutstanding(lendings);
  const lendingFromPersonal = getPersonalLendingOutstanding(lendings);
  const borrowedLending = getBorrowedLendingOutstanding(lendings);
  const netBalance = availableBalance - loanDebt;

  return {
    availableBalance,
    loanDebt,
    netBalance,
    salary: backendSummary?.salary ?? 0,
    externalIncome: backendSummary?.externalIncome ?? 0,
    savings: backendSummary?.savings ?? 0,
    activeLoans: loanDebt,
    borrowedLending,
    repaidLoans,
    expenses: backendSummary?.expenses ?? 0,
    lendingFromPersonal,
    lendingOutstanding,
    breakdown: {
      ...backendSummary?.breakdown,
      balanceAccounts: availableBalance,
      directLoans:
        backendSummary?.breakdown?.directLoans ??
        Math.max(loanDebt - borrowedLending, 0),
      borrowedLendingLoans:
        backendSummary?.breakdown?.borrowedLendingLoans ?? borrowedLending,
      lending: backendSummary?.breakdown?.lending ?? lendingOutstanding,
    },
    totalLoanDebt: loanDebt,
    totalLending: lendingOutstanding,
    totalBalance: availableBalance,
    totalDebt: loanDebt,
    netPosition: netBalance,
  };
}

export function useLoansLending() {
  const { user, loading: authLoading, clearUser } = useAuth();
  const [state, setState] = useState<State>(defaultState);
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const safeSetState = useCallback((updater: React.SetStateAction<State>) => {
    if (isMounted.current) setState(updater);
  }, []);

  const handleError = useCallback(
    (error: unknown, fallback: string) => {
      if (isUnauthorizedError(error)) {
        clearUser();
        return;
      }
      const message = getMessage(error, fallback);
      safeSetState((prev) => ({ ...prev, error: message }));
      toast.error(message);
    },
    [clearUser, safeSetState],
  );

  const loadAll = useCallback(async () => {
    if (authLoading) return;

    if (!user?.id) {
      safeSetState((prev) => ({
        ...prev,
        loans: [],
        lendings: [],
        summary: null,
        isLoading: false,
      }));
      return;
    }

    try {
      safeSetState((prev) => ({ ...prev, isLoading: true, error: null }));

      const [loans, lendings, summary, balance] = await Promise.all([
        loansAPI.getAll(),
        lendingRecordAPI.getAll(),
        financeAPI.getSummary(),
        moneyAPI.getBalanceSources(),
      ]);
      const safeLoans = loans ?? [];
      const safeLendings = lendings ?? [];

      safeSetState((prev) => ({
        ...prev,
        loans: safeLoans,
        lendings: safeLendings,
        summary: buildFinanceSummary(safeLoans, safeLendings, balance, summary),
        isLoading: false,
      }));
    } catch (error) {
      handleError(error, "Failed to load data");
      safeSetState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [authLoading, user?.id, handleError, safeSetState]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const createLoan = useCallback(
    async (payload: {
      personName: string;
      amount: number;
      reason?: string;
      date?: string;
    }) => {
      try {
        await loansAPI.create(payload);
        await loadAll();
      } catch (error) {
        handleError(error, "Failed to create loan");
        throw error;
      }
    },
    [handleError, loadAll],
  );

  const payLoan = useCallback(
    async (id: string, amount: number) => {
      try {
        await loansAPI.pay(id, amount);
        await loadAll();
      } catch (error) {
        handleError(error, "Failed to update loan");
      }
    },
    [loadAll, handleError],
  );

  const deleteLoan = useCallback(
    async (id: string) => {
      try {
        await loansAPI.remove(id);
        await loadAll();
      } catch (error) {
        handleError(error, "Failed to delete loan");
      }
    },
    [loadAll, handleError],
  );

  const createLending = useCallback(
    async (payload: {
      personName: string;
      amount: number;
      fundingSource: FundingSource;
      date?: string;
    }) => {
      try {
        await lendingRecordAPI.create(payload);
        await loadAll();
      } catch (error) {
        handleError(error, "Failed to create lending record");
        throw error;
      }
    },
    [handleError, loadAll],
  );

  const markRepaid = useCallback(
    async (id: string, amount: number) => {
      try {
        await lendingRecordAPI.markRepaid(id, amount);
        await loadAll();
      } catch (error) {
        handleError(error, "Failed to update lending record");
      }
    },
    [loadAll, handleError],
  );

  const deleteLending = useCallback(
    async (id: string) => {
      try {
        await lendingRecordAPI.remove(id);
        await loadAll();
      } catch (error) {
        handleError(error, "Failed to delete lending record");
      }
    },
    [loadAll, handleError],
  );

  return {
    ...state,
    createLoan,
    payLoan,
    deleteLoan,
    createLending,
    markRepaid,
    deleteLending,
    refresh: loadAll,
  };
}
