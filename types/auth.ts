export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin" | string;
  gender?: string;
  occupation?: string;
  loginStreak: number;
  longestLoginStreak: number;
  lastLoginDate?: string | null;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  gender?: string;
  occupation?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}
