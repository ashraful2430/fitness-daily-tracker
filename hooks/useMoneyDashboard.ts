"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { isUnauthorizedError, moneyAPI } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type {
  CreateExpenseRequest,
  MoneyExpense,
  MostSpentCategory,
} from "@/types/money";

type FormErrors = Record<string, string>;

type MoneyState = {
  salary: number | null;
  categories: string[];
  expenses: MoneyExpense[];
  mostSpentCategory: MostSpentCategory | null;
};

function getMonthRange(date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);

  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}

function normalizeCategoryName(category: string) {
  return category.trim().toLowerCase();
}

function toSalaryAmount(payload: unknown): number | null {
  if (typeof payload === "number") return payload;

  if (!payload || typeof payload !== "object") return null;

  const record = payload as
    | { amount?: unknown; salary?: { amount?: unknown } }
    | null;

  if (typeof record?.amount === "number") return record.amount;
  if (typeof record?.salary?.amount === "number") return record.salary.amount;

  return null;
}

function toMostSpentCategory(payload: unknown): MostSpentCategory | null {
  if (!payload || typeof payload !== "object") return null;

  const record = payload as
    | MostSpentCategory
    | { mostSpentCategory?: MostSpentCategory | null };

  if ("mostSpentCategory" in record) {
    return record.mostSpentCategory ?? null;
  }

  if (typeof record.category === "string") {
    return record;
  }

  return null;
}

function toExpenses(payload: unknown): MoneyExpense[] {
  if (Array.isArray(payload)) return payload;

  if (payload && typeof payload === "object") {
    const record = payload as { expenses?: unknown };

    if (Array.isArray(record.expenses)) {
      return record.expenses as MoneyExpense[];
    }
  }

  return [];
}

function buildCategories(expenses: MoneyExpense[], categories: string[]) {
  const derived = expenses.map((expense) => normalizeCategoryName(expense.category));
  return Array.from(new Set([...categories, ...derived])).sort((a, b) =>
    a.localeCompare(b),
  );
}

