"use client";

import { useMemo, useRef, useState } from "react";
import {
  BadgeDollarSign,
  Banknote,
  Calendar,
  CalendarRange,
  ChevronDown,
  Coins,
  CreditCard,
  Eye,
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
import PremiumModal from "@/components/ui/PremiumModal";
import type { BalanceSource, MoneyExpense } from "@/types/money";

type FormErrors = Record<string, string>;

type ExpenseFormState = {
  amount: string;
  note: string;
  category: string;
  date: string;
};

const chartColors = ["#10b981", "#06b6d4", "#8b5cf6", "#f97316", "#ec4899"];

const cardClass =
  "rounded-[2rem] border border-slate-200/80 bg-white/90 p-5 shadow-xl shadow-slate-200/60 backdrop-blur-xl dark:border-white/[0.08] dark:bg-[#0f0c1f]/90 dark:shadow-black/25 sm:p-6";

const fixedCardClass =
  "min-h-[390px] rounded-[2rem] border border-slate-200/80 bg-white/90 p-5 shadow-xl shadow-slate-200/60 backdrop-blur-xl dark:border-white/[0.08] dark:bg-[#0f0c1f]/90 dark:shadow-black/25 sm:p-6";

const inputClass =
  "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 dark:border-white/[0.08] dark:bg-slate-950/90 dark:text-slate-100 dark:focus:bg-slate-900";

const buttonPrimary =
  "inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-cyan-500 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-emerald-950/25 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto";

const buttonSecondary =
  "inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3.5 text-sm font-black text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-slate-200 dark:hover:bg-white/[0.09] sm:w-auto";

const buttonDanger =
  "inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-3.5 text-sm font-black text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-70 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200 sm:w-auto";

function formatAmount(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) return "0";

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
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

function formatCategoryLabel(value: string) {
  return value
    .split(/[_\s-]+/)
    .map((word) =>
      word.length > 0
        ? `${word[0].toUpperCase()}${word.slice(1).toLowerCase()}`
        : "",
    )
    .join(" ");
}

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function expenseToForm(expense: MoneyExpense): ExpenseFormState {
  return {
    amount: String(expense.amount),
    note: expense.note ?? "",
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

function generateMonthOptions() {
  const options: { value: string; label: string }[] = [];
  const now = new Date();

  for (let i = 0; i < 24; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const value = `${year}-${String(month).padStart(2, "0")}`;
    const label =
      i === 0
        ? `${d.toLocaleDateString("en-US", { month: "long", year: "numeric" })} (Current)`
        : d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    options.push({ value, label });
  }

  return options;
}

function getMonthlyTotalForMonth(
  monthlySummary: { month: string; total: number }[],
  monthKey: string,
) {
  const match = monthlySummary.find(
    (item) =>
      item.month === monthKey ||
      item.month.startsWith(`${monthKey}-`) ||
      item.month.startsWith(monthKey),
  );

  return match ? match.total : null;
}

function shortenChartLabel(value: unknown) {
  const label = String(value ?? "");
  return label.length > 14 ? `${label.slice(0, 13)}...` : label;
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value?: number | string }>;
  label?: string | number;
}) {
  if (!active || !payload || payload.length === 0) return null;

  const value = typeof payload[0]?.value === "number" ? payload[0].value : 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-xl dark:border-white/[0.10] dark:bg-slate-900">
      <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
        {label}
      </p>
      <p className="mt-1 text-base font-black text-emerald-600 dark:text-emerald-300">
        {formatAmount(value)}
      </p>
    </div>
  );
}

