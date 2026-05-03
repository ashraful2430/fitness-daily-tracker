"use client";

import { useMemo, useRef, useState } from "react";
import {
  BadgeDollarSign,
  CalendarRange,
  Coins,
  CreditCard,
  Loader2,
  PencilLine,
  PiggyBank,
  Plus,
  ReceiptText,
  RefreshCcw,
  Sparkles,
  Tags,
  Trash2,
  TrendingDown,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useMoneyDashboard } from "@/hooks/useMoneyDashboard";
import type { BalanceSource, MoneyExpense } from "@/types/money";

type FormErrors = Record<string, string>;

type ExpenseFormState = {
  amount: string;
  note: string;
  category: string;
  date: string;
};

const chartColors = ["#10b981", "#06b6d4", "#8b5cf6", "#f97316", "#ec4899"];

function formatAmount(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "0";
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function expenseToForm(expense: MoneyExpense): ExpenseFormState {
  return {
    amount: String(expense.amount),
    note: expense.note,
    category: expense.category,
    date: expense.date.slice(0, 10),
  };
}

function emptyExpenseForm(defaultCategory = ""): ExpenseFormState {
  return {
    amount: "",
    note: "",
    category: defaultCategory,
    date: getToday(),
  };
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  gradient,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  gradient: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60 dark:border-white/[0.08] dark:bg-[#120d27] dark:shadow-black/30"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/35 to-transparent" />
      <div
        className={`absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br ${gradient} opacity-15 blur-3xl`}
      />

      <div
        className={`mb-4 flex h-12 w-12 items-center justify-center rounded-[1.15rem] bg-gradient-to-br ${gradient} text-white shadow-lg shadow-slate-900/10`}
      >
        <Icon className="h-5 w-5" />
      </div>

      <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">
        {title}
      </p>
      <p className="mt-2 text-3xl font-black tracking-[-0.03em] text-slate-950 dark:text-white">
        {value}
      </p>
      <p className="mt-2 text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">
        {subtitle}
      </p>
    </motion.div>
  );
}

export default function MoneyDashboard() {
  const {
    user,
    salary,
    salaryHistory,
    balanceSources,
    monthlyExpenseSummary,
    summary,
    categories,
    categoryOptions,
    expenses,
    filters,
    pagination,
    loading,
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
    updateFilterField,
    applyFilters,
    goToPage,
  } = useMoneyDashboard();

  const [salaryAmount, setSalaryAmount] = useState("");
  const [salaryDate, setSalaryDate] = useState(getToday());
  const [salaryErrors, setSalaryErrors] = useState<FormErrors>({});
  const [balanceForm, setBalanceForm] = useState<{
    type: BalanceSource["type"];
    amount: string;
  }>({
    type: "BANK",
    amount: "",
  });
  const [balanceErrors, setBalanceErrors] = useState<FormErrors>({});
  const [editingBalanceId, setEditingBalanceId] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryErrors, setCategoryErrors] = useState<FormErrors>({});
  const [expenseForm, setExpenseForm] =
    useState<ExpenseFormState>(emptyExpenseForm());
  const [expenseErrors, setExpenseErrors] = useState<FormErrors>({});
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const expenseFormRef = useRef<HTMLDivElement | null>(null);

  const chartData = useMemo(
    () =>
      (summary?.topCategories || []).map((category) => ({
        name: category._id,
        totalSpent: category.totalSpent,
      })),
    [summary?.topCategories],
  );

  const activeCategory = expenseForm.category || categoryOptions[0] || "";
  const salaryDisplay = salary?.amount ?? summary.salaryAmount ?? 0;
  const mostSpentCategory = summary?.topCategories?.[0];
  const totalBalance = balanceSources.reduce(
    (sum, source) => sum + source.amount,
    0,
  );
  const cashBalance = balanceSources
    .filter((source) => source.type === "CASH")
    .reduce((sum, source) => sum + source.amount, 0);
  const bankBalance = balanceSources
    .filter((source) => source.type === "BANK")
    .reduce((sum, source) => sum + source.amount, 0);
  const salarySourceBalance = balanceSources
    .filter((source) => source.type === "SALARY")
    .reduce((sum, source) => sum + source.amount, 0);
  const externalBalance = balanceSources
    .filter((source) => source.type === "EXTERNAL")
    .reduce((sum, source) => sum + source.amount, 0);

  const resetExpenseForm = () => {
    setEditingExpenseId(null);
    setExpenseErrors({});
    setExpenseForm(emptyExpenseForm(categoryOptions[0] || ""));
  };

  const handleSalarySubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    const result = await saveSalary(salaryAmount, salaryDate);
    setSalaryErrors(result.errors);

    if (result.ok) {
      setSalaryAmount("");
    }
  };

  const handleSalaryReset = async () => {
    const confirmed = window.confirm(
      "Reset your saved salary? This removes the current salary value.",
    );

    if (!confirmed) return;

    const ok = await resetSalary();
    if (ok) {
      setSalaryAmount("");
      setSalaryErrors({});
    }
  };

  const handleBalanceSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    const action = editingBalanceId
      ? updateBalanceSource(
          editingBalanceId,
          balanceForm.type,
          balanceForm.amount,
        )
      : addBalanceSource(balanceForm.type, balanceForm.amount);
    const result = await action;
    setBalanceErrors(result.errors || {});

    if (result.ok) {
      setBalanceForm({ type: "BANK", amount: "" });
      setEditingBalanceId(null);
    }
  };

  const handleBalanceCancel = () => {
    setEditingBalanceId(null);
    setBalanceForm({ type: "BANK", amount: "" });
    setBalanceErrors({});
  };

  const handleEditBalanceSource = (source: BalanceSource) => {
    setEditingBalanceId(source._id);
    setBalanceErrors({});
    setBalanceForm({ type: source.type, amount: String(source.amount) });
    requestAnimationFrame(() => {
      document
        .getElementById("balance-form")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const handleDeleteBalanceSource = async (source: BalanceSource) => {
    const confirmed = window.confirm(
      `Remove ${source.type.toLowerCase()} source with ${formatAmount(
        source.amount,
      )}?`,
    );

    if (!confirmed) return;

    const ok = await deleteBalanceSource(source._id);
    if (ok && editingBalanceId === source._id) {
      handleBalanceCancel();
    }
  };

  const handleCategorySubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    const result = await createCategory(categoryName);
    setCategoryErrors(result.errors);

    if (result.ok) {
      setCategoryName("");
    }
  };

  const handleCategoryDelete = async (name: string) => {
    const confirmed = window.confirm(
      `Delete category "${name}"? This only works if no expenses use it.`,
    );

    if (!confirmed) return;

    await deleteCategory(name);
  };

  const handleExpenseSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const payload = {
      amount: Number(expenseForm.amount),
      note: expenseForm.note,
      category: activeCategory,
      date: expenseForm.date,
    };

    const result = editingExpenseId
      ? await updateExpense(editingExpenseId, payload)
      : await createExpense(payload);

    setExpenseErrors(result.errors);

    if (result.ok) {
      resetExpenseForm();
    }
  };

  const handleEditExpense = (expense: MoneyExpense) => {
    setEditingExpenseId(expense._id);
    setExpenseErrors({});
    setExpenseForm(expenseToForm(expense));
    requestAnimationFrame(() => {
      expenseFormRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  const handleDeleteExpense = async (expense: MoneyExpense) => {
    const confirmed = window.confirm(
      `Delete expense "${expense.note}" for ${formatAmount(expense.amount)}?`,
    );

    if (!confirmed) return;

    const ok = await deleteExpense(expense._id);

    if (ok && editingExpenseId === expense._id) {
      resetExpenseForm();
    }
  };

  const handleApplyFilters = async (
    event?: React.FormEvent<HTMLFormElement>,
  ) => {
    event?.preventDefault();
    await applyFilters({ page: 1 }, true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-6 dark:bg-[#09090f] sm:px-6 lg:px-8 xl:px-10">
        <div className="grid gap-5">
          <div className="h-56 animate-pulse rounded-[2rem] bg-white shadow-xl shadow-slate-200/60 dark:bg-white/[0.04]" />
          <div className="grid gap-4 xl:grid-cols-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="h-40 animate-pulse rounded-[2rem] bg-white shadow-xl shadow-slate-200/60 dark:bg-white/[0.04]"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-[#09090f] dark:text-white">
      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <div className="absolute left-[8%] top-0 h-[420px] w-[420px] rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute bottom-0 right-[8%] h-[360px] w-[360px] rounded-full bg-cyan-500/10 blur-[110px]" />
      </div>

      <div className="relative z-10 space-y-5 px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
        <section className="relative overflow-hidden rounded-[2.3rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70 dark:border-white/[0.08] dark:bg-[#110d2e] dark:shadow-black/30 md:p-8">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />
          <div className="absolute -right-14 top-10 h-44 w-44 rounded-full bg-emerald-400/10 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0 flex-1">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-[11px] font-black uppercase tracking-[0.24em] text-emerald-700 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-emerald-300">
                <PiggyBank className="h-3.5 w-3.5" />
                Money Management
              </div>

              <h1 className="mt-5 text-[clamp(1.75rem,4vw,4.6rem)] font-black leading-[0.95] tracking-[-0.04em] text-slate-950 dark:text-white">
                Budget with clarity,
                <span className="block bg-gradient-to-r from-emerald-500 via-cyan-500 to-violet-500 bg-clip-text text-transparent">
                  track every move with confidence.
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300/85 sm:text-base">
                Salary, categories, expenses, and insights now live together in
                one production-ready flow built on your authenticated backend.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 shrink-0">
              {[
                { label: "Logged in as", value: user?.name ?? "Unknown user" },
                {
                  label: "Tracked categories",
                  value: String(categories.length),
                },
                { label: "Total records", value: String(summary.expenseCount) },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-[1.45rem] border border-slate-200 bg-slate-50 px-4 py-4 dark:border-white/[0.08] dark:bg-white/[0.04]"
                >
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">
                    {item.label}
                  </p>
                  <p className="mt-2 text-lg font-black text-slate-950 dark:text-white">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <StatCard
            title="Current Salary"
            value={formatAmount(salaryDisplay)}
            subtitle="Latest saved salary value."
            icon={Wallet}
            gradient="from-emerald-500 to-lime-400"
          />
          <StatCard
            title="Available Balance"
            value={formatAmount(totalBalance)}
            subtitle="Summed across all balance sources."
            icon={CreditCard}
            gradient="from-cyan-500 to-sky-400"
          />
          <StatCard
            title="Current Month Spent"
            value={formatAmount(summary.currentMonthSpent)}
            subtitle="Spending during the current month."
            icon={TrendingDown}
            gradient="from-rose-500 to-orange-400"
          />
          <StatCard
            title="Remaining Salary"
            value={formatAmount(summary.remainingSalary)}
            subtitle="Salary minus recorded expenses."
            icon={BadgeDollarSign}
            gradient="from-violet-600 to-fuchsia-500"
          />
          <StatCard
            title="Average Expense"
            value={formatAmount(summary.averageExpense)}
            subtitle="Average amount per expense."
            icon={Coins}
            gradient="from-cyan-500 to-sky-400"
          />
          <StatCard
            title="Expense Count"
            value={formatAmount(summary.expenseCount)}
            subtitle="Total number of stored expenses."
            icon={ReceiptText}
            gradient="from-indigo-500 to-blue-400"
          />
        </section>

        {error ? (
          <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
            {error}
          </div>
        ) : null}

        <section className="grid gap-5 lg:grid-cols-[1fr_0.9fr] xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-5">
            <div className="rounded-[2rem] border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 shadow-xl shadow-slate-200/50 dark:border-white/[0.08] dark:bg-gradient-to-br dark:from-[#0f0c1f] dark:to-[#0a0715] dark:shadow-black/20">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-emerald-500 dark:text-emerald-300">
                    Salary
                  </p>
                  <h2 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
                    Set, update, or reset salary
                  </h2>
                </div>

                <button
                  onClick={() => void refreshAll(true)}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-slate-400 dark:hover:bg-white/[0.10] dark:hover:text-white"
                  aria-label="Refresh money data"
                >
                  <RefreshCcw
                    className={`h-4.5 w-4.5 ${summaryLoading ? "animate-spin" : ""}`}
                  />
                </button>
              </div>

              <div className="mb-4 rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 p-3.5 dark:border-white/[0.08] dark:from-white/[0.04] dark:to-white/[0.02]">
                <p className="text-sm font-bold text-slate-500">
                  Current salary
                </p>
                <p className="mt-2 text-3xl font-black text-slate-950 dark:text-white">
                  {formatAmount(salaryDisplay)}
                </p>
              </div>

              <form onSubmit={handleSalarySubmit} className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-600 dark:text-slate-300">
                      Salary amount
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={salaryAmount}
                      placeholder={
                        salaryDisplay ? String(salaryDisplay) : "50000"
                      }
                      onChange={(event) => {
                        setSalaryAmount(event.target.value);
                        if (salaryErrors.amount) setSalaryErrors({});
                      }}
                      aria-label="Monthly salary amount"
                      aria-invalid={!!salaryErrors.amount}
                      aria-describedby={
                        salaryErrors.amount ? "salary-error" : undefined
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-semibold outline-none transition focus:border-emerald-500 focus:bg-white dark:border-white/[0.08] dark:bg-white/[0.04] dark:focus:bg-white/[0.06]"
                    />
                    {salaryErrors.amount ? (
                      <p
                        className="mt-2 text-sm font-semibold text-rose-500"
                        id="salary-error"
                        role="alert"
                      >
                        {salaryErrors.amount}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-600 dark:text-slate-300">
                      Salary date
                    </label>
                    <input
                      type="date"
                      value={salaryDate}
                      onChange={(event) => {
                        setSalaryDate(event.target.value);
                        if (salaryErrors.date) setSalaryErrors({});
                      }}
                      aria-label="Salary date"
                      aria-invalid={!!salaryErrors.date}
                      aria-describedby={
                        salaryErrors.date ? "salary-date-error" : undefined
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-semibold outline-none transition focus:border-emerald-500 focus:bg-white dark:border-white/[0.08] dark:bg-white/[0.04] dark:focus:bg-white/[0.06]"
                    />
                    {salaryErrors.date ? (
                      <p
                        className="mt-2 text-sm font-semibold text-rose-500"
                        id="salary-date-error"
                        role="alert"
                      >
                        {salaryErrors.date}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="submit"
                    disabled={salarySaving}
                    className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-cyan-500 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-emerald-950/25 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {salarySaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CreditCard className="h-4 w-4" />
                    )}
                    Save
                  </button>

                  <button
                    type="button"
                    onClick={handleSalaryReset}
                    disabled={salaryDeleting}
                    className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-3.5 text-sm font-black text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-70 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200"
                  >
                    {salaryDeleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    Reset
                  </button>
                </div>
              </form>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 shadow-xl shadow-slate-200/50 dark:border-white/[0.08] dark:bg-gradient-to-br dark:from-[#0f0c1f] dark:to-[#0a0715] dark:shadow-black/20">
              <div className="mb-5">
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-cyan-500 dark:text-cyan-300">
                  Available Balance
                </p>
                <h2 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
                  Track bank/cash balance outside salary
                </h2>
              </div>

              <div className="mb-4 rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 p-3.5 dark:border-white/[0.08] dark:from-white/[0.04] dark:to-white/[0.02]">
                <p className="text-sm font-bold text-slate-500">
                  Current available balance
                </p>
                <p className="mt-2 text-3xl font-black text-slate-950 dark:text-white">
                  {formatAmount(totalBalance)}
                </p>
              </div>

              <form
                id="balance-form"
                onSubmit={handleBalanceSubmit}
                className="space-y-4"
              >
                <div className="grid gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-600 dark:text-slate-300">
                      Balance amount
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={balanceForm.amount}
                      placeholder={String(totalBalance || 0)}
                      onChange={(event) => {
                        setBalanceForm((current) => ({
                          ...current,
                          amount: event.target.value,
                        }));
                        if (balanceErrors.amount) setBalanceErrors({});
                      }}
                      aria-label="Available balance amount"
                      aria-invalid={!!balanceErrors.amount}
                      aria-describedby={
                        balanceErrors.amount ? "balance-error" : undefined
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-semibold outline-none transition focus:border-cyan-500 focus:bg-white dark:border-white/[0.08] dark:bg-white/[0.04] dark:focus:bg-white/[0.06]"
                    />
                    {balanceErrors.amount ? (
                      <p
                        className="mt-2 text-sm font-semibold text-rose-500"
                        id="balance-error"
                        role="alert"
                      >
                        {balanceErrors.amount}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-600 dark:text-slate-300">
                      Balance source type
                    </label>
                    <select
                      value={balanceForm.type}
                      onChange={(event) =>
                        setBalanceForm((current) => ({
                          ...current,
                          type: event.target.value as BalanceSource["type"],
                        }))
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-semibold outline-none transition focus:border-cyan-500 focus:bg-white dark:border-white/[0.08] dark:bg-white/[0.04] dark:focus:bg-white/[0.06]"
                    >
                      <option value="BANK">Bank</option>
                      <option value="CASH">Cash</option>
                      <option value="SALARY">Salary</option>
                      <option value="EXTERNAL">External</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="submit"
                    disabled={balanceSaving}
                    className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-500 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-cyan-950/25 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {balanceSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Coins className="h-4 w-4" />
                    )}
                    {editingBalanceId ? "Update" : "Save"}
                  </button>

                  <button
                    type="button"
                    onClick={handleBalanceCancel}
                    disabled={balanceSaving}
                    className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3.5 text-sm font-black text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-slate-200"
                  >
                    <RefreshCcw className="h-4 w-4" />
                    {editingBalanceId ? "Cancel" : "Clear"}
                  </button>
                </div>
              </form>

              {balanceSources.length > 0 ? (
                <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 shadow-sm dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-200">
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        Balance sources
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Edit or remove individual balance sources.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                      <div className="rounded-2xl bg-white px-3 py-2 shadow-sm dark:bg-white/[0.04]">
                        <p className="font-black uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                          Bank
                        </p>
                        <p className="mt-1 font-bold text-slate-900 dark:text-white">
                          {formatAmount(bankBalance)}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-white px-3 py-2 shadow-sm dark:bg-white/[0.04]">
                        <p className="font-black uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                          Cash
                        </p>
                        <p className="mt-1 font-bold text-slate-900 dark:text-white">
                          {formatAmount(cashBalance)}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-white px-3 py-2 shadow-sm dark:bg-white/[0.04]">
                        <p className="font-black uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                          Salary
                        </p>
                        <p className="mt-1 font-bold text-slate-900 dark:text-white">
                          {formatAmount(salarySourceBalance)}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-white px-3 py-2 shadow-sm dark:bg-white/[0.04]">
                        <p className="font-black uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                          External
                        </p>
                        <p className="mt-1 font-bold text-slate-900 dark:text-white">
                          {formatAmount(externalBalance)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {balanceSources.map((source) => (
                      <div
                        key={source._id}
                        className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/[0.08] dark:bg-[#0b1020] sm:grid-cols-[1fr_1fr_auto] lg:grid-cols-[1fr_1fr_auto]"
                      >
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                            {source.type}
                          </p>
                          <p className="mt-2 text-lg font-black text-slate-950 dark:text-white">
                            {formatAmount(source.amount)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                            Created
                          </p>
                          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                            {source.createdAt
                              ? formatDate(source.createdAt)
                              : "Unknown"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditBalanceSource(source)}
                            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-black text-slate-700 transition hover:bg-slate-100 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-slate-200"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteBalanceSource(source)}
                            className="inline-flex items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-black text-rose-700 transition hover:bg-rose-100 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-6 rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-slate-400">
                  No saved balance sources yet. Add one to track bank, cash,
                  salary, or external balances.
                </div>
              )}

              <p className="mt-4 text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">
                Use this to track your cash/bank balance separate from salary.
                Expenses can be deducted from this balance and salary together
                when both exist.
              </p>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 shadow-xl shadow-slate-200/50 dark:border-white/[0.08] dark:bg-gradient-to-br dark:from-[#0f0c1f] dark:to-[#0a0715] dark:shadow-black/20">
              <div className="mb-5">
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-violet-500 dark:text-violet-300">
                  Categories
                </p>
                <h2 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
                  Manage spending buckets
                </h2>
              </div>

              <form
                onSubmit={handleCategorySubmit}
                className="grid gap-4 grid-cols-1 sm:grid-cols-[1fr_auto]"
              >
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-600 dark:text-slate-300">
                    Category name
                  </label>
                  <input
                    value={categoryName}
                    onChange={(event) => {
                      setCategoryName(event.target.value);
                      if (categoryErrors.name) setCategoryErrors({});
                    }}
                    placeholder="food"
                    aria-label="New category name"
                    aria-invalid={!!categoryErrors.name}
                    aria-describedby={
                      categoryErrors.name ? "category-error" : undefined
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-semibold outline-none transition focus:border-violet-500 focus:bg-white dark:border-white/[0.08] dark:bg-white/[0.04] dark:focus:bg-white/[0.06]"
                  />
                  {categoryErrors.name ? (
                    <p
                      className="mt-2 text-sm font-semibold text-rose-500"
                      id="category-error"
                      role="alert"
                    >
                      {categoryErrors.name}
                    </p>
                  ) : null}
                </div>

                <button
                  type="submit"
                  disabled={categorySaving}
                  className="mt-0 sm:mt-[1.85rem] inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-violet-950/25 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {categorySaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  Add category
                </button>
              </form>

              <div className="mt-6 flex flex-wrap gap-3">
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <div
                      key={category._id}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-700 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-slate-200"
                    >
                      <Tags className="h-3.5 w-3.5 text-violet-500" />
                      <span>{category.name}</span>
                      <button
                        type="button"
                        onClick={() => void handleCategoryDelete(category.name)}
                        disabled={deletingCategoryName === category.name}
                        className="rounded-full p-1 text-slate-400 transition hover:text-rose-500 disabled:cursor-not-allowed disabled:opacity-70"
                        aria-label={`Delete ${category.name}`}
                      >
                        {deletingCategoryName === category.name ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="w-full rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm font-semibold text-slate-500 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-slate-400">
                    No categories yet. Add one before saving expenses.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div
            ref={expenseFormRef}
            className="scroll-mt-24 rounded-[2rem] border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 shadow-xl shadow-slate-200/50 dark:border-white/[0.08] dark:bg-gradient-to-br dark:from-[#0f0c1f] dark:to-[#0a0715] dark:shadow-black/20"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-cyan-500 dark:text-cyan-300">
                  Expense Management
                </p>
                <h2 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
                  {editingExpenseId ? "Edit expense" : "Add a new expense"}
                </h2>
              </div>

              {editingExpenseId ? (
                <button
                  type="button"
                  onClick={resetExpenseForm}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-slate-200"
                >
                  Cancel edit
                </button>
              ) : null}
            </div>

            <form onSubmit={handleExpenseSubmit} className="grid gap-3">
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-600 dark:text-slate-300">
                    Amount
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={expenseForm.amount}
                    onChange={(event) => {
                      setExpenseForm((current) => ({
                        ...current,
                        amount: event.target.value,
                      }));
                      if (expenseErrors.amount) setExpenseErrors({});
                    }}
                    placeholder="250"
                    aria-label="Expense amount"
                    aria-invalid={!!expenseErrors.amount}
                    aria-describedby={
                      expenseErrors.amount ? "amount-error" : undefined
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-semibold outline-none transition focus:border-cyan-500 focus:bg-white dark:border-white/[0.08] dark:bg-white/[0.04] dark:focus:bg-white/[0.06]"
                  />
                  {expenseErrors.amount ? (
                    <p
                      className="mt-2 text-sm font-semibold text-rose-500"
                      id="amount-error"
                      role="alert"
                    >
                      {expenseErrors.amount}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-600 dark:text-slate-300">
                    Date
                  </label>
                  <input
                    type="date"
                    value={expenseForm.date}
                    onChange={(event) => {
                      setExpenseForm((current) => ({
                        ...current,
                        date: event.target.value,
                      }));
                      if (expenseErrors.date) setExpenseErrors({});
                    }}
                    aria-label="Expense date"
                    aria-invalid={!!expenseErrors.date}
                    aria-describedby={
                      expenseErrors.date ? "date-error" : undefined
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-semibold outline-none transition focus:border-cyan-500 focus:bg-white dark:border-white/[0.08] dark:bg-white/[0.04] dark:focus:bg-white/[0.06]"
                  />
                  {expenseErrors.date ? (
                    <p
                      className="mt-2 text-sm font-semibold text-rose-500"
                      id="date-error"
                      role="alert"
                    >
                      {expenseErrors.date}
                    </p>
                  ) : null}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Note
                </label>
                <input
                  value={expenseForm.note}
                  onChange={(event) => {
                    setExpenseForm((current) => ({
                      ...current,
                      note: event.target.value,
                    }));
                    if (expenseErrors.note) setExpenseErrors({});
                  }}
                  placeholder="Lunch"
                  aria-label="Expense note"
                  aria-invalid={!!expenseErrors.note}
                  aria-describedby={
                    expenseErrors.note ? "note-error" : undefined
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-semibold outline-none transition focus:border-cyan-500 focus:bg-white dark:border-white/[0.08] dark:bg-white/[0.04] dark:focus:bg-white/[0.06]"
                />
                {expenseErrors.note ? (
                  <p
                    className="mt-2 text-sm font-semibold text-rose-500"
                    id="note-error"
                    role="alert"
                  >
                    {expenseErrors.note}
                  </p>
                ) : null}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Category
                </label>
                <select
                  value={activeCategory}
                  onChange={(event) => {
                    setExpenseForm((current) => ({
                      ...current,
                      category: event.target.value,
                    }));
                    if (expenseErrors.category) setExpenseErrors({});
                  }}
                  aria-label="Expense category"
                  aria-invalid={!!expenseErrors.category}
                  aria-describedby={
                    expenseErrors.category ? "category-select-error" : undefined
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-semibold outline-none transition focus:border-cyan-500 focus:bg-white dark:border-white/[0.08] dark:bg-white/[0.04] dark:focus:bg-white/[0.06]"
                >
                  <option value="">Select a category</option>
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {expenseErrors.category ? (
                  <p
                    className="mt-2 text-sm font-semibold text-rose-500"
                    id="category-select-error"
                    role="alert"
                  >
                    {expenseErrors.category}
                  </p>
                ) : null}
              </div>

              <button
                type="submit"
                disabled={expenseSaving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-500 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-cyan-950/30 transition hover:shadow-lg hover:shadow-cyan-600/40 hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {expenseSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : editingExpenseId ? (
                  <PencilLine className="h-4 w-4" />
                ) : (
                  <ReceiptText className="h-4 w-4" />
                )}
                {editingExpenseId ? "Update expense" : "Add expense"}
              </button>
            </form>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1fr_0.85fr] xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 shadow-xl shadow-slate-200/50 dark:border-white/[0.08] dark:bg-gradient-to-br dark:from-[#0f0c1f] dark:to-[#0a0715] dark:shadow-black/20">
            <div className="mb-4 space-y-3">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl">
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-orange-500 dark:text-orange-300">
                    Expense History
                  </p>
                  <h2 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
                    Review and refine your expense records
                  </h2>
                  <p className="mt-2 text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">
                    Narrow the list by date or category, then edit or remove
                    entries without leaving the page.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-3 shrink-0">
                  <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/[0.08] dark:bg-white/[0.04]">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                      Visible
                    </p>
                    <p className="mt-1 text-lg font-black text-slate-950 dark:text-white">
                      {expenses.length}
                    </p>
                  </div>
                  <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/[0.08] dark:bg-white/[0.04]">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                      Total
                    </p>
                    <p className="mt-1 text-lg font-black text-slate-950 dark:text-white">
                      {pagination.total}
                    </p>
                  </div>
                  <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/[0.08] dark:bg-white/[0.04]">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                      Page
                    </p>
                    <p className="mt-1 text-lg font-black text-slate-950 dark:text-white">
                      {pagination.page}/{pagination.totalPages}
                    </p>
                  </div>
                </div>
              </div>

              <form
                onSubmit={handleApplyFilters}
                className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 dark:border-white/[0.08] dark:bg-white/[0.03]"
              >
                <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto]">
                  <label className="space-y-1.5">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      From
                    </span>
                    <input
                      type="date"
                      value={filters.startDate}
                      onChange={(event) =>
                        updateFilterField("startDate", event.target.value)
                      }
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:border-white/[0.08] dark:bg-white/[0.06] dark:text-white"
                    />
                  </label>

                  <label className="space-y-1.5">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      To
                    </span>
                    <input
                      type="date"
                      value={filters.endDate}
                      onChange={(event) =>
                        updateFilterField("endDate", event.target.value)
                      }
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:border-white/[0.08] dark:bg-white/[0.06] dark:text-white"
                    />
                  </label>

                  <label className="space-y-1.5">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      Category
                    </span>
                    <select
                      value={filters.category}
                      onChange={(event) =>
                        updateFilterField("category", event.target.value)
                      }
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:border-white/[0.08] dark:bg-white/[0.06] dark:text-white"
                    >
                      <option value="">All categories</option>
                      {categoryOptions.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="flex items-end">
                    <button
                      type="submit"
                      disabled={expensesLoading}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-slate-900 to-slate-800 px-4 py-2 text-sm font-bold text-white transition hover:shadow-lg hover:shadow-slate-900/30 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70 dark:from-white dark:to-slate-100 dark:text-slate-950 lg:w-auto lg:min-w-[100px]"
                    >
                      {expensesLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CalendarRange className="h-4 w-4" />
                      )}
                      Apply
                    </button>
                  </div>
                </div>
              </form>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-white/[0.08]">
              <div className="hidden grid-cols-[0.95fr_1.6fr_1fr_0.9fr_0.9fr] gap-4 bg-gradient-to-r from-slate-50 to-slate-100 px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-600 lg:grid dark:from-white/[0.04] dark:to-white/[0.02] dark:text-slate-500">
                <span>Amount</span>
                <span>Description</span>
                <span>Category</span>
                <span>Date</span>
                <span>Actions</span>
              </div>

              {expensesLoading ? (
                <div className="space-y-3 px-5 py-5">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-16 animate-pulse rounded-2xl bg-slate-50 dark:bg-white/[0.04]"
                    />
                  ))}
                </div>
              ) : expenses.length > 0 ? (
                <div className="divide-y divide-slate-200 dark:divide-white/[0.08]">
                  {expenses.map((expense) => (
                    <div
                      key={expense._id}
                      className="grid gap-4 px-4 py-4 sm:px-5 lg:grid-cols-[0.95fr_1.6fr_1fr_0.9fr_1fr] lg:items-center"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400 lg:hidden">
                          Amount
                        </p>
                        <p className="text-base font-black text-slate-950 dark:text-white">
                          {formatAmount(expense.amount)}
                        </p>
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400 lg:hidden">
                          Description
                        </p>
                        <p className="break-words font-bold text-slate-700 dark:text-slate-200">
                          {expense.note}
                        </p>
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400 lg:hidden">
                          Category
                        </p>
                        <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-bold text-slate-700 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-slate-200">
                          {expense.category}
                        </span>
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400 lg:hidden">
                          Date
                        </p>
                        <p className="font-semibold text-slate-500 dark:text-slate-400">
                          {formatDate(expense.date)}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2 sm:flex-row lg:justify-end">
                        <button
                          type="button"
                          onClick={() => handleEditExpense(expense)}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-slate-200"
                        >
                          <PencilLine className="h-4 w-4" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDeleteExpense(expense)}
                          disabled={deletingExpenseId === expense._id}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-bold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-70 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200"
                        >
                          {deletingExpenseId === expense._id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-6 py-12 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-slate-100 text-slate-500 dark:bg-white/[0.06] dark:text-slate-400">
                    <Coins className="h-7 w-7" />
                  </div>
                  <h3 className="mt-4 text-lg font-black text-slate-950 dark:text-white">
                    No expenses found
                  </h3>
                  <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                    Empty ranges and categories are valid. Adjust filters or add
                    a new expense.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                Page {pagination.page} of {pagination.totalPages} |{" "}
                {pagination.total} total expenses
              </p>

              <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
                <button
                  type="button"
                  onClick={() =>
                    void goToPage(Math.max(1, pagination.page - 1))
                  }
                  disabled={pagination.page <= 1 || expensesLoading}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-slate-200"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() =>
                    void goToPage(
                      Math.min(pagination.totalPages, pagination.page + 1),
                    )
                  }
                  disabled={
                    pagination.page >= pagination.totalPages || expensesLoading
                  }
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-slate-200"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 dark:border-white/[0.08] dark:bg-[#0f0c1f] dark:shadow-black/20">
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-cyan-500 dark:text-cyan-300">
                Insights
              </p>
              <h2 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
                Most spent and top categories
              </h2>

              <div className="mt-4 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 p-4 dark:from-white/[0.05] dark:to-white/[0.03]">
                <p className="text-sm font-bold text-slate-500">
                  Most spent category
                </p>
                <p className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
                  {mostSpentCategory?._id ?? "No data yet"}
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
                  {mostSpentCategory
                    ? `${formatAmount(mostSpentCategory.totalSpent)} spent in this category`
                    : "This will appear once your backend has expense data."}
                </p>
              </div>

              <div className="mt-5 h-64 rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 p-3.5 dark:border-white/[0.08] dark:from-white/[0.04] dark:to-white/[0.02]">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(148,163,184,0.22)"
                      />
                      <XAxis
                        dataKey="name"
                        tickLine={false}
                        axisLine={false}
                        tick={{
                          fill: "#94a3b8",
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tick={{
                          fill: "#94a3b8",
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      />
                      <Tooltip
                        cursor={{ fill: "rgba(148, 163, 184, 0.08)" }}
                        contentStyle={{
                          borderRadius: 16,
                          border: "1px solid rgba(148,163,184,0.16)",
                          background: "#0f172a",
                          color: "#fff",
                        }}
                      />
                      <Bar dataKey="totalSpent" radius={[12, 12, 4, 4]}>
                        {chartData.map((item, index) => (
                          <Cell
                            key={item.name}
                            fill={chartColors[index % chartColors.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm dark:bg-white/[0.06] dark:text-slate-400">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <p className="mt-4 text-sm font-bold text-slate-600 dark:text-slate-300">
                      Top categories will appear after expenses are recorded.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 shadow-xl shadow-slate-200/50 dark:border-white/[0.08] dark:bg-gradient-to-br dark:from-[#0f0c1f] dark:to-[#0a0715] dark:shadow-black/20">
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-emerald-500 dark:text-emerald-300">
                Top Categories
              </p>
              <h2 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
                Spend distribution
              </h2>

              <div className="mt-4 space-y-2">
                {(summary?.topCategories?.length ?? 0) > 0 ? (
                  (summary?.topCategories ?? []).map((category) => (
                    <div
                      key={category._id}
                      className="rounded-lg border border-slate-200 bg-gradient-to-r from-slate-50 to-white px-3.5 py-3 dark:border-white/[0.08] dark:from-white/[0.04] dark:to-white/[0.02]"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-base font-black text-slate-950 dark:text-white">
                            {category._id}
                          </p>
                          <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
                            {category.expenseCount} expense
                            {category.expenseCount === 1 ? "" : "s"}
                          </p>
                        </div>
                        <p className="text-lg font-black text-emerald-600 dark:text-emerald-300">
                          {formatAmount(category.totalSpent)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[1.3rem] border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm font-semibold text-slate-500 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-slate-400">
                    No top-category data yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
