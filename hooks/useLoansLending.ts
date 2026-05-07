"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  loansAPI,
  lendingRecordAPI,
  financeAPI,
  isUnauthorizedError,
} from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type {
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

      const [loans, lendings, summary] = await Promise.all([
        loansAPI.getAll(),
        lendingRecordAPI.getAll(),
        financeAPI.getSummary(),
      ]);

      safeSetState((prev) => ({
        ...prev,
        loans: loans ?? [],
        lendings: lendings ?? [],
        summary: summary ?? null,
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
      reason: string;
      date?: string;
    }) => {
      await loansAPI.create(payload);
      toast.success("Loan added");
      await loadAll();
    },
    [loadAll],
  );

  const payLoan = useCallback(
    async (id: string) => {
      try {
        await loansAPI.pay(id);
        toast.success("Loan marked as paid");
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
        toast.success("Loan deleted");
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
      await lendingRecordAPI.create(payload);
      toast.success("Lending record added");
      await loadAll();
    },
    [loadAll],
  );

  const markRepaid = useCallback(
    async (id: string) => {
      try {
        await lendingRecordAPI.markRepaid(id);
        toast.success("Marked as repaid");
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
        toast.success("Lending record deleted");
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
