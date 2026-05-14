export type LearnerMode = "student" | "job_holder" | "child" | "self_learner";

export type LearningType =
  | "reading"
  | "video"
  | "practice"
  | "revision"
  | "assignment"
  | "exam_prep"
  | "course"
  | "other";

export type LearningDifficulty = "easy" | "medium" | "hard";
export type LearningPriority = "low" | "medium" | "high";

export type LearningSessionStatus =
  | "planned"
  | "active"
  | "paused"
  | "completed"
  | "missed"
  | "cancelled";

export interface LearningSession {
  _id: string;
  id?: string;
  userId?: string;
  title: string;
  subject: string;
  goal: string;
  plannedMinutes: number;
  actualMinutes: number;
  learnerMode: LearnerMode;
  learningType: LearningType;
  difficulty: LearningDifficulty;
  priority: LearningPriority;
  status: LearningSessionStatus;
  tags: string[];
  notes?: string;
  studyDate: string;
  date: string;
  startedAt?: string | null;
  pausedAt?: string | null;
  completedAt?: string | null;
  cancelledAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TimerPreset {
  _id?: string;
  id?: string;
  label: string;
  minutes: number;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LearningTemplate {
  _id?: string;
  id?: string;
  name: string;
  title: string;
  subject: string;
  goal: string;
  plannedMinutes: number;
  learnerMode: LearnerMode;
  learningType: LearningType;
  difficulty: LearningDifficulty;
  priority: LearningPriority;
  tags: string[];
  notes?: string;
  isDefault?: boolean;
}

export interface LearningGoal {
  dailyGoalMinutes: number;
  weeklyGoalMinutes: number;
  learnerMode?: LearnerMode;
  updatedAt?: string;
}

export interface ChildLearningControl {
  dailyLimitMinutes: number;
  rewardPointsEnabled: boolean;
  allowedSubjects: string[];
  parentPinSet?: boolean;
  messagePreview?: string;
  updatedAt?: string;
}

export interface LearningNote {
  _id: string;
  id?: string;
  sessionId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface LearningBreakdownItem {
  _id?: string;
  label?: string;
  key?: string;
  totalMinutes: number;
  sessionCount?: number;
  count?: number;
}

export interface LearningDailyBreakdownItem {
  date: string;
  totalMinutes: number;
  completedSessions?: number;
  plannedSessions?: number;
}

export interface LearningStats {
  todayMinutes: number;
  weekMinutes: number;
  monthMinutes: number;
  totalMinutes: number;
  completedSessions: number;
  activeSessions: number;
  plannedSessions: number;
  missedSessions: number;
  completionRate: number;
  currentStreak: number;
  longestStreak: number;
  averageSessionMinutes: number;
  subjectBreakdown: LearningBreakdownItem[];
  dailyBreakdown: LearningDailyBreakdownItem[];
  learningTypeBreakdown: LearningBreakdownItem[];
  priorityBreakdown: LearningBreakdownItem[];
}

export interface LearningSubjectStat {
  _id: string;
  totalMinutes: number;
  sessionCount: number;
}

export interface LearningSummary extends LearningStats {
  totalSessions: number;
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
  learnerMode?: LearnerMode | "";
  studyDate?: string;
  fromDate?: string;
  toDate?: string;
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
  goal: string;
  plannedMinutes: number;
  studyDate: string;
  date?: string;
  learnerMode: LearnerMode;
  learningType: LearningType;
  difficulty: LearningDifficulty;
  priority: LearningPriority;
  tags?: string[];
  notes?: string;
}

export interface UpdateLearningSessionRequest {
  title?: string;
  subject?: string;
  goal?: string;
  plannedMinutes?: number;
  actualMinutes?: number;
  studyDate?: string;
  date?: string;
  learnerMode?: LearnerMode;
  learningType?: LearningType;
  difficulty?: LearningDifficulty;
  priority?: LearningPriority;
  tags?: string[];
  notes?: string;
  status?: LearningSessionStatus;
  startedAt?: string | null;
  completedAt?: string | null;
}

export interface LearningApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
  errors?: unknown[];
}