export function useMoneyDashboard() {
  const { user, loading: authLoading, clearUser } = useAuth();
  const userId = user?.id ?? null;
  const [{ salary, categories, expenses, mostSpentCategory }, setMoneyState] =
    useState<MoneyState>({
      salary: null,
      categories: [],
      expenses: [],
      mostSpentCategory: null,
    });
  const [loading, setLoading] = useState(true);
  const [salarySaving, setSalarySaving] = useState(false);
  const [categorySaving, setCategorySaving] = useState(false);
  const [expenseSaving, setExpenseSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState(getMonthRange);
  const isMounted = useRef(true);
  const lastErrorMessage = useRef<string | null>(null);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const applyState = useCallback((nextState: Partial<MoneyState>) => {
    if (!isMounted.current) return;

    setMoneyState((current) => ({ ...current, ...nextState }));
  }, []);

  const handleApiError = useCallback(
    (error: unknown, fallbackMessage: string) => {
      if (isUnauthorizedError(error)) {
        clearUser();
        return;
      }

      const message =
        error instanceof Error ? error.message : fallbackMessage;
      setError(message);

      if (lastErrorMessage.current !== message) {
        lastErrorMessage.current = message;
        toast.error(message);
      }
    },
    [clearUser],
  );

  const refreshExpenses = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await moneyAPI.getExpenses(
        filters.startDate,
        filters.endDate,
      );
      const nextExpenses = toExpenses(response);

      setMoneyState((current) => ({
        ...current,
        expenses: nextExpenses,
        categories: buildCategories(nextExpenses, current.categories),
      }));
      setError(null);
      lastErrorMessage.current = null;
    } catch (error: unknown) {
      handleApiError(error, "Failed to load expenses");
    }
  }, [filters.endDate, filters.startDate, handleApiError, userId]);

  const refreshSummary = useCallback(async () => {
    if (!userId) return;

    try {
      const [salaryResponse, mostSpentResponse] = await Promise.all([
        moneyAPI.getSalary(userId),
        moneyAPI.getMostSpentCategory(userId),
      ]);

      applyState({
        salary: toSalaryAmount(salaryResponse),
        mostSpentCategory: toMostSpentCategory(mostSpentResponse),
      });
      setError(null);
      lastErrorMessage.current = null;
    } catch (error: unknown) {
      handleApiError(error, "Failed to load money insights");
    }
  }, [applyState, handleApiError, userId]);

  const refreshAll = useCallback(async () => {
    if (authLoading) return;

    if (!userId) {
      if (!isMounted.current) return;
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      await Promise.all([refreshSummary(), refreshExpenses()]);
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [authLoading, refreshExpenses, refreshSummary, userId]);

  useEffect(() => {
    queueMicrotask(() => {
      void refreshAll();
    });
  }, [authLoading, refreshAll, userId, filters.startDate, filters.endDate]);

  const validateSalary = useCallback((amount: string) => {
    const nextErrors: FormErrors = {};

    if (!amount.trim()) {
      nextErrors.amount = "Salary amount is required.";
    } else if (Number(amount) <= 0) {
      nextErrors.amount = "Salary must be greater than zero.";
    }

    return nextErrors;
  }, []);

  const validateCategory = useCallback(
    (name: string) => {
      const nextErrors: FormErrors = {};
      const normalizedName = normalizeCategoryName(name);

      if (!normalizedName) {
        nextErrors.name = "Category name is required.";
      } else if (categories.includes(normalizedName)) {
        nextErrors.name = "This category already exists in your current session.";
      }

      return nextErrors;
    },
    [categories],
  );

  const validateExpense = useCallback(
    (payload: CreateExpenseRequest) => {
      const nextErrors: FormErrors = {};

      if (!Number.isFinite(payload.amount) || payload.amount <= 0) {
        nextErrors.amount = "Amount must be greater than zero.";
      }

      if (!payload.description.trim()) {
        nextErrors.description = "Description is required.";
      }

      if (!payload.category.trim()) {
        nextErrors.category = "Please choose a category.";
      } else if (!categories.includes(normalizeCategoryName(payload.category))) {
        nextErrors.category = "Create this category first before adding the expense.";
      }

      if (!payload.date) {
        nextErrors.date = "Expense date is required.";
      }

      return nextErrors;
    },
    [categories],
  );

  const saveSalary = useCallback(
    async (amount: string) => {
      const errors = validateSalary(amount);
      if (Object.keys(errors).length > 0) return { ok: false as const, errors };

      try {
        setSalarySaving(true);
        setError(null);
        await moneyAPI.updateSalary({ amount: Number(amount) });
        await refreshSummary();
        toast.success("Salary saved");
        return { ok: true as const, errors: {} };
      } catch (error: unknown) {
        handleApiError(error, "Failed to save salary");
        return { ok: false as const, errors: {} };
      } finally {
        if (isMounted.current) {
          setSalarySaving(false);
        }
      }
    },
    [handleApiError, refreshSummary, validateSalary],
  );

  const createCategory = useCallback(
    async (name: string) => {
      const errors = validateCategory(name);
      if (Object.keys(errors).length > 0) return { ok: false as const, errors };

      const normalizedName = normalizeCategoryName(name);

      try {
        setCategorySaving(true);
        setError(null);
        await moneyAPI.createCategory({ name: normalizedName });
        applyState({
          categories: buildCategories(expenses, [...categories, normalizedName]),
        });
        toast.success("Category created");
        return { ok: true as const, errors: {} };
      } catch (error: unknown) {
        handleApiError(error, "Failed to create category");
        return { ok: false as const, errors: {} };
      } finally {
        if (isMounted.current) {
          setCategorySaving(false);
        }
      }
    },
    [applyState, categories, expenses, handleApiError, validateCategory],
  );

  const createExpense = useCallback(
    async (payload: CreateExpenseRequest) => {
      const normalizedPayload = {
        ...payload,
        category: normalizeCategoryName(payload.category),
        description: payload.description.trim(),
      };
      const errors = validateExpense(normalizedPayload);

      if (Object.keys(errors).length > 0) return { ok: false as const, errors };

      try {
        setExpenseSaving(true);
        setError(null);
        await moneyAPI.createExpense(normalizedPayload);
        await Promise.all([refreshExpenses(), refreshSummary()]);
        toast.success("Expense added");
        return { ok: true as const, errors: {} };
      } catch (error: unknown) {
        handleApiError(error, "Failed to create expense");
        return { ok: false as const, errors: {} };
      } finally {
        if (isMounted.current) {
          setExpenseSaving(false);
        }
      }
    },
    [handleApiError, refreshExpenses, refreshSummary, validateExpense],
  );

  const updateFilters = useCallback((startDate: string, endDate: string) => {
    setFilters({ startDate, endDate });
  }, []);

  const totals = useMemo(() => {
    const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const budgetBalance = salary !== null ? salary - totalSpent : null;
    const expenseCount = expenses.length;
    const averageExpense = expenseCount ? totalSpent / expenseCount : 0;

    return {
      totalSpent,
      budgetBalance,
      expenseCount,
      averageExpense,
    };
  }, [expenses, salary]);

  return {
    user,
    salary,
    categories,
    expenses,
    mostSpentCategory,
    totals,
    filters,
    loading: loading || authLoading,
    salarySaving,
    categorySaving,
    expenseSaving,
    error,
    refreshAll,
    refreshExpenses,
    updateFilters,
    saveSalary,
    createCategory,
    createExpense,
  };
}
