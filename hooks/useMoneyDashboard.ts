"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { ApiError, isUnauthorizedError, moneyAPI } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type {
  CreateExpenseRequest,
  ExpensesQuery,
  MoneyCategory,
  MoneyExpense,
  MoneyPagination,
  MoneySummary,
  MostSpentCategory,
  SalaryRecord,
  UpdateExpenseRequest,
} from "@/types/money";

type FormErrors = Record<string, string>;

type FiltersState = {
  startDate: string;
  endDate: string;
  category: string;
  page: number;
  limit: number;
};

function toLocalDateInputValue(date: Date) {
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return offsetDate.toISOString().slice(0, 10);
}

function getMonthRange(date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);

  return {
    startDate: toLocalDateInputValue(start),
    endDate: toLocalDateInputValue(end),
  };
}

function createDefaultPagination(limit = 10): MoneyPagination {
  return {
    page: 1,
    limit,
    total: 0,
    totalPages: 1,
  };
}

function normalizeCategoryName(category: string) {
  return category.trim().toLowerCase();
}

function defaultSummary(): MoneySummary {
  return {
    salaryAmount: 0,
    totalExpenses: 0,
    expenseCount: 0,
    averageExpense: 0,
    currentMonthSpent: 0,
    remainingSalary: 0,
    topCategories: [],
  };
}

function getMessage(error: unknown, fallbackMessage: string) {
  return error instanceof Error ? error.message : fallbackMessage;
}

function isConflictError(error: unknown) {
  return error instanceof ApiError && error.status === 409;
}

