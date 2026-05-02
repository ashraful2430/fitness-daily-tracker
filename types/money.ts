export interface MoneyCategory {
  _id: string;
  userId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface MoneyExpense {
  _id: string;
  userId?: string;
  amount: number;
  note: string;
  category: string;
  date: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SalaryRecord {
  _id: string;
  userId: string;
  amount: number;
  date: string;
}

export interface BalanceSource {
  _id: string;
  userId: string;
  type: "CASH" | "BANK" | "SALARY" | "EXTERNAL" | "OTHER";
  amount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface BalanceResponse {
  totalBalance: number;
  sources: BalanceSource[];
}

export interface MoneySummaryTopCategory {
  _id: string;
  totalSpent: number;
  expenseCount: number;
}

export interface MoneySummary {
  salaryAmount: number;
  availableBalance: number;
  totalExpenses: number;
  expenseCount: number;
  averageExpense: number;
  currentMonthSpent: number;
  remainingSalary: number;
  topCategories: MoneySummaryTopCategory[];
}

export interface MostSpentCategory {
  _id: string;
  totalSpent: number;
}

export interface MoneyPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ExpensesQuery {
  startDate?: string;
  endDate?: string;
  category?: string;
  page?: number;
  limit?: number;
}

export interface ExpensesResponse {
  data: MoneyExpense[];
  pagination: MoneyPagination;
}

export interface CreateCategoryRequest {
  name: string;
}

export interface CreateExpenseRequest {
  amount: number;
  note: string;
  category: string;
  date: string;
}

export interface UpdateExpenseRequest {
  amount: number;
  note: string;
  category: string;
  date: string;
}

export interface UpdateSalaryRequest {
  amount: number;
  date: string;
}

export interface UpdateAccountBalanceRequest {
  amount: number;
}

// ===== BALANCE TYPES =====

export interface MonthlyExpenseSummary {
  month: string;
  total: number;
}

// ===== LENDING TYPES =====

export type LoanStatus = "ACTIVE" | "PARTIALLY_PAID" | "CLOSED";
export type SourceType = "PERSONAL" | "BORROWED";
export type TransactionType = "DISBURSEMENT" | "REPAYMENT";

export interface Loan {
  _id: string;
  userId: string;
  borrower: string;
  amount: number;
  sourceType: SourceType;
  borrowedFromName?: string;
  status: LoanStatus;
  totalDisbursed: number;
  totalRepaid: number;
  remainingAmount: number;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LendingTransaction {
  _id: string;
  loanId: string;
  type: TransactionType;
  amount: number;
  createdAt: string;
}

export interface ExternalDebt {
  _id: string;
  userId: string;
  creditorName: string;
  totalAmount: number;
  totalRepaid: number;
  remainingAmount: number;
  isCleared: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FinancialSummary {
  totalBalance: number;
  totalExpenses: number;
  totalLoansGiven: number;
  totalDebt: number;
  netPosition: number;
  activeDebts?: ExternalDebt[];
  personalBalance?: number;
  totalLent?: number;
  totalOutstandingLoans?: number;
  totalBorrowedLiability?: number;
}

export interface LendingStats {
  totalActiveLoans: number;
  totalPartiallyPaidLoans: number;
  totalClosedLoans: number;
  totalMoneyLent: number;
  averageLoanAmount: number;
  totalMoneyReceived: number;
}

export interface CreateLoanRequest {
  borrower: string;
  amount: number;
  sourceType: SourceType;
  borrowedFromName?: string;
  note?: string;
}

export interface RepaymentRequest {
  amount: number;
}

export interface CreateLoanResponse {
  message: string;
  loan: Loan;
}

export interface RepaymentResponse {
  message: string;
  loan: Loan;
  remainingLoanAmount: number;
}

export interface LoanDetailsResponse {
  loan: Loan;
  transactions: LendingTransaction[];
  totalDisbursed: number;
  totalRepaid: number;
  remainingAmount: number;
}
