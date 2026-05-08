"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { ApiError, isUnauthorizedError, loansAPI, moneyAPI } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type {
  BalanceResponse,
  BalanceSource,
  CreateExpenseRequest,
  ExpensesQuery,
  MoneyCategory,
  MoneyExpense,
  MoneyInsights,
  MoneyPagination,
  MoneySummary,
  MonthlySummaryResponse,
  MonthlyExpenseSummary,
  SalaryRecord,
  UpdateExpenseRequest,
  UpdateSalaryRequest,
} from "@/types/money";

type FormErrors = Record<string, string>;

type FiltersState = {
  startDate: string;
  endDate: string;
  category: string;
  page: number;
  limit: number;
};

function toIsoDateValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getMonthRange(date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const start = new Date(Date.UTC(year, month, 1));
  const end = new Date(Date.UTC(year, month + 1, 0));

  return {
    startDate: toIsoDateValue(start),
    endDate: toIsoDateValue(end),
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

function getCurrentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function findMonthlyTotal(monthlyExpenseSummary: unknown, monthKey: string) {
  if (!Array.isArray(monthlyExpenseSummary)) {
    return 0;
  }

  return (
    monthlyExpenseSummary.find(
      (item) =>
        item?.month === monthKey ||
        item?.month?.startsWith?.(monthKey) ||
        item?.month?.startsWith?.(`${monthKey}-`),
    )?.total ?? 0
  );
}

function defaultSummary(): MoneySummary {
  return {
    salaryAmount: 0,
    availableBalance: 0,
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

function findSalaryForMonth(
  history: SalaryRecord[],
  monthKey: string,
): SalaryRecord | null {
  if (!monthKey || history.length === 0) return null;
  const [yearStr, monthStr] = monthKey.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  const lastDay = new Date(Date.UTC(year, month, 0));

  return (
    history
      .filter((r) => new Date(r.date) <= lastDay)
      .sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      )[0] ?? null
  );
}

export function useMoneyDashboard() {
  const { user, loading: authLoading, clearUser } = useAuth();
  const userId = user?.id ?? null;
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthKey);
  const [categories, setCategories] = useState<MoneyCategory[]>([]);
  const [salary, setSalary] = useState<SalaryRecord | null>(null);
  const [salaryHistory, setSalaryHistory] = useState<SalaryRecord[]>([]);
  const [balanceSources, setBalanceSources] = useState<BalanceSource[]>([]);
  const [monthlyExpenseSummary, setMonthlyExpenseSummary] = useState<
    MonthlyExpenseSummary[]
  >([]);
  const [summary, setSummary] = useState<MoneySummary>(defaultSummary);
  const [insights, setInsights] = useState<MoneyInsights | null>(null);
  const [historicalSummary, setHistoricalSummary] = useState<MonthlySummaryResponse | null>(null);
  const [expenses, setExpenses] = useState<MoneyExpense[]>([]);
  const [pagination, setPagination] = useState<MoneyPagination>(
    createDefaultPagination(),
  );

  const summaryWithFallback = useMemo(() => {
    const currentMonthKey = getCurrentMonthKey();
    const fallbackMonthSpent =
      findMonthlyTotal(monthlyExpenseSummary, currentMonthKey) ||
      expenses.reduce((sum, expense) => {
        const expenseDate = new Date(expense.date);
        const now = new Date();
        return expenseDate.getFullYear() === now.getFullYear() &&
          expenseDate.getMonth() === now.getMonth()
          ? sum + expense.amount
          : sum;
      }, 0);

    const totalExpenses =
      summary.totalExpenses ||
      expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const expenseCount = summary.expenseCount || expenses.length;
    const averageExpense =
      summary.averageExpense ||
      (expenseCount > 0 ? totalExpenses / expenseCount : 0);
    const salaryAmount = salary?.amount ?? summary.salaryAmount;
    const remainingSalary =
      summary.remainingSalary || salaryAmount - fallbackMonthSpent;

    return {
      ...summary,
      currentMonthSpent: summary.currentMonthSpent || fallbackMonthSpent,
      averageExpense,
      remainingSalary,
      expenseCount,
      totalExpenses,
    };
  }, [expenses, monthlyExpenseSummary, salary, summary]);
  const isCurrentMonth = useMemo(
    () => selectedMonth === getCurrentMonthKey(),
    [selectedMonth],
  );

  const monthlyReportSalary = useMemo(
    () => findSalaryForMonth(salaryHistory, selectedMonth),
    [salaryHistory, selectedMonth],
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
  const [balanceSaving, setBalanceSaving] = useState(false);
  const [balanceDeleting, setBalanceDeleting] = useState(false);
  const [categorySaving, setCategorySaving] = useState(false);
  const [deletingCategoryName, setDeletingCategoryName] = useState<
    string | null
  >(null);
  const [expenseSaving, setExpenseSaving] = useState(false);
  const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);
  const lastToastMessage = useRef<string | null>(null);
  const filtersRef = useRef<FiltersState>({
    ...getMonthRange(),
    category: "",
    page: 1,
    limit: 10,
  });
  const selectedMonthRef = useRef(getCurrentMonthKey());

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  useEffect(() => {
    selectedMonthRef.current = selectedMonth;
  }, [selectedMonth]);

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

        const [salaryResponse, summaryResponse, balanceResponse] =
          await Promise.all([
            moneyAPI.getCurrentSalary(),
            moneyAPI.getSummary(),
            moneyAPI.getBalanceSources(),
          ]);

        if (!isMounted.current) return;

        setSalary(salaryResponse);
        setSummary(summaryResponse ?? defaultSummary());
        setBalanceSources(balanceResponse?.sources ?? []);
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

  const fetchSalaryHistory = useCallback(
    async (notify = false) => {
      if (!userId) return;

      try {
        const history = await moneyAPI.getSalaryHistory();

        if (!isMounted.current) return;

        setSalaryHistory(history ?? []);
        setError(null);
        clearToastLock();
      } catch (error: unknown) {
        handleError(error, "Failed to load salary history", notify);
      }
    },
    [clearToastLock, handleError, userId],
  );

  const fetchInsights = useCallback(
    async (notify = false) => {
      if (!userId) return;

      try {
        const [yearStr, monthStr] = selectedMonthRef.current.split("-");
        const result = await moneyAPI.getInsights({
          month: Number(monthStr),
          year: Number(yearStr),
        });

        if (!isMounted.current) return;

        setInsights(result);
        clearToastLock();
      } catch (error: unknown) {
        handleError(error, "Failed to load insights", notify);
      }
    },
    [clearToastLock, handleError, userId],
  );

  const fetchHistoricalSummary = useCallback(
    async (month: number, year: number, notify = false) => {
      if (!userId) return;

      try {
        const result = await moneyAPI.getMonthSummary(month, year);

        if (!isMounted.current) return;

        setHistoricalSummary(result);
        clearToastLock();
      } catch (error: unknown) {
        handleError(error, "Failed to load monthly summary", notify);
      }
    },
    [clearToastLock, handleError, userId],
  );

  const fetchMonthlySummary = useCallback(
    async (notify = false) => {
      if (!userId) return;

      try {
        const summary = await moneyAPI.getMonthlyExpenseSummary();
        const safeSummary = Array.isArray(summary) ? summary : [];

        if (!isMounted.current) return;

        setMonthlyExpenseSummary(safeSummary);
        setError(null);
        clearToastLock();
      } catch (error: unknown) {
        handleError(error, "Failed to load monthly expense summary", notify);
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
        const [yearStr, monthStr] = selectedMonthRef.current.split("-");
        const isHistorical = selectedMonthRef.current !== getCurrentMonthKey();
        await Promise.all([
          fetchCategories(notify),
          fetchSummaryBundle(notify),
          fetchSalaryHistory(notify),
          fetchMonthlySummary(notify),
          isHistorical
            ? fetchHistoricalSummary(Number(monthStr), Number(yearStr), notify)
            : fetchInsights(notify),
          fetchExpenses(filtersRef.current, notify),
        ]);
      } finally {
        if (isMounted.current) {
          setInitialLoading(false);
        }
      }
    },
    [
      authLoading,
      fetchCategories,
      fetchExpenses,
      fetchHistoricalSummary,
      fetchInsights,
      fetchMonthlySummary,
      fetchSalaryHistory,
      fetchSummaryBundle,
      userId,
    ],
  );

  const refreshAfterMutation = useCallback(
    async (nextFilters?: FiltersState) => {
      const targetFilters = nextFilters ?? filtersRef.current;

      await Promise.all([
        fetchCategories(false),
        fetchSummaryBundle(false),
        fetchSalaryHistory(false),
        fetchMonthlySummary(false),
        fetchInsights(false),
        fetchExpenses(targetFilters, false),
      ]);
    },
    [
      fetchCategories,
      fetchExpenses,
      fetchInsights,
      fetchMonthlySummary,
      fetchSalaryHistory,
      fetchSummaryBundle,
    ],
  );

  useEffect(() => {
    queueMicrotask(() => {
      void refreshAll(false);
    });
  }, [refreshAll]);

  const validateSalary = useCallback((amount: string, date: string) => {
    const nextErrors: FormErrors = {};

    if (!amount.trim()) {
      nextErrors.amount = "Salary amount is required.";
    } else if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      nextErrors.amount = "Salary must be greater than zero.";
    }

    if (!date) {
      nextErrors.date = "Salary date is required.";
    }

    return nextErrors;
  }, []);

  const validateCategory = useCallback(
    (name: string) => {
      const nextErrors: FormErrors = {};
      const normalized = normalizeCategoryName(name);

      if (!normalized) {
        nextErrors.name = "Category name is required.";
      } else if (categories.some((category) => category.name === normalized)) {
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

      if (!payload.note.trim()) {
        nextErrors.note = "Note is required.";
      }

      if (!normalizedCategory) {
        nextErrors.category = "Please select a category.";
      } else if (
        !categories.some((category) => category.name === normalizedCategory)
      ) {
        nextErrors.category =
          "Create this category first before saving the expense.";
      }

      if (!payload.date) {
        nextErrors.date = "Expense date is required.";
      }

      return nextErrors;
    },
    [categories],
  );

  const saveSalary = useCallback(
    async (amount: string, date: string) => {
      const errors = validateSalary(amount, date);
      if (Object.keys(errors).length > 0) {
        return { ok: false as const, errors };
      }

      try {
        setSalarySaving(true);
        setError(null);
        await moneyAPI.createSalary({
          amount: Number(amount),
          date,
        });
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

  const addBalanceSource = useCallback(
    async (type: BalanceSource["type"], amount: string) => {
      const errors: FormErrors = {};
      if (!type) {
        errors.type = "Source type is required.";
      }

      if (!amount.trim()) {
        errors.amount = "Balance amount is required.";
      } else if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
        errors.amount = "Amount must be greater than zero.";
      }

      if (Object.keys(errors).length > 0) {
        return { ok: false as const, errors };
      }

      try {
        setBalanceSaving(true);
        setError(null);
        await moneyAPI.addBalanceSource({
          type,
          amount: Number(amount),
        });
        await refreshAfterMutation();
        toast.success("Balance source added");
        return { ok: true as const, errors: {} };
      } catch (error: unknown) {
        handleError(error, "Failed to add balance source", true);
        return { ok: false as const, errors: {} };
      } finally {
        if (isMounted.current) {
          setBalanceSaving(false);
        }
      }
    },
    [handleError, refreshAfterMutation],
  );

  const updateBalanceSource = useCallback(
    async (id: string, type: BalanceSource["type"], amount: string) => {
      const errors: FormErrors = {};
      if (!type) {
        errors.type = "Source type is required.";
      }

      if (!amount.trim()) {
        errors.amount = "Balance amount is required.";
      } else if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
        errors.amount = "Amount must be greater than zero.";
      }

      if (Object.keys(errors).length > 0) {
        return { ok: false as const, errors };
      }

      try {
        setBalanceSaving(true);
        setError(null);
        await moneyAPI.updateBalanceSource(id, {
          type,
          amount: Number(amount),
        });
        await refreshAfterMutation();
        toast.success("Balance source updated");
        return { ok: true as const, errors: {} };
      } catch (error: unknown) {
        handleError(error, "Failed to update balance source", true);
        return { ok: false as const, errors: {} };
      } finally {
        if (isMounted.current) {
          setBalanceSaving(false);
        }
      }
    },
    [handleError, refreshAfterMutation],
  );

  const deleteBalanceSource = useCallback(
    async (id: string) => {
      try {
        setBalanceDeleting(true);
        setError(null);
        await moneyAPI.deleteBalanceSource(id);
        await refreshAfterMutation();
        toast.success("Balance source deleted");
        return true;
      } catch (error: unknown) {
        handleError(error, "Failed to delete balance source", true);
        return false;
      } finally {
        if (isMounted.current) {
          setBalanceDeleting(false);
        }
      }
    },
    [handleError, refreshAfterMutation],
  );

  const resetSalary = useCallback(async () => {
    try {
      setSalaryDeleting(true);
      setError(null);

      // Delete dedicated salary record; 404 = nothing to delete, continue
      try {
        await moneyAPI.deleteSalary();
      } catch (err: unknown) {
        if (!(err instanceof ApiError && err.status === 404)) throw err;
      }

      // Also delete all SALARY-type balance sources
      const salarySourceIds = balanceSources
        .filter((s) => s.type === "SALARY")
        .map((s) => s._id);
      if (salarySourceIds.length > 0) {
        await Promise.all(
          salarySourceIds.map((id) => moneyAPI.deleteBalanceSource(id)),
        );
      }

      if (isMounted.current) setSalary(null);
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
  }, [handleError, refreshAfterMutation, balanceSources]);

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
          const message =
            "This category is already used by expenses and cannot be deleted.";
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
        note: payload.note.trim(),
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
        note: payload.note.trim(),
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

  const recordLoanFunds = useCallback(
    async (personName: string, amount: number, reason: string, date: string) => {
      try {
        await loansAPI.create({ personName, amount, reason, date });
        await refreshAfterMutation();
        toast.success("Loan recorded — balance updated");
        return true;
      } catch (error: unknown) {
        handleError(error, "Failed to record loan", true);
        return false;
      }
    },
    [handleError, refreshAfterMutation],
  );

  const addExternalIncome = useCallback(
    async (amount: number, source: string, note: string, date: string) => {
      try {
        await moneyAPI.addIncome({ amount, source, note, date });
        await refreshAfterMutation();
        toast.success("External income added");
        return true;
      } catch (error: unknown) {
        handleError(error, "Failed to add external income", true);
        return false;
      }
    },
    [handleError, refreshAfterMutation],
  );

  const addOtherSavings = useCallback(
    async (amount: number, sourceName: string, note: string, date: string) => {
      try {
        await moneyAPI.addSavings({ amount, sourceName, note, date });
        await refreshAfterMutation();
        toast.success("Savings added");
        return true;
      } catch (error: unknown) {
        handleError(error, "Failed to add savings", true);
        return false;
      }
    },
    [handleError, refreshAfterMutation],
  );

  const changeSelectedMonth = useCallback(
    async (monthKey: string) => {
      const [yearStr, monthStr] = monthKey.split("-");
      const year = Number(yearStr);
      const month = Number(monthStr);
      const start = new Date(Date.UTC(year, month - 1, 1));
      const end = new Date(Date.UTC(year, month, 0));
      const nextFilters: FiltersState = {
        startDate: toIsoDateValue(start),
        endDate: toIsoDateValue(end),
        category: "",
        page: 1,
        limit: filtersRef.current.limit,
      };

      selectedMonthRef.current = monthKey;

      if (isMounted.current) {
        setSelectedMonth(monthKey);
        setHistoricalSummary(null);
        filtersRef.current = nextFilters;
        setFilters(nextFilters);
      }

      if (monthKey !== getCurrentMonthKey()) {
        await Promise.all([
          fetchExpenses(nextFilters, false),
          fetchHistoricalSummary(month, year, false),
        ]);
      } else {
        await Promise.all([
          fetchExpenses(nextFilters, false),
          fetchInsights(false),
        ]);
      }
    },
    [fetchExpenses, fetchHistoricalSummary, fetchInsights],
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
    salaryHistory,
    balanceSources,
    monthlyExpenseSummary,
    summary: summaryWithFallback,
    insights,
    historicalSummary,
    categories,
    categoryOptions,
    expenses,
    filters,
    pagination,
    selectedMonth,
    isCurrentMonth,
    monthlyReportSalary,
    loading: initialLoading || authLoading,
    summaryLoading,
    expensesLoading,
    salarySaving,
    salaryDeleting,
    balanceSaving,
    balanceDeleting,
    categorySaving,
    deletingCategoryName,
    expenseSaving,
    deletingExpenseId,
    error,
    refreshAll,
    refreshExpenses,
    saveSalary,
    resetSalary,
    addBalanceSource,
    updateBalanceSource,
    deleteBalanceSource,
    createCategory,
    deleteCategory,
    createExpense,
    updateExpense,
    deleteExpense,
    recordLoanFunds,
    addExternalIncome,
    addOtherSavings,
    changeSelectedMonth,
    updateFilterField,
    setPage,
    applyFilters,
    goToPage,
  };
}
