export interface MoneyCategory {
  name: string;
}

export interface MoneyExpense {
  _id?: string;
  id?: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SalaryRecord {
  amount: number;
}

export interface MostSpentCategory {
  category: string;
  amount?: number;
  totalAmount?: number;
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

export interface UpdateSalaryRequest {
  amount: number;
}
