import type { FinanceSummary, FinancialSummary } from "@/types/money";

type SummaryLike = Partial<FinanceSummary & FinancialSummary> | null | undefined;

export type NormalizedFinanceSummary = {
  availableBalance: number;
  loanDebt: number;
  netBalance: number;
  salary: number;
  externalIncome: number;
  savings: number;
  activeLoans: number;
  borrowedLending: number;
  repaidLoans: number;
  expenses: number;
  lendingFromPersonal: number;
  lendingOutstanding: number;
  directLoans: number;
  borrowedLendingLoans: number;
  lending: number;
  balanceAccounts: number;
};

function numberValue(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function normalizeFinanceSummary(
  summary: SummaryLike,
): NormalizedFinanceSummary {
  const availableBalance = numberValue(
    summary?.availableBalance,
    numberValue(summary?.totalBalance, numberValue(summary?.personalBalance)),
  );
  const loanDebt = numberValue(
    summary?.loanDebt,
    numberValue(summary?.totalLoanDebt, numberValue(summary?.totalDebt)),
  );
  const netBalance = numberValue(
    summary?.netBalance,
    numberValue(summary?.netPosition, availableBalance - loanDebt),
  );
  const lendingOutstanding = numberValue(
    summary?.lendingOutstanding,
    numberValue(
      summary?.totalLending,
      numberValue(summary?.totalOutstandingLoans, numberValue(summary?.totalLent)),
    ),
  );

  return {
    availableBalance,
    loanDebt,
    netBalance,
    salary: numberValue(summary?.salary),
    externalIncome: numberValue(summary?.externalIncome),
    savings: numberValue(summary?.savings),
    activeLoans: numberValue(summary?.activeLoans),
    borrowedLending: numberValue(summary?.borrowedLending),
    repaidLoans: numberValue(summary?.repaidLoans),
    expenses: numberValue(summary?.expenses, numberValue(summary?.totalExpenses)),
    lendingFromPersonal: numberValue(summary?.lendingFromPersonal),
    lendingOutstanding,
    directLoans: numberValue(summary?.breakdown?.directLoans),
    borrowedLendingLoans: numberValue(summary?.breakdown?.borrowedLendingLoans),
    lending: numberValue(summary?.breakdown?.lending, lendingOutstanding),
    balanceAccounts: numberValue(summary?.breakdown?.balanceAccounts, availableBalance),
  };
}
