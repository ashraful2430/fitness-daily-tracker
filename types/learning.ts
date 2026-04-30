export type LearningSessionStatus =
  | "planned"
  | "active"
  | "paused"
  | "completed";

export interface LearningSession {
  _id: string;
  userId: string;
  title: string;
  subject: string;
  plannedMinutes: number;
  actualMinutes: number;
  status: LearningSessionStatus;
  notes?: string;
  date: string;
  startedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LearningSubjectStat {
  _id: string;
  totalMinutes: number;
  sessionCount: number;
}

export interface LearningSummary {
  todayMinutes: number;
  weekMinutes: number;
  totalMinutes: number;
  totalSessions: number;
  completedSessions: number;
  completionRate: number;
  currentStreak: number;
  activeSession: LearningSession | null;
  topSubjects: LearningSubjectStat[];
  recentSessions: LearningSession[];
}

export interface LearningPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface LearningSessionsQuery {
  page?: number;
  limit?: number;
  status?: LearningSessionStatus | "";
  subject?: string;
  startDate?: string;
  endDate?: string;
}

export interface LearningSessionsResponse {
  data: LearningSession[];
  pagination: LearningPagination;
}

export interface CreateLearningSessionRequest {
  title: string;
  subject: string;
  plannedMinutes: number;
  notes?: string;
  date: string;
}

export interface UpdateLearningSessionRequest {
  title?: string;
  subject?: string;
  plannedMinutes?: number;
  actualMinutes?: number;
  notes?: string;
  date?: string;
  status?: LearningSessionStatus;
  startedAt?: string | null;
  completedAt?: string | null;
}
