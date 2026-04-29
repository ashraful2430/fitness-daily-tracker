export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin" | string;
  loginStreak: number;
  longestLoginStreak: number;
  lastLoginDate?: string | null;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}