export function useMoneyDashboard() {
  const { user, loading: authLoading, clearUser } = useAuth();
  const userId = user?.id ?? null;
  const [categories, setCategories] = useState<MoneyCategory[]>([]);
  const [salary, setSalary] = useState<SalaryRecord | null>(null);
  const [summary, setSummary] = useState<MoneySummary>(defaultSummary);
  const [mostSpentCategory, setMostSpentCategory] =
    useState<MostSpentCategory | null>(null);
  const [expenses, setExpenses] = useState<MoneyExpense[]>([]);
  const [pagination, setPagination] = useState<MoneyPagination>(
    createDefaultPagination(),
  );
  const [filters, setFilters] = useState<FiltersState>({
    ...getMonthRange(),
    category: "",
    page: 1,
    limit: 10,
  });
  const [initialLoading, setInitialLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [expensesLoading, setExpensesLoading] = useState(false);
  const [salarySaving, setSalarySaving] = useState(false);
  const [salaryDeleting, setSalaryDeleting] = useState(false);
  const [categorySaving, setCategorySaving] = useState(false);
  const [deletingCategoryName, setDeletingCategoryName] = useState<
    string | null
  >(null);
  const [expenseSaving, setExpenseSaving] = useState(false);
  const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);
  const lastToastMessage = useRef<string | null>(null);
  const filtersRef = useRef<FiltersState>({
    ...getMonthRange(),
    category: "",
    page: 1,
    limit: 10,
  });

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

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
        setError(message);
      }

      if (notify && lastToastMessage.current !== message) {
        lastToastMessage.current = message;
        toast.error(message);
      }
    },
    [clearUser],
  );

  const fetchSummaryBundle = useCallback(
    async (notify = false) => {
      if (!userId) return;

      try {
        setSummaryLoading(true);

        const [salaryResponse, summaryResponse, mostSpentResponse] =
          await Promise.all([
            moneyAPI.getSalary(userId),
            moneyAPI.getSummary(),
            moneyAPI.getMostSpentCategory(userId),
          ]);

        if (!isMounted.current) return;

        setSalary(salaryResponse);
        setSummary(summaryResponse ?? defaultSummary());
        setMostSpentCategory(mostSpentResponse);
        setError(null);
        clearToastLock();
      } catch (error: unknown) {
        handleError(error, "Failed to load money summary", notify);
      } finally {
        if (isMounted.current) {
          setSummaryLoading(false);
        }
      }
    },
    [clearToastLock, handleError, userId],
  );

  const fetchCategories = useCallback(
    async (notify = false) => {
      if (!userId) return;

      try {
        const nextCategories = await moneyAPI.getCategories();

        if (!isMounted.current) return;

        setCategories(nextCategories ?? []);
        setError(null);
        clearToastLock();
      } catch (error: unknown) {
        handleError(error, "Failed to load categories", notify);
      }
    },
    [clearToastLock, handleError, userId],
  );

  const fetchExpenses = useCallback(
    async (query: FiltersState, notify = false) => {
      if (!userId) return;

      try {
        setExpensesLoading(true);

        const request: ExpensesQuery = {
          startDate: query.startDate || undefined,
          endDate: query.endDate || undefined,
          category: query.category || undefined,
          page: query.page,
          limit: query.limit,
        };
        const response = await moneyAPI.getExpenses(request);

        if (!isMounted.current) return;

        setExpenses(response.data);
        setPagination(response.pagination);
        setError(null);
        clearToastLock();
      } catch (error: unknown) {
        handleError(error, "Failed to load expenses", notify);
      } finally {
        if (isMounted.current) {
          setExpensesLoading(false);
        }
      }
    },
    [clearToastLock, handleError, userId],
  );

  const refreshExpenses = useCallback(
    async (notify = false) => {
      await fetchExpenses(filters, notify);
    },
    [fetchExpenses, filters],
  );

  const refreshAll = useCallback(
    async (notify = false) => {
      if (authLoading) return;

      if (!userId) {
        if (isMounted.current) {
          setInitialLoading(false);
        }
        return;
      }

      try {
        setInitialLoading(true);
        await Promise.all([
          fetchCategories(notify),
          fetchSummaryBundle(notify),
          fetchExpenses(filtersRef.current, notify),
        ]);
      } finally {
        if (isMounted.current) {
          setInitialLoading(false);
        }
      }
    },
    [authLoading, fetchCategories, fetchExpenses, fetchSummaryBundle, userId],
  );

  const refreshAfterMutation = useCallback(
    async (nextFilters?: FiltersState) => {
      const targetFilters = nextFilters ?? filtersRef.current;

      await Promise.all([
        fetchCategories(false),
        fetchSummaryBundle(false),
        fetchExpenses(targetFilters, false),
      ]);
    },
    [fetchCategories, fetchExpenses, fetchSummaryBundle],
  );

  useEffect(() => {
    queueMicrotask(() => {
      void refreshAll(false);
    });
  }, [refreshAll]);

  const validateSalary = useCallback((amount: string) => {
    const nextErrors: FormErrors = {};

    if (!amount.trim()) {
      nextErrors.amount = "Salary amount is required.";
    } else if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      nextErrors.amount = "Salary must be greater than zero.";
    }

    return nextErrors;
  }, []);

  const validateCategory = useCallback(
    (name: string) => {
      const nextErrors: FormErrors = {};
      const normalized = normalizeCategoryName(name);

      if (!normalized) {
        nextErrors.name = "Category name is required.";
      } else if (
        categories.some((category) => category.name === normalized)
      ) {
        nextErrors.name = "This category already exists.";
      }

      return nextErrors;
    },
    [categories],
  );

  const validateExpense = useCallback(
    (payload: CreateExpenseRequest | UpdateExpenseRequest) => {
      const nextErrors: FormErrors = {};
      const normalizedCategory = normalizeCategoryName(payload.category);

      if (!Number.isFinite(payload.amount) || payload.amount <= 0) {
        nextErrors.amount = "Amount must be greater than zero.";
      }

      if (!payload.description.trim()) {
        nextErrors.description = "Description is required.";
      }

      if (!normalizedCategory) {
        nextErrors.category = "Please select a category.";
      } else if (
        !categories.some((category) => category.name === normalizedCategory)
      ) {
        nextErrors.category = "Create this category first before saving the expense.";
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
      if (Object.keys(errors).length > 0) {
        return { ok: false as const, errors };
      }

      try {
        setSalarySaving(true);
        setError(null);
        await moneyAPI.updateSalary({ amount: Number(amount) });
        await refreshAfterMutation();
        toast.success("Salary saved");
        return { ok: true as const, errors: {} };
      } catch (error: unknown) {
        handleError(error, "Failed to save salary", true);
        return { ok: false as const, errors: {} };
      } finally {
        if (isMounted.current) {
          setSalarySaving(false);
        }
      }
    },
    [handleError, refreshAfterMutation, validateSalary],
  );

  const resetSalary = useCallback(async () => {
    try {
      setSalaryDeleting(true);
      setError(null);
      await moneyAPI.deleteSalary();
      await refreshAfterMutation();
      toast.success("Salary reset");
      return true;
    } catch (error: unknown) {
      handleError(error, "Failed to reset salary", true);
      return false;
    } finally {
      if (isMounted.current) {
        setSalaryDeleting(false);
      }
    }
  }, [handleError, refreshAfterMutation]);

  const createCategory = useCallback(
    async (name: string) => {
      const errors = validateCategory(name);
      if (Object.keys(errors).length > 0) {
        return { ok: false as const, errors };
      }

      try {
        setCategorySaving(true);
        setError(null);
        await moneyAPI.createCategory({ name: normalizeCategoryName(name) });
        await refreshAfterMutation();
        toast.success("Category created");
        return { ok: true as const, errors: {} };
      } catch (error: unknown) {
        handleError(error, "Failed to create category", true);
        return { ok: false as const, errors: {} };
      } finally {
        if (isMounted.current) {
          setCategorySaving(false);
        }
      }
    },
    [handleError, refreshAfterMutation, validateCategory],
  );

  const deleteCategory = useCallback(
    async (name: string) => {
      try {
        setDeletingCategoryName(name);
        setError(null);
        await moneyAPI.deleteCategory(name);
        await refreshAfterMutation();
        toast.success("Category deleted");
        return { ok: true as const, message: "" };
      } catch (error: unknown) {
        if (isConflictError(error)) {
          const message = "This category is already used by expenses and cannot be deleted.";
          setError(message);
          toast.error(message);
          return { ok: false as const, message };
        }

        handleError(error, "Failed to delete category", true);
        return {
          ok: false as const,
          message: getMessage(error, "Failed to delete category"),
        };
      } finally {
        if (isMounted.current) {
          setDeletingCategoryName(null);
        }
      }
    },
    [handleError, refreshAfterMutation],
  );

  const createExpense = useCallback(
    async (payload: CreateExpenseRequest) => {
      const normalizedPayload = {
        ...payload,
        category: normalizeCategoryName(payload.category),
        description: payload.description.trim(),
      };
      const errors = validateExpense(normalizedPayload);

      if (Object.keys(errors).length > 0) {
        return { ok: false as const, errors };
      }

      try {
        setExpenseSaving(true);
        setError(null);
        await moneyAPI.createExpense(normalizedPayload);
        const nextFilters = { ...filtersRef.current, page: 1 };

        if (isMounted.current) {
          filtersRef.current = nextFilters;
          setFilters(nextFilters);
        }

        await refreshAfterMutation(nextFilters);
        toast.success("Expense added");
        return { ok: true as const, errors: {} };
      } catch (error: unknown) {
        handleError(error, "Failed to add expense", true);
        return { ok: false as const, errors: {} };
      } finally {
        if (isMounted.current) {
          setExpenseSaving(false);
        }
      }
    },
    [handleError, refreshAfterMutation, validateExpense],
  );

  const updateExpense = useCallback(
    async (id: string, payload: UpdateExpenseRequest) => {
      const normalizedPayload = {
        ...payload,
        category: normalizeCategoryName(payload.category),
        description: payload.description.trim(),
      };
      const errors = validateExpense(normalizedPayload);

      if (Object.keys(errors).length > 0) {
        return { ok: false as const, errors };
      }

      try {
        setExpenseSaving(true);
        setError(null);
        await moneyAPI.updateExpense(id, normalizedPayload);
        await refreshAfterMutation();
        toast.success("Expense updated");
        return { ok: true as const, errors: {} };
      } catch (error: unknown) {
        handleError(error, "Failed to update expense", true);
        return { ok: false as const, errors: {} };
      } finally {
        if (isMounted.current) {
          setExpenseSaving(false);
        }
      }
    },
    [handleError, refreshAfterMutation, validateExpense],
  );

  const deleteExpense = useCallback(
    async (id: string) => {
      try {
        setDeletingExpenseId(id);
        setError(null);
        await moneyAPI.deleteExpense(id);
        const currentFilters = filtersRef.current;
        const nextPage =
          expenses.length === 1 && currentFilters.page > 1
            ? currentFilters.page - 1
            : currentFilters.page;
        const nextFilters = { ...currentFilters, page: nextPage };

        if (isMounted.current) {
          filtersRef.current = nextFilters;
          setFilters(nextFilters);
        }

        await refreshAfterMutation(nextFilters);
        toast.success("Expense deleted");
        return true;
      } catch (error: unknown) {
        handleError(error, "Failed to delete expense", true);
        return false;
      } finally {
        if (isMounted.current) {
          setDeletingExpenseId(null);
        }
      }
    },
    [expenses.length, handleError, refreshAfterMutation],
  );

  const updateFilterField = useCallback(
    (field: "startDate" | "endDate" | "category", value: string) => {
      setFilters((current) => ({
        ...current,
        [field]: value,
        page: 1,
      }));
    },
    [],
  );

  const setPage = useCallback((page: number) => {
    setFilters((current) => ({
      ...current,
      page,
    }));
  }, []);

  const applyFilters = useCallback(
    async (nextFilters: Partial<FiltersState> = {}, notify = false) => {
      const merged = {
        ...filtersRef.current,
        ...nextFilters,
      };

      if (isMounted.current) {
        setFilters(merged);
      }

      await fetchExpenses(merged, notify);
    },
    [fetchExpenses],
  );

  const goToPage = useCallback(
    async (page: number) => {
      await applyFilters({ page }, false);
    },
    [applyFilters],
  );

  const categoryOptions = useMemo(
    () => categories.map((category) => category.name),
    [categories],
  );

  return {
    user,
    salary,
    summary,
    categories,
    categoryOptions,
    mostSpentCategory,
    expenses,
    filters,
    pagination,
    loading: initialLoading || authLoading,
    summaryLoading,
    expensesLoading,
    salarySaving,
    salaryDeleting,
    categorySaving,
    deletingCategoryName,
    expenseSaving,
    deletingExpenseId,
    error,
    refreshAll,
    refreshExpenses,
    saveSalary,
    resetSalary,
    createCategory,
    deleteCategory,
    createExpense,
    updateExpense,
    deleteExpense,
    updateFilterField,
    setPage,
    applyFilters,
    goToPage,
  };
}
