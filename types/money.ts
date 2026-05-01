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
