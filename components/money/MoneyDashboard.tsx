"use client";

import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  BadgeDollarSign,
  CalendarRange,
  Coins,
  Loader2,
  PiggyBank,
  Plus,
  ReceiptText,
  RefreshCcw,
  Sparkles,
  Tags,
  TrendingDown,
  Wallet,
  type LucideIcon,
} from "lucide-react";
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
import { motion } from "framer-motion";
import { useMoneyDashboard } from "@/hooks/useMoneyDashboard";

type FormErrors = Record<string, string>;

const chartColors = ["#8b5cf6", "#06b6d4", "#f97316", "#22c55e", "#ec4899"];

function formatAmount(value: number | null) {
  if (value === null || Number.isNaN(value)) return "Not set";
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDisplayDate(value: string) {
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

function MoneyStatCard({
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
      className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 dark:border-white/[0.08] dark:bg-[#120d27] dark:shadow-black/30"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/40 to-transparent" />
      <div
        className={`absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${gradient} opacity-15 blur-3xl`}
      />

      <div
        className={`mb-5 flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-gradient-to-br ${gradient} text-white shadow-lg shadow-violet-950/20`}
      >
        <Icon className="h-6 w-6" />
      </div>

      <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">
        {title}
      </p>
      <p className="mt-3 text-4xl font-black tracking-[-0.03em] text-slate-950 dark:text-white">
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
    categories,
    expenses,
    mostSpentCategory,
    totals,
    filters,
    loading,
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
  } = useMoneyDashboard();
  const [salaryAmount, setSalaryAmount] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [expenseForm, setExpenseForm] = useState({
    amount: "",
    description: "",
    category: "",
    date: getToday(),
  });
  const [salaryErrors, setSalaryErrors] = useState<FormErrors>({});
  const [categoryErrors, setCategoryErrors] = useState<FormErrors>({});
  const [expenseErrors, setExpenseErrors] = useState<FormErrors>({});
  const selectedCategory = expenseForm.category || categories[0] || "";

  const categoryChartData = useMemo(() => {
    const totalsByCategory = expenses.reduce<Record<string, number>>(
      (acc, expense) => {
        acc[expense.category] = (acc[expense.category] ?? 0) + expense.amount;
        return acc;
      },
      {},
    );

    return Object.entries(totalsByCategory)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [expenses]);

  const handleSalarySubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = await saveSalary(salaryAmount);
    setSalaryErrors(result.errors);
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

  const handleExpenseSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    const result = await createExpense({
      amount: Number(expenseForm.amount),
      description: expenseForm.description,
      category: selectedCategory,
      date: expenseForm.date,
    });
    setExpenseErrors(result.errors);

    if (result.ok) {
      setExpenseForm({
        amount: "",
        description: "",
        category: categories[0] ?? "",
        date: getToday(),
      });
    }
  };

  const handleFilterSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await refreshExpenses();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-6 dark:bg-[#09090f] sm:px-6 lg:px-8 xl:px-10">
        <div className="grid gap-5">
          <div className="h-56 animate-pulse rounded-[2rem] bg-white shadow-xl shadow-slate-200/60 dark:bg-white/[0.04]" />
          <div className="grid gap-5 lg:grid-cols-3">
            <div className="h-44 animate-pulse rounded-[2rem] bg-white shadow-xl shadow-slate-200/60 dark:bg-white/[0.04]" />
            <div className="h-44 animate-pulse rounded-[2rem] bg-white shadow-xl shadow-slate-200/60 dark:bg-white/[0.04]" />
            <div className="h-44 animate-pulse rounded-[2rem] bg-white shadow-xl shadow-slate-200/60 dark:bg-white/[0.04]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-[#09090f] dark:text-white">
      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <div className="absolute left-[12%] top-0 h-[420px] w-[420px] rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute bottom-0 right-[10%] h-[360px] w-[360px] rounded-full bg-violet-600/10 blur-[110px]" />
      </div>

      <div className="relative z-10 space-y-5 px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
        <section className="relative overflow-hidden rounded-[2.25rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70 dark:border-white/[0.08] dark:bg-[#110d2e] dark:shadow-black/30 md:p-8">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />
          <div className="absolute -right-16 top-8 h-48 w-48 rounded-full bg-emerald-400/10 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-[11px] font-black uppercase tracking-[0.24em] text-emerald-700 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-emerald-300">
                <PiggyBank className="h-3.5 w-3.5" />
                Money Control
              </div>

              <h1 className="mt-5 text-[clamp(2.4rem,5vw,4.6rem)] font-black leading-[0.95] tracking-[-0.04em] text-slate-950 dark:text-white">
                See where your money goes,
                <span className="block bg-gradient-to-r from-emerald-500 via-cyan-500 to-violet-500 bg-clip-text text-transparent">
                  then steer it with intent.
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300/85">
                Manage salary, categories, expenses, and spending insights from
                one polished dashboard tied directly to your authenticated
                backend session.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                {
                  label: "Logged in as",
                  value: user?.name ?? "Unknown user",
                },
                {
                  label: "Tracked expenses",
                  value: String(totals.expenseCount),
                },
                {
                  label: "Current range",
                  value: `${filters.startDate.slice(5)} to ${filters.endDate.slice(5)}`,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-4 dark:border-white/[0.08] dark:bg-white/[0.04]"
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

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MoneyStatCard
            title="Current Salary"
            value={formatAmount(salary)}
            subtitle={
              salary === null
                ? "Set your salary to unlock balance insights."
                : "Your latest saved salary from the backend."
            }
            icon={Wallet}
            gradient="from-emerald-500 to-lime-400"
          />
          <MoneyStatCard
            title="Spent In Range"
            value={formatAmount(totals.totalSpent)}
            subtitle="Total expenses within the selected date range."
            icon={TrendingDown}
            gradient="from-rose-500 to-orange-400"
          />
          <MoneyStatCard
            title="Balance Snapshot"
            value={formatAmount(totals.budgetBalance)}
            subtitle="Salary minus currently filtered spending."
            icon={BadgeDollarSign}
            gradient="from-violet-600 to-fuchsia-500"
          />
          <MoneyStatCard
            title="Most Spent Category"
            value={mostSpentCategory?.category ?? "No data"}
            subtitle={
              mostSpentCategory
                ? `Top backend insight${
                    (mostSpentCategory.amount ?? mostSpentCategory.totalAmount) !==
                    undefined
                      ? ` • ${formatAmount(
                          mostSpentCategory.amount ??
                            mostSpentCategory.totalAmount ??
                            0,
                        )}`
                      : ""
                  }`
                : "This appears when the backend has enough expense data."
            }
            icon={Sparkles}
            gradient="from-cyan-500 to-sky-400"
          />
        </section>

        {error ? (
          <div className="rounded-[1.6rem] border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
            {error}
          </div>
        ) : null}

        <section className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-5">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 dark:border-white/[0.08] dark:bg-[#0f0c1f] dark:shadow-black/20">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-emerald-500 dark:text-emerald-300">
                    Salary
                  </p>
                  <h2 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
                    Set or update your salary
                  </h2>
                </div>

                <button
                  onClick={() => void refreshAll()}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-slate-400 dark:hover:bg-white/[0.10] dark:hover:text-white"
                  aria-label="Refresh money data"
                >
                  <RefreshCcw className="h-4.5 w-4.5" />
                </button>
              </div>

              <form onSubmit={handleSalarySubmit} className="grid gap-4 sm:grid-cols-[1fr_auto]">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-600 dark:text-slate-300">
                    Monthly salary
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={salaryAmount}
                    placeholder={salary !== null ? String(salary) : "50000"}
                    onChange={(event) => {
                      setSalaryAmount(event.target.value);
                      if (salaryErrors.amount) setSalaryErrors({});
                    }}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-semibold outline-none transition focus:border-emerald-500 focus:bg-white dark:border-white/[0.08] dark:bg-white/[0.04] dark:focus:bg-white/[0.06]"
                  />
                  {salaryErrors.amount ? (
                    <p className="mt-2 text-sm font-semibold text-rose-500">
                      {salaryErrors.amount}
                    </p>
                  ) : null}
                </div>

                <button
                  type="submit"
                  disabled={salarySaving}
                  className="mt-[1.85rem] inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-cyan-500 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-emerald-950/25 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {salarySaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowUpRight className="h-4 w-4" />
                  )}
                  Save salary
                </button>
              </form>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 dark:border-white/[0.08] dark:bg-[#0f0c1f] dark:shadow-black/20">
              <div className="mb-6">
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-violet-500 dark:text-violet-300">
                  Categories
                </p>
                <h2 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
                  Build your expense buckets
                </h2>
              </div>

              <form onSubmit={handleCategorySubmit} className="grid gap-4 sm:grid-cols-[1fr_auto]">
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
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-semibold outline-none transition focus:border-violet-500 focus:bg-white dark:border-white/[0.08] dark:bg-white/[0.04] dark:focus:bg-white/[0.06]"
                  />
                  {categoryErrors.name ? (
                    <p className="mt-2 text-sm font-semibold text-rose-500">
                      {categoryErrors.name}
                    </p>
                  ) : null}
                </div>

                <button
                  type="submit"
                  disabled={categorySaving}
                  className="mt-[1.85rem] inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-violet-950/25 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
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
                    <span
                      key={category}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-700 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-slate-200"
                    >
                      <Tags className="h-3.5 w-3.5 text-violet-500" />
                      {category}
                    </span>
                  ))
                ) : (
                  <div className="w-full rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm font-semibold text-slate-500 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-slate-400">
                    No categories tracked yet. Add one before creating an expense.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 dark:border-white/[0.08] dark:bg-[#0f0c1f] dark:shadow-black/20">
            <div className="mb-6">
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-cyan-500 dark:text-cyan-300">
                Expense Entry
              </p>
              <h2 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
                Record a new expense
              </h2>
            </div>

            <form onSubmit={handleExpenseSubmit} className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
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
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-semibold outline-none transition focus:border-cyan-500 focus:bg-white dark:border-white/[0.08] dark:bg-white/[0.04] dark:focus:bg-white/[0.06]"
                  />
                  {expenseErrors.amount ? (
                    <p className="mt-2 text-sm font-semibold text-rose-500">
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
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-semibold outline-none transition focus:border-cyan-500 focus:bg-white dark:border-white/[0.08] dark:bg-white/[0.04] dark:focus:bg-white/[0.06]"
                  />
                  {expenseErrors.date ? (
                    <p className="mt-2 text-sm font-semibold text-rose-500">
                      {expenseErrors.date}
                    </p>
                  ) : null}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-600 dark:text-slate-300">
                  Description
                </label>
                <input
                  value={expenseForm.description}
                  onChange={(event) => {
                    setExpenseForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }));
                    if (expenseErrors.description) setExpenseErrors({});
                  }}
                  placeholder="Lunch"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-semibold outline-none transition focus:border-cyan-500 focus:bg-white dark:border-white/[0.08] dark:bg-white/[0.04] dark:focus:bg-white/[0.06]"
                />
                {expenseErrors.description ? (
                  <p className="mt-2 text-sm font-semibold text-rose-500">
                    {expenseErrors.description}
                  </p>
                ) : null}
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-600 dark:text-slate-300">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(event) => {
                    setExpenseForm((current) => ({
                      ...current,
                      category: event.target.value,
                    }));
                    if (expenseErrors.category) setExpenseErrors({});
                  }}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-semibold outline-none transition focus:border-cyan-500 focus:bg-white dark:border-white/[0.08] dark:bg-white/[0.04] dark:focus:bg-white/[0.06]"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {expenseErrors.category ? (
                  <p className="mt-2 text-sm font-semibold text-rose-500">
                    {expenseErrors.category}
                  </p>
                ) : null}
              </div>

              <button
                type="submit"
                disabled={expenseSaving}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-500 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-cyan-950/25 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {expenseSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ReceiptText className="h-4 w-4" />
                )}
                Add expense
              </button>
            </form>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 dark:border-white/[0.08] dark:bg-[#0f0c1f] dark:shadow-black/20">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-orange-500 dark:text-orange-300">
                  Expenses
                </p>
                <h2 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
                  Filter and review your spending
                </h2>
              </div>

              <form
                onSubmit={handleFilterSubmit}
                className="grid gap-3 md:grid-cols-[1fr_1fr_auto]"
              >
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(event) =>
                    updateFilters(event.target.value, filters.endDate)
                  }
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none transition focus:border-orange-500 focus:bg-white dark:border-white/[0.08] dark:bg-white/[0.04] dark:focus:bg-white/[0.06]"
                />
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(event) =>
                    updateFilters(filters.startDate, event.target.value)
                  }
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none transition focus:border-orange-500 focus:bg-white dark:border-white/[0.08] dark:bg-white/[0.04] dark:focus:bg-white/[0.06]"
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:scale-[1.01] dark:bg-white dark:text-slate-950"
                >
                  <CalendarRange className="h-4 w-4" />
                  Apply
                </button>
              </form>
            </div>

            <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 dark:border-white/[0.08]">
              <div className="hidden grid-cols-[0.95fr_1.5fr_1fr_0.9fr] gap-4 bg-slate-50 px-5 py-4 text-xs font-black uppercase tracking-[0.18em] text-slate-500 md:grid dark:bg-white/[0.04]">
                <span>Amount</span>
                <span>Description</span>
                <span>Category</span>
                <span>Date</span>
              </div>

              {expenses.length > 0 ? (
                <div className="divide-y divide-slate-200 dark:divide-white/[0.08]">
                  {expenses.map((expense, index) => (
                    <div
                      key={expense._id ?? expense.id ?? `${expense.description}-${expense.date}-${index}`}
                      className="grid gap-2 px-5 py-4 md:grid-cols-[0.95fr_1.5fr_1fr_0.9fr] md:items-center md:gap-4"
                    >
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400 md:hidden">
                          Amount
                        </p>
                        <p className="text-base font-black text-slate-950 dark:text-white">
                          {formatAmount(expense.amount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400 md:hidden">
                          Description
                        </p>
                        <p className="font-bold text-slate-700 dark:text-slate-200">
                          {expense.description}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400 md:hidden">
                          Category
                        </p>
                        <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-bold text-slate-700 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-slate-200">
                          {expense.category}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400 md:hidden">
                          Date
                        </p>
                        <p className="font-semibold text-slate-500 dark:text-slate-400">
                          {formatDisplayDate(expense.date)}
                        </p>
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
                    No expenses in this range
                  </h3>
                  <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                    Adjust the dates or add your first expense to see it here.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 dark:border-white/[0.08] dark:bg-[#0f0c1f] dark:shadow-black/20">
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-cyan-500 dark:text-cyan-300">
                Insights
              </p>
              <h2 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
                Spending overview
              </h2>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.5rem] bg-slate-50 p-5 dark:bg-white/[0.04]">
                  <p className="text-sm font-bold text-slate-500">Average expense</p>
                  <p className="mt-2 text-3xl font-black text-slate-950 dark:text-white">
                    {formatAmount(Math.round(totals.averageExpense))}
                  </p>
                </div>
                <div className="rounded-[1.5rem] bg-slate-50 p-5 dark:bg-white/[0.04]">
                  <p className="text-sm font-bold text-slate-500">Categories used</p>
                  <p className="mt-2 text-3xl font-black text-slate-950 dark:text-white">
                    {categories.length}
                  </p>
                </div>
              </div>

              <div className="mt-6 h-72 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 dark:border-white/[0.08] dark:bg-white/[0.03]">
                {categoryChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.22)" />
                      <XAxis
                        dataKey="category"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 700 }}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 700 }}
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
                      <Bar dataKey="amount" radius={[12, 12, 4, 4]}>
                        {categoryChartData.map((item, index) => (
                          <Cell
                            key={item.category}
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
                      Chart data appears after expenses are added.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 dark:border-white/[0.08] dark:bg-[#0f0c1f] dark:shadow-black/20">
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-emerald-500 dark:text-emerald-300">
                Snapshot
              </p>
              <h2 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
                Quick takeaways
              </h2>

              <div className="mt-5 space-y-3">
                {[
                  salary !== null
                    ? `Your current displayed balance is ${formatAmount(
                        totals.budgetBalance,
                      )} for the selected range.`
                    : "Set your salary to compare spending against income.",
                  mostSpentCategory?.category
                    ? `Your top backend category insight is ${mostSpentCategory.category}.`
                    : "Most-spent category will appear once the backend returns a result.",
                  categories.length > 0
                    ? `${categories.length} categories are ready for quick expense entry.`
                    : "Create at least one category before adding a new expense.",
                ].map((line) => (
                  <div
                    key={line}
                    className="rounded-[1.3rem] border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold leading-6 text-slate-600 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-300"
                  >
                    {line}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
