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
  description: string;
  category: string;
  date: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SalaryRecord {
  _id: string;
  userId: string;
  amount: number;
}

export interface AccountBalanceRecord {
  _id: string;
  userId: string;
  amount: number;
  createdAt?: string;
  updatedAt?: string;
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
  description: string;
  category: string;
  date: string;
}

export interface UpdateExpenseRequest {
  amount: number;
  description: string;
  category: string;
  date: string;
}

export interface UpdateSalaryRequest {
  amount: number;
}

export interface UpdateAccountBalanceRequest {
  amount: number;
}

// ===== LENDING TYPES =====

export type LoanStatus = "ACTIVE" | "PARTIALLY_PAID" | "CLOSED";
export type SourceType = "PERSONAL" | "BORROWED";
export type TransactionType = "DISBURSEMENT" | "REPAYMENT";

export interface Loan {
  _id: string;
  userId: string;
  borrowerName: string;
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
  personalBalance: number;
  totalLent: number;
  totalOutstandingLoans: number;
  totalBorrowedLiability: number;
  netPosition: number;
  activeDebts: ExternalDebt[];
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
  borrowerName: string;
  amount: number;
  sourceType: SourceType;
  borrowedFromName?: string;
  note?: string;
}

export interface RepaymentRequest {
  repaymentAmount: number;
}

export interface CreateLoanResponse {
  message: string;
  loan: Loan;
  ledger: LendingTransaction;
}

export interface RepaymentResponse {
  message: string;
  loan: Loan;
  ledger: LendingTransaction;
  remainingLoanAmount: number;
}

export interface LoanDetailsResponse {
  loan: Loan;
  transactions: LendingTransaction[];
  totalDisbursed: number;
  totalRepaid: number;
  remainingAmount: number;
}