function renderChartTooltip(props: unknown) {
  return <ChartTooltip {...(props as Parameters<typeof ChartTooltip>[0])} />;
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-5">
      <p className="text-[11px] font-black uppercase tracking-[0.22em] text-emerald-500 dark:text-emerald-300">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-xl font-black tracking-[-0.03em] text-slate-950 dark:text-white sm:text-2xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-2 text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">
          {description}
        </p>
      ) : null}
    </div>
  );
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
      whileHover={{ y: -5, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 220, damping: 18 }}
      className="group relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/90 p-5 shadow-xl shadow-slate-200/60 backdrop-blur-xl dark:border-white/[0.08] dark:bg-[#120d27]/90 dark:shadow-black/30"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />
      <div
        className={`absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br ${gradient} opacity-20 blur-3xl transition group-hover:opacity-30`}
      />

      <div className="relative">
        <div
          className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg shadow-slate-900/10`}
        >
          <Icon className="h-5 w-5" />
        </div>

        <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
          {title}
        </p>
        <p className="mt-2 break-words text-2xl font-black tracking-[-0.04em] text-slate-950 dark:text-white sm:text-3xl">
          {value}
        </p>
        <p className="mt-2 text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">
          {subtitle}
        </p>
      </div>
    </motion.div>
  );
}

export default function MoneyDashboard() {
  const {
    user,
    salary,
    balanceSources,
    balanceTotal,
    monthlyExpenseSummary,
    summary,
    insights,
    categories,
    categoryOptions,
    expenses,
    filters,
    pagination,
    selectedMonth,
    isCurrentMonth,
    monthlyReportSalary,
    historicalSummary,
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
    recordLoanFunds,
    addExternalIncome,
    addOtherSavings,
    changeSelectedMonth,
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

  type FundsOption = "loan" | "income" | "savings" | null;
  const [insufficientFundsOpen, setInsufficientFundsOpen] = useState(false);
  const [selectedFundsOption, setSelectedFundsOption] = useState<FundsOption>(null);
  const [fundsActionLoading, setFundsActionLoading] = useState(false);

  const [loanForm, setLoanForm] = useState({ personName: "", amount: "", reason: "", date: getToday() });
  const [loanErrors, setLoanErrors] = useState<FormErrors>({});

  const [incomeForm, setIncomeForm] = useState({ amount: "", source: "", note: "", date: getToday() });
  const [incomeErrors, setIncomeErrors] = useState<FormErrors>({});

  const [savingsForm, setSavingsForm] = useState({ amount: "", sourceName: "", note: "", date: getToday() });
  const [savingsErrors, setSavingsErrors] = useState<FormErrors>({});

  const [confirmState, setConfirmState] = useState<{
    title: string;
    description: string;
    confirmLabel?: string;
    variant?: "default" | "info" | "error";
    action: () => Promise<void>;
  } | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const expenseFormRef = useRef<HTMLDivElement | null>(null);

  const effectiveTopCategories = useMemo(() => {
    if (!isCurrentMonth && historicalSummary) {
      const total = historicalSummary.currentMonthSpent;
      return historicalSummary.topCategories.map((cat) => ({
        ...cat,
        percentage:
          cat.percentage ??
          (total > 0 ? Math.round((cat.totalSpent / total) * 100) : 0),
      }));
    }
    return insights?.topCategories ?? [];
  }, [isCurrentMonth, historicalSummary, insights?.topCategories]);

  const chartData = useMemo(
    () =>
      effectiveTopCategories.map((category) => ({
        name: category.categoryLabel,
        shortName: shortenChartLabel(category.categoryLabel),
        totalSpent: category.totalSpent,
      })),
    [effectiveTopCategories],
  );

  const monthOptions = useMemo(() => generateMonthOptions(), []);

  const selectedMonthLabel = useMemo(() => {
    const [yearStr, monthStr] = selectedMonth.split("-");
    return new Date(
      Number(yearStr),
      Number(monthStr) - 1,
      1,
    ).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }, [selectedMonth]);

  const selectedMonthTotalSpent = useMemo(
    () => getMonthlyTotalForMonth(monthlyExpenseSummary, selectedMonth),
    [monthlyExpenseSummary, selectedMonth],
  );

  const visibleExpenseTotal = useMemo(
    () => expenses.reduce((sum, expense) => sum + expense.amount, 0),
    [expenses],
  );

  const salaryFromSources = balanceSources
    .filter((s) => s.type === "SALARY")
    .reduce((sum, s) => sum + s.amount, 0);

  const displayStats = useMemo(() => {
    if (isCurrentMonth) {
      const effectiveSalary =
        (salary?.amount ?? summary.salaryAmount) || salaryFromSources;
      const monthSpent =
        historicalSummary?.currentMonthSpent ??
        selectedMonthTotalSpent ??
        summary.currentMonthSpent;
      const expenseCount =
        historicalSummary?.expenseCount ?? summary.expenseCount;
      const averageExpense =
        historicalSummary?.averageExpense ?? summary.averageExpense;
      return {
        salary: effectiveSalary,
        monthSpent,
        expenseCount,
        averageExpense,
        remainingSalary:
          historicalSummary?.remainingSalary ??
          (summary.remainingSalary && summary.currentMonthSpent === monthSpent
            ? summary.remainingSalary
            : effectiveSalary - monthSpent),
      };
    }
    if (historicalSummary) {
      return {
        salary: historicalSummary.salaryAmount,
        monthSpent: historicalSummary.currentMonthSpent,
        expenseCount: historicalSummary.expenseCount,
        averageExpense: historicalSummary.averageExpense,
        remainingSalary: historicalSummary.remainingSalary,
      };
    }
    const monthSalary = monthlyReportSalary?.amount ?? 0;
    return {
      salary: monthSalary,
      monthSpent: 0,
      expenseCount: 0,
      averageExpense: 0,
      remainingSalary: monthSalary,
    };
  }, [isCurrentMonth, salary, summary, historicalSummary, monthlyReportSalary, salaryFromSources, selectedMonthTotalSpent]);

  const activeCategory = expenseForm.category || categoryOptions[0] || "";
  const salaryDisplay =
    (salary?.amount ?? summary.salaryAmount) || salaryFromSources;
  const mostSpentCategory =
    !isCurrentMonth && historicalSummary
      ? (effectiveTopCategories[0] ?? null)
      : (insights?.mostSpentCategory ?? null);

  const totalBalance =
    balanceTotal ||
    balanceSources.reduce((sum, source) => sum + source.amount, 0);

  const externalIncome = balanceSources
    .filter((s) => s.type !== "SALARY" && s.source !== "EXPENSE_REFUND")
    .reduce((sum, s) => sum + s.amount, 0);

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
    setConfirmState({
      title: "Reset saved salary",
      description:
        "Reset your saved salary? This removes the current salary value.",
      confirmLabel: "Reset salary",
      variant: "info",
      action: async () => {
        const ok = await resetSalary();

        if (ok) {
          setSalaryAmount("");
          setSalaryErrors({});
        }
      },
    });
  };

  const handleBalanceSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const result = editingBalanceId
      ? await updateBalanceSource(
          editingBalanceId,
          balanceForm.type,
          balanceForm.amount,
        )
      : await addBalanceSource(balanceForm.type, balanceForm.amount);

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
    setConfirmState({
      title: "Remove balance source",
      description: `Remove ${source.type.toLowerCase()} source with ${formatAmount(
        source.amount,
      )}?`,
      confirmLabel: "Delete source",
      variant: "error",
      action: async () => {
        const ok = await deleteBalanceSource(source._id);

        if (ok && editingBalanceId === source._id) {
          handleBalanceCancel();
        }
      },
    });
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
    setConfirmState({
      title: "Delete category",
      description: `Delete category "${name}"? This only works if no expenses use it.`,
      confirmLabel: "Delete category",
      variant: "error",
      action: async () => {
        await deleteCategory(name);
      },
    });
  };

  const closeFundsModal = () => {
    setInsufficientFundsOpen(false);
    setSelectedFundsOption(null);
    setLoanForm({ personName: "", amount: "", reason: "", date: getToday() });
    setLoanErrors({});
    setIncomeForm({ amount: "", source: "", note: "", date: getToday() });
    setIncomeErrors({});
    setSavingsForm({ amount: "", sourceName: "", note: "", date: getToday() });
    setSavingsErrors({});
  };

  const handleLoanSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors: FormErrors = {};
    if (!loanForm.personName.trim()) errors.personName = "Person name is required.";
    if (!loanForm.amount.trim() || Number(loanForm.amount) <= 0) errors.amount = "Amount must be greater than zero.";
    if (!loanForm.date) errors.date = "Date is required.";
    if (Object.keys(errors).length > 0) { setLoanErrors(errors); return; }
    setFundsActionLoading(true);
    const ok = await recordLoanFunds(loanForm.personName, Number(loanForm.amount), loanForm.reason, loanForm.date);
    setFundsActionLoading(false);
    if (ok) closeFundsModal();
  };

  const handleIncomeSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors: FormErrors = {};
    if (!incomeForm.amount.trim() || Number(incomeForm.amount) <= 0) errors.amount = "Amount must be greater than zero.";
    if (!incomeForm.source.trim()) errors.source = "Source is required.";
    if (!incomeForm.date) errors.date = "Date is required.";
    if (Object.keys(errors).length > 0) { setIncomeErrors(errors); return; }
    setFundsActionLoading(true);
    const ok = await addExternalIncome(Number(incomeForm.amount), incomeForm.source, incomeForm.note, incomeForm.date);
    setFundsActionLoading(false);
    if (ok) closeFundsModal();
  };

  const handleSavingsSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors: FormErrors = {};
    if (!savingsForm.amount.trim() || Number(savingsForm.amount) <= 0) errors.amount = "Amount must be greater than zero.";
    if (!savingsForm.sourceName.trim()) errors.sourceName = "Source name is required.";
    if (!savingsForm.date) errors.date = "Date is required.";
    if (Object.keys(errors).length > 0) { setSavingsErrors(errors); return; }
    setFundsActionLoading(true);
    const ok = await addOtherSavings(Number(savingsForm.amount), savingsForm.sourceName, savingsForm.note, savingsForm.date);
    setFundsActionLoading(false);
    if (ok) closeFundsModal();
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

    if (!editingExpenseId && payload.amount > totalBalance) {
      setInsufficientFundsOpen(true);
      setSelectedFundsOption(null);
      return;
    }

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
    const expenseLabel =
      expense.note?.trim() || formatCategoryLabel(expense.category);

    setConfirmState({
      title: "Delete expense",
      description: `Delete ${expenseLabel} expense for ${formatAmount(
        expense.amount,
      )}?`,
      confirmLabel: "Delete expense",
      variant: "error",
      action: async () => {
        const ok = await deleteExpense(expense._id);

        if (ok && editingExpenseId === expense._id) {
          resetExpenseForm();
        }
      },
    });
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
        <div className="mx-auto grid max-w-[1600px] gap-5">
          <div className="h-64 animate-pulse rounded-[2rem] bg-white shadow-xl shadow-slate-200/60 dark:bg-white/[0.04]" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
            {Array.from({ length: 6 }).map((_, index) => (
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
    <div className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-950 dark:bg-[#09090f] dark:text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-[4%] top-[-8%] h-[440px] w-[440px] rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute right-[4%] top-[18%] h-[400px] w-[400px] rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[35%] h-[380px] w-[380px] rounded-full bg-violet-500/10 blur-[130px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1600px] space-y-5 px-4 py-5 sm:px-6 lg:px-8 xl:px-10">
        <section className="relative overflow-hidden rounded-[2.25rem] border border-slate-200/80 bg-gradient-to-br from-white via-slate-50 to-emerald-50/50 p-6 shadow-2xl shadow-slate-200/70 dark:border-white/[0.08] dark:from-[#0b1020] dark:via-[#111827] dark:to-[#052e2b] dark:shadow-black/35 sm:p-8 lg:p-10">
          <div className="absolute right-[-80px] top-[-80px] h-72 w-72 rounded-full bg-cyan-400/20 blur-[90px]" />
          <div className="absolute bottom-[-90px] left-[-70px] h-72 w-72 rounded-full bg-emerald-400/20 blur-[90px]" />

          <div className="relative z-10 grid gap-8 xl:grid-cols-[1fr_440px] xl:items-center">
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/70 px-4 py-2 text-[11px] font-black uppercase tracking-[0.24em] text-emerald-700 shadow-sm backdrop-blur dark:border-emerald-400/20 dark:bg-white/[0.06] dark:text-emerald-300">
                <PiggyBank className="h-3.5 w-3.5" />
                Money Management
              </div>

              <h1 className="mt-6 max-w-4xl text-[clamp(2.4rem,4.8vw,5.2rem)] font-black leading-[0.98] tracking-[-0.06em] text-slate-950 dark:text-white">
                Take control of your money with{" "}
                <span className="bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 bg-clip-text text-transparent">
                  smart tracking.
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-base font-medium leading-8 text-slate-600 dark:text-slate-300 sm:text-lg">
                Monitor salary, balances, expenses, categories, and spending
                patterns from one clean dashboard built for better daily
                financial decisions.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-white/[0.08] dark:bg-white/[0.05]">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                    Balance
                  </p>
                  <p className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
                    {formatAmount(totalBalance)}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-white/[0.08] dark:bg-white/[0.05]">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                    Month Spent
                  </p>
                  <p className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
                    {formatAmount(displayStats.monthSpent)}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-white/[0.08] dark:bg-white/[0.05]">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                    Records
                  </p>
                  <p className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
                    {formatAmount(summary.expenseCount)}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white/85 p-5 shadow-xl shadow-slate-200/60 backdrop-blur-xl dark:border-white/[0.08] dark:bg-white/[0.06] dark:shadow-black/20">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                    Overview
                  </p>
                  <h3 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
                    Financial snapshot
                  </h3>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-900/20">
                  <Wallet className="h-5 w-5" />
                </div>
              </div>

              <div className="space-y-3">
                {[
                  {
                    label: "Logged in as",
                    value: user?.name ?? "Unknown user",
                  },
                  {
                    label: "Available Balance",
                    value: formatAmount(totalBalance),
                  },
                  {
                    label: "Total Spent",
                    value: formatAmount(displayStats.monthSpent),
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 dark:border-white/[0.08] dark:bg-white/[0.04]"
                  >
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                      {item.label}
                    </p>
                    <p className="max-w-[180px] truncate text-base font-black text-slate-950 dark:text-white">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Current Salary"
            value={formatAmount(displayStats.salary)}
            subtitle="Your active monthly salary."
            icon={Wallet}
            gradient="from-emerald-500 to-lime-400"
          />
          <StatCard
            title="Available Balance"
            value={formatAmount(totalBalance)}
            subtitle="Across all balance sources."
            icon={CreditCard}
            gradient="from-cyan-500 to-sky-400"
          />
          <StatCard
            title="Month Spent"
            value={formatAmount(displayStats.monthSpent)}
            subtitle={isCurrentMonth ? "Spending this month." : `Total spent in ${selectedMonthLabel}.`}
            icon={TrendingDown}
            gradient="from-rose-500 to-orange-400"
          />
          <StatCard
            title="Remaining"
            value={formatAmount(displayStats.remainingSalary)}
            subtitle="Salary minus expenses."
            icon={BadgeDollarSign}
            gradient="from-violet-600 to-fuchsia-500"
          />
          <StatCard
            title="Average"
            value={formatAmount(displayStats.averageExpense)}
            subtitle="Average per expense."
            icon={Coins}
            gradient="from-blue-500 to-indigo-400"
          />
          <StatCard
            title="External Income"
            value={formatAmount(externalIncome)}
            subtitle="Non-salary sources, excluding refunds."
            icon={Banknote}
            gradient="from-teal-500 to-emerald-400"
          />
        </section>

        <section className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-5 shadow-xl shadow-slate-200/60 backdrop-blur-xl dark:border-white/[0.08] dark:bg-[#0f0c1f]/90 dark:shadow-black/25 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-900/20">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-emerald-500 dark:text-emerald-300">
                  Month View
                </p>
                <h2 className="text-lg font-black tracking-[-0.03em] text-slate-950 dark:text-white">
                  {selectedMonthLabel}
                </h2>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {!isCurrentMonth && (
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-black text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-300">
                  <Eye className="h-3.5 w-3.5" />
                  View-only — past month
                </div>
              )}

              <div className="relative">
                <select
                  value={selectedMonth}
                  onChange={(e) => void changeSelectedMonth(e.target.value)}
                  className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-4 pr-10 text-sm font-bold text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 dark:border-white/[0.08] dark:bg-slate-950/90 dark:text-slate-100 sm:w-auto"
                >
                  {monthOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
          </div>
        </section>

        {error ? (
          <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
            {error}
          </div>
        ) : null}

        <section className="grid gap-5 xl:grid-cols-2">
          <div className={fixedCardClass}>
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <SectionHeader
                eyebrow="Salary"
                title="Set, update, or reset salary"
              />

              <button
                onClick={() => void refreshAll(true)}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-slate-400 dark:hover:bg-white/[0.10] dark:hover:text-white"
                aria-label="Refresh money data"
              >
                <RefreshCcw
                  className={`h-4 w-4 ${summaryLoading ? "animate-spin" : ""}`}
                />
              </button>
            </div>

            <div className="mb-5 rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 p-4 dark:border-white/[0.08] dark:from-white/[0.04] dark:to-white/[0.02]">
              <p className="text-sm font-bold text-slate-500">
                {isCurrentMonth ? "Current salary" : `Salary in ${selectedMonthLabel}`}
              </p>
              <p className="mt-2 text-3xl font-black tracking-[-0.04em] text-slate-950 dark:text-white">
                {formatAmount(displayStats.salary)}
              </p>
              {!isCurrentMonth && displayStats.salary === 0 && (
                <p className="mt-1 text-xs font-semibold text-slate-400">
                  No salary record found for this month.
                </p>
              )}
            </div>

            {isCurrentMonth && (
              <form onSubmit={handleSalarySubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
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
                      className={inputClass}
                    />
                    {salaryErrors.amount ? (
                      <p className="mt-2 text-sm font-semibold text-rose-500">
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
                      className={inputClass}
                    />
                    {salaryErrors.date ? (
                      <p className="mt-2 text-sm font-semibold text-rose-500">
                        {salaryErrors.date}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="submit"
                    disabled={salarySaving}
                    className={buttonPrimary}
                  >
                    {salarySaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CreditCard className="h-4 w-4" />
                    )}
                    Save salary
                  </button>

                  <button
                    type="button"
                    onClick={handleSalaryReset}
                    disabled={salaryDeleting}
                    className={buttonDanger}
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
            )}
          </div>

          <div className={fixedCardClass}>
            <SectionHeader
              eyebrow="Available Balance"
              title="Track bank, cash, salary, and external balance"
              description="Add or update a balance source. Saved records are managed below."
            />

            <div className="mb-5 rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 p-4 dark:border-white/[0.08] dark:from-white/[0.04] dark:to-white/[0.02]">
              <p className="text-sm font-bold text-slate-500">
                Current available balance
              </p>
              <p className="mt-2 text-3xl font-black tracking-[-0.04em] text-slate-950 dark:text-white">
                {formatAmount(totalBalance)}
              </p>
            </div>

            {isCurrentMonth && (
              <form
                id="balance-form"
                onSubmit={handleBalanceSubmit}
                className="space-y-4"
              >
                <div className="grid gap-4 md:grid-cols-2">
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
                      className={inputClass}
                    />
                    {balanceErrors.amount ? (
                      <p className="mt-2 text-sm font-semibold text-rose-500">
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
                      className={inputClass}
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
                    className={buttonPrimary}
                  >
                    {balanceSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Coins className="h-4 w-4" />
                    )}
                    {editingBalanceId ? "Update balance" : "Save balance"}
                  </button>

                  <button
                    type="button"
                    onClick={handleBalanceCancel}
                    disabled={balanceSaving}
                    className={buttonSecondary}
                  >
                    <RefreshCcw className="h-4 w-4" />
                    {editingBalanceId ? "Cancel" : "Clear"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-2">
          <div className="h-[460px] overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/90 p-5 shadow-xl shadow-slate-200/60 backdrop-blur-xl dark:border-white/[0.08] dark:bg-[#0f0c1f]/90 dark:shadow-black/25 sm:p-6">
            <div className="flex h-full flex-col">
              <SectionHeader
                eyebrow="Categories"
                title="Manage spending buckets"
              />

              <div className="flex-1 overflow-y-auto pr-1">
                {isCurrentMonth && (
                  <form onSubmit={handleCategorySubmit} className="space-y-4">
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
                        placeholder="Food"
                        className={inputClass}
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
                      className={buttonPrimary}
                    >
                      {categorySaving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                      Add category
                    </button>
                  </form>
                )}

                <div className={`flex flex-wrap gap-3 ${isCurrentMonth ? "mt-6" : ""}`}>
                  {categories.length > 0 ? (
                    categories.map((category) => (
                      <div
                        key={category._id}
                        className="inline-flex max-w-full items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-700 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-slate-200"
                      >
                        <Tags className="h-3.5 w-3.5 shrink-0 text-violet-500" />
                        <span className="truncate">
                          {formatCategoryLabel(category.name)}
                        </span>
                        {isCurrentMonth && (
                          <button
                            type="button"
                            onClick={() =>
                              void handleCategoryDelete(category.name)
                            }
                            disabled={deletingCategoryName === category.name}
                            className="shrink-0 rounded-full p-1 text-slate-400 transition hover:text-rose-500 disabled:cursor-not-allowed disabled:opacity-70"
                            aria-label={`Delete ${formatCategoryLabel(category.name)}`}
                          >
                            {deletingCategoryName === category.name ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="w-full rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm font-semibold text-slate-500 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-slate-400">
                      No categories yet. Add one before saving expenses.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="h-[460px] overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/90 p-5 shadow-xl shadow-slate-200/60 backdrop-blur-xl dark:border-white/[0.08] dark:bg-[#0f0c1f]/90 dark:shadow-black/25 sm:p-6">
            <div className="flex h-full flex-col">
              <SectionHeader
                eyebrow="Balance Sources"
                title="Manage saved balance records"
                description="Review, edit, or delete your bank, cash, salary, and external balance entries."
              />

              <div className="flex-1 overflow-y-auto pr-1">
                {balanceSources.length > 0 ? (
                  <div className="space-y-3">
                    {balanceSources.map((source) => (
                      <div
                        key={source._id}
                        className="grid gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-white/[0.08] dark:bg-white/[0.04] sm:grid-cols-[1fr_1fr_auto] sm:items-center"
                      >
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                            {source.type}
                          </p>
                          <p className="mt-2 text-lg font-black text-slate-950 dark:text-white">
                            {formatAmount(source.amount)}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                            Created
                          </p>
                          <p className="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
                            {source.createdAt
                              ? formatDate(source.createdAt)
                              : "Unknown"}
                          </p>
                        </div>

                        {isCurrentMonth && (
                          <div className="grid grid-cols-2 gap-2 sm:flex">
                            <button
                              type="button"
                              onClick={() => handleEditBalanceSource(source)}
                              className={buttonSecondary}
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteBalanceSource(source)}
                              disabled={balanceDeleting}
                              className={buttonDanger}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm font-semibold text-slate-500 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-slate-400">
                    No balance records found.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {isCurrentMonth ? (
          <section
            ref={expenseFormRef}
            className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-5 shadow-xl shadow-slate-200/60 backdrop-blur-xl dark:border-white/[0.08] dark:bg-[#0f0c1f]/90 dark:shadow-black/25 sm:p-6"
          >
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <SectionHeader
              eyebrow="Expense Management"
              title={editingExpenseId ? "Edit expense" : "Add a new expense"}
            />

            {editingExpenseId ? (
              <button
                type="button"
                onClick={resetExpenseForm}
                className={buttonSecondary}
              >
                Cancel edit
              </button>
            ) : null}
          </div>

          <form onSubmit={handleExpenseSubmit} className="space-y-4">
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
                  className={inputClass}
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
                  className={inputClass}
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
                Note <span className="font-medium text-slate-400">(optional)</span>
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
                className={inputClass}
              />
              {expenseErrors.note ? (
                <p className="mt-2 text-sm font-semibold text-rose-500">
                  {expenseErrors.note}
                </p>
              ) : null}
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-600 dark:text-slate-300">
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
                className={inputClass}
              >
                <option value="">Select a category</option>
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {formatCategoryLabel(category)}
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
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-500 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-cyan-950/30 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
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
          </section>
        ) : null}

        <section className="space-y-5">
          <div className={cardClass}>
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <SectionHeader
                eyebrow="Expense History"
                title="Review and refine your expense records"
                description="Filter by date or category, then edit or remove entries without leaving the page."
              />

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  ["Visible", expenses.length],
                  ["Visible Cost", formatAmount(visibleExpenseTotal)],
                  ["Total", pagination.total],
                  ["Page", `${pagination.page}/${pagination.totalPages}`],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/[0.08] dark:bg-white/[0.04]"
                  >
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                      {label}
                    </p>
                    <p className="mt-1 text-lg font-black text-slate-950 dark:text-white">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <form
              onSubmit={handleApplyFilters}
              className="mb-5 rounded-3xl border border-slate-200 bg-slate-50/70 p-4 dark:border-white/[0.08] dark:bg-white/[0.03]"
            >
              <div className={`grid gap-3 ${isCurrentMonth ? "md:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_auto]" : "xl:grid-cols-[1fr_auto]"}`}>
                {isCurrentMonth && (
                  <label>
                    <span className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-500">
                      From
                    </span>
                    <input
                      type="date"
                      value={filters.startDate}
                      onChange={(event) =>
                        updateFilterField("startDate", event.target.value)
                      }
                      className={inputClass}
                    />
                  </label>
                )}

                {isCurrentMonth && (
                  <label>
                    <span className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-500">
                      To
                    </span>
                    <input
                      type="date"
                      value={filters.endDate}
                      onChange={(event) =>
                        updateFilterField("endDate", event.target.value)
                      }
                      className={inputClass}
                    />
                  </label>
                )}

                <label>
                  <span className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-500">
                    Category
                  </span>
                  <select
                    value={filters.category}
                    onChange={(event) =>
                      updateFilterField("category", event.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="">All categories</option>
                    {categoryOptions.map((category) => (
                      <option key={category} value={category}>
                        {formatCategoryLabel(category)}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={expensesLoading}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-black text-white transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70 dark:bg-white dark:text-slate-950 xl:w-auto"
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

            <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-white/[0.08]">
              <div className={`hidden gap-4 bg-slate-50 px-5 py-4 text-xs font-black uppercase tracking-wider text-slate-500 lg:grid dark:bg-white/[0.04] ${isCurrentMonth ? "grid-cols-[0.8fr_1.8fr_1.2fr_0.9fr_0.8fr]" : "grid-cols-[0.8fr_1.8fr_1.2fr_0.9fr]"}`}>
                <span>Amount</span>
                <span>Description</span>
                <span>Category</span>
                <span>Date</span>
                {isCurrentMonth && <span className="text-right">Actions</span>}
              </div>

              <div className="max-h-[430px] overflow-y-auto">
                {expensesLoading ? (
                  <div className="space-y-3 p-5">
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
                        className={`grid gap-4 p-5 lg:items-center ${isCurrentMonth ? "lg:grid-cols-[0.8fr_1.8fr_1.2fr_0.9fr_0.8fr]" : "lg:grid-cols-[0.8fr_1.8fr_1.2fr_0.9fr]"}`}
                      >
                        <div>
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
                          <p className="truncate font-bold text-slate-700 dark:text-slate-200">
                            {expense.note?.trim() || "No description provided"}
                          </p>
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400 lg:hidden">
                            Category
                          </p>
                          <span
                            title={formatCategoryLabel(expense.category)}
                            className="inline-flex max-w-full truncate rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-bold text-slate-700 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-slate-200"
                          >
                            {formatCategoryLabel(expense.category)}
                          </span>
                        </div>

                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400 lg:hidden">
                            Date
                          </p>
                          <p className="font-semibold text-slate-500 dark:text-slate-400">
                            {formatDate(expense.date)}
                          </p>
                        </div>

                        {isCurrentMonth && (
                          <div className="flex gap-2 lg:justify-end">
                            <button
                              type="button"
                              onClick={() => handleEditExpense(expense)}
                              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 transition hover:bg-slate-100 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-slate-200"
                              aria-label="Edit expense"
                            >
                              <PencilLine className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => void handleDeleteExpense(expense)}
                              disabled={deletingExpenseId === expense._id}
                              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-70 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200"
                              aria-label="Delete expense"
                            >
                              {deletingExpenseId === expense._id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-6 py-12 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-500 dark:bg-white/[0.06] dark:text-slate-400">
                      <Coins className="h-7 w-7" />
                    </div>
                    <h3 className="mt-4 text-lg font-black text-slate-950 dark:text-white">
                      No expenses found
                    </h3>
                    <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                      Adjust filters or add a new expense.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                Page {pagination.page} of {pagination.totalPages} |{" "}
                {pagination.total} total expenses
              </p>

              <div className="grid grid-cols-2 gap-2 sm:flex">
                <button
                  type="button"
                  onClick={() =>
                    void goToPage(Math.max(1, pagination.page - 1))
                  }
                  disabled={pagination.page <= 1 || expensesLoading}
                  className={buttonSecondary}
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
                  className={buttonSecondary}
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          <div className={cardClass}>
            <SectionHeader
              eyebrow="Monthly Report"
              title={`${selectedMonthLabel} Summary`}
              description={isCurrentMonth ? "Your current month financial overview." : `A read-only snapshot of your finances for ${selectedMonthLabel}.`}
            />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  label: "Salary",
                  value: formatAmount(displayStats.salary),
                  sub: isCurrentMonth ? "Active salary" : "Salary that month",
                  color: "text-emerald-600 dark:text-emerald-300",
                },
                {
                  label: "Total Spent",
                  value: formatAmount(displayStats.monthSpent),
                  sub: "All expenses",
                  color: "text-rose-500 dark:text-rose-300",
                },
                {
                  label: "Remaining",
                  value: formatAmount(displayStats.remainingSalary),
                  sub: "Salary − expenses",
                  color: displayStats.remainingSalary >= 0 ? "text-cyan-600 dark:text-cyan-300" : "text-orange-500 dark:text-orange-300",
                },
                {
                  label: "Records",
                  value: formatAmount(displayStats.expenseCount),
                  sub: `Avg ${formatAmount(displayStats.averageExpense)} each`,
                  color: "text-violet-600 dark:text-violet-300",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 dark:border-white/[0.08] dark:from-white/[0.04] dark:to-white/[0.02]"
                >
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    {item.label}
                  </p>
                  <p className={`mt-2 text-2xl font-black tracking-[-0.04em] ${item.color}`}>
                    {item.value}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-400">
                    {item.sub}
                  </p>
                </div>
              ))}
            </div>

            {effectiveTopCategories.length > 0 && (
              <div className="mt-5">
                <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  Top categories this month
                </p>
                <div className="flex flex-wrap gap-2">
                  {effectiveTopCategories.slice(0, 5).map((cat, i) => (
                    <div
                      key={cat.category}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm dark:border-white/[0.08] dark:bg-white/[0.04]"
                    >
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: chartColors[i % chartColors.length] }}
                      />
                      <span className="font-bold text-slate-700 dark:text-slate-200">
                        {cat.categoryLabel}
                      </span>
                      <span className="font-black text-slate-950 dark:text-white">
                        {formatAmount(cat.totalSpent)}
                      </span>
                      <span className="text-xs text-slate-400">{cat.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <div className={cardClass}>
              <SectionHeader
                eyebrow="Insights"
                title={`${selectedMonthLabel} — Most spent & top categories`}
              />

              <div className="rounded-3xl bg-gradient-to-br from-slate-50 to-slate-100 p-4 dark:from-white/[0.05] dark:to-white/[0.03]">
                <p className="text-sm font-bold text-slate-500">
                  Most spent category
                </p>
                <p className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
                  {mostSpentCategory
                    ? mostSpentCategory.categoryLabel
                    : "No data yet"}
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
                  {mostSpentCategory
                    ? `${formatAmount(mostSpentCategory.totalSpent)} spent · ${mostSpentCategory.percentage}% of total spend`
                    : "This will appear once expense data exists."}
                </p>
              </div>

              <div className="mt-5 h-80 rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 p-4 pb-2 dark:border-white/[0.08] dark:from-white/[0.04] dark:to-white/[0.02]">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ right: 10, bottom: 42, left: 0 }}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(148,163,184,0.22)"
                      />
                      <XAxis
                        dataKey="shortName"
                        interval={0}
                        height={58}
                        angle={-28}
                        textAnchor="end"
                        tickLine={false}
                        axisLine={false}
                        tick={{
                          fill: "#94a3b8",
                          fontSize: 11,
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
                        content={renderChartTooltip}
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

            <div className={cardClass}>
              <SectionHeader
                eyebrow="Top Categories"
                title={`${selectedMonthLabel} — Spend distribution`}
              />

              <div className="max-h-[390px] space-y-3 overflow-y-auto pr-1">
                {effectiveTopCategories.length > 0 ? (
                  effectiveTopCategories.map((category) => (
                    <div
                      key={category.category}
                      className="rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-50 to-white px-4 py-4 dark:border-white/[0.08] dark:from-white/[0.04] dark:to-white/[0.02]"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="truncate text-base font-black text-slate-950 dark:text-white">
                            {category.categoryLabel}
                          </p>
                          <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
                            {category.count} expense
                            {category.count === 1 ? "" : "s"} ·{" "}
                            {category.percentage}%
                          </p>
                        </div>
                        <p className="shrink-0 text-lg font-black text-emerald-600 dark:text-emerald-300">
                          {formatAmount(category.totalSpent)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm font-semibold text-slate-500 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-slate-400">
                    No top-category data yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      {insufficientFundsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"
            onClick={() => { if (!fundsActionLoading) closeFundsModal(); }}
          />
          <div className="relative z-10 w-full max-w-md rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-2xl dark:border-white/[0.08] dark:bg-[#0f0c1f]">
            {selectedFundsOption === null && (
              <div>
                <div className="mb-6 text-center">
                  <div className="mb-3 text-5xl">😅</div>
                  <h3 className="text-xl font-black text-slate-950 dark:text-white">
                    Oops! Not enough money
                  </h3>
                  <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                    Looks like you do not have enough balance right now. How would you like to top up?
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setSelectedFundsOption("loan")}
                    className="flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-emerald-300 hover:bg-emerald-50 dark:border-white/[0.08] dark:bg-white/[0.05] dark:hover:bg-emerald-500/10"
                  >
                    <span className="text-2xl">💸</span>
                    <div>
                      <p className="font-black text-slate-950 dark:text-white">Took a Loan</p>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Someone lent you money — record it here</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedFundsOption("income")}
                    className="flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-cyan-300 hover:bg-cyan-50 dark:border-white/[0.08] dark:bg-white/[0.05] dark:hover:bg-cyan-500/10"
                  >
                    <span className="text-2xl">📈</span>
                    <div>
                      <p className="font-black text-slate-950 dark:text-white">External Income</p>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Freelance, side hustle, or any extra income</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedFundsOption("savings")}
                    className="flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-violet-300 hover:bg-violet-50 dark:border-white/[0.08] dark:bg-white/[0.05] dark:hover:bg-violet-500/10"
                  >
                    <span className="text-2xl">🏦</span>
                    <div>
                      <p className="font-black text-slate-950 dark:text-white">Other Savings</p>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Personal savings or reserve funds you are tapping</p>
                    </div>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={closeFundsModal}
                  className="mt-4 w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-100 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-slate-300"
                >
                  Cancel
                </button>
              </div>
            )}

            {selectedFundsOption === "loan" && (
              <div>
                <div className="mb-5 flex items-center gap-3">
                  <button type="button" onClick={() => setSelectedFundsOption(null)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
                    ←
                  </button>
                  <h3 className="text-lg font-black text-slate-950 dark:text-white">Record a Loan</h3>
                </div>
                <form onSubmit={(e) => void handleLoanSubmit(e)} className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-600 dark:text-slate-300">Person who lent you</label>
                    <input
                      value={loanForm.personName}
                      onChange={(e) => { setLoanForm((p) => ({ ...p, personName: e.target.value })); if (loanErrors.personName) setLoanErrors({}); }}
                      placeholder="e.g. Uncle Rahim"
                      className={inputClass}
                    />
                    {loanErrors.personName && <p className="mt-1 text-sm font-semibold text-rose-500">{loanErrors.personName}</p>}
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-bold text-slate-600 dark:text-slate-300">Amount</label>
                      <input type="number" min="0" step="0.01" value={loanForm.amount} onChange={(e) => { setLoanForm((p) => ({ ...p, amount: e.target.value })); if (loanErrors.amount) setLoanErrors({}); }} placeholder="5000" className={inputClass} />
                      {loanErrors.amount && <p className="mt-1 text-sm font-semibold text-rose-500">{loanErrors.amount}</p>}
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-bold text-slate-600 dark:text-slate-300">Date</label>
                      <input type="date" value={loanForm.date} onChange={(e) => { setLoanForm((p) => ({ ...p, date: e.target.value })); if (loanErrors.date) setLoanErrors({}); }} className={inputClass} />
                      {loanErrors.date && <p className="mt-1 text-sm font-semibold text-rose-500">{loanErrors.date}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-600 dark:text-slate-300">Reason <span className="font-medium text-slate-400">(optional)</span></label>
                    <input value={loanForm.reason} onChange={(e) => { setLoanForm((p) => ({ ...p, reason: e.target.value })); if (loanErrors.reason) setLoanErrors({}); }} placeholder="e.g. Emergency rent" className={inputClass} />
                  </div>
                  <button type="submit" disabled={fundsActionLoading} className={buttonPrimary}>
                    {fundsActionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Record Loan
                  </button>
                </form>
              </div>
            )}

            {selectedFundsOption === "income" && (
              <div>
                <div className="mb-5 flex items-center gap-3">
                  <button type="button" onClick={() => setSelectedFundsOption(null)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
                    ←
                  </button>
                  <h3 className="text-lg font-black text-slate-950 dark:text-white">Add External Income</h3>
                </div>
                <form onSubmit={(e) => void handleIncomeSubmit(e)} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-bold text-slate-600 dark:text-slate-300">Amount</label>
                      <input type="number" min="0" step="0.01" value={incomeForm.amount} onChange={(e) => { setIncomeForm((p) => ({ ...p, amount: e.target.value })); if (incomeErrors.amount) setIncomeErrors({}); }} placeholder="3000" className={inputClass} />
                      {incomeErrors.amount && <p className="mt-1 text-sm font-semibold text-rose-500">{incomeErrors.amount}</p>}
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-bold text-slate-600 dark:text-slate-300">Date</label>
                      <input type="date" value={incomeForm.date} onChange={(e) => { setIncomeForm((p) => ({ ...p, date: e.target.value })); if (incomeErrors.date) setIncomeErrors({}); }} className={inputClass} />
                      {incomeErrors.date && <p className="mt-1 text-sm font-semibold text-rose-500">{incomeErrors.date}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-600 dark:text-slate-300">Source</label>
                    <input value={incomeForm.source} onChange={(e) => { setIncomeForm((p) => ({ ...p, source: e.target.value })); if (incomeErrors.source) setIncomeErrors({}); }} placeholder="e.g. Freelance project" className={inputClass} />
                    {incomeErrors.source && <p className="mt-1 text-sm font-semibold text-rose-500">{incomeErrors.source}</p>}
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-600 dark:text-slate-300">Note (optional)</label>
                    <input value={incomeForm.note} onChange={(e) => setIncomeForm((p) => ({ ...p, note: e.target.value }))} placeholder="Any extra details" className={inputClass} />
                  </div>
                  <button type="submit" disabled={fundsActionLoading} className={buttonPrimary}>
                    {fundsActionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Add Income
                  </button>
                </form>
              </div>
            )}

            {selectedFundsOption === "savings" && (
              <div>
                <div className="mb-5 flex items-center gap-3">
                  <button type="button" onClick={() => setSelectedFundsOption(null)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
                    ←
                  </button>
                  <h3 className="text-lg font-black text-slate-950 dark:text-white">Add Other Savings</h3>
                </div>
                <form onSubmit={(e) => void handleSavingsSubmit(e)} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-bold text-slate-600 dark:text-slate-300">Amount</label>
                      <input type="number" min="0" step="0.01" value={savingsForm.amount} onChange={(e) => { setSavingsForm((p) => ({ ...p, amount: e.target.value })); if (savingsErrors.amount) setSavingsErrors({}); }} placeholder="2000" className={inputClass} />
                      {savingsErrors.amount && <p className="mt-1 text-sm font-semibold text-rose-500">{savingsErrors.amount}</p>}
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-bold text-slate-600 dark:text-slate-300">Date</label>
                      <input type="date" value={savingsForm.date} onChange={(e) => { setSavingsForm((p) => ({ ...p, date: e.target.value })); if (savingsErrors.date) setSavingsErrors({}); }} className={inputClass} />
                      {savingsErrors.date && <p className="mt-1 text-sm font-semibold text-rose-500">{savingsErrors.date}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-600 dark:text-slate-300">Source Name</label>
                    <input value={savingsForm.sourceName} onChange={(e) => { setSavingsForm((p) => ({ ...p, sourceName: e.target.value })); if (savingsErrors.sourceName) setSavingsErrors({}); }} placeholder="e.g. Emergency fund" className={inputClass} />
                    {savingsErrors.sourceName && <p className="mt-1 text-sm font-semibold text-rose-500">{savingsErrors.sourceName}</p>}
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-600 dark:text-slate-300">Note (optional)</label>
                    <input value={savingsForm.note} onChange={(e) => setSavingsForm((p) => ({ ...p, note: e.target.value }))} placeholder="Any extra details" className={inputClass} />
                  </div>
                  <button type="submit" disabled={fundsActionLoading} className={buttonPrimary}>
                    {fundsActionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Add Savings
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      <PremiumModal
        open={Boolean(confirmState)}
        title={confirmState?.title ?? "Confirm action"}
        description={confirmState?.description}
        subtitle="Confirmation"
        variant={confirmState?.variant ?? "default"}
        size="sm"
        onClose={() => {
          if (!confirmLoading) setConfirmState(null);
        }}
        footer={
          <>
            <button
              type="button"
              onClick={() => {
                if (!confirmLoading) setConfirmState(null);
              }}
              className="rounded-3xl border border-slate-700/80 bg-slate-950/80 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-900"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={async () => {
                if (!confirmState || confirmLoading) return;
                setConfirmLoading(true);

                try {
                  await confirmState.action();
                } finally {
                  setConfirmLoading(false);
                  setConfirmState(null);
                }
              }}
              disabled={confirmLoading}
              className="rounded-3xl bg-gradient-to-r from-rose-500 via-rose-600 to-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-500/20 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {confirmLoading
                ? "Processing..."
                : (confirmState?.confirmLabel ?? "Confirm")}
            </button>
          </>
        }
      />
    </div>
  );
}
