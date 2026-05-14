import type {
  ChildLearningControl,
  CreateLearningSessionRequest,
  LearningApiEnvelope,
  LearningGoal,
  LearningNote,
  LearningPagination,
  LearningSession,
  LearningSessionsQuery,
  LearningSessionsResponse,
  LearningStats,
  LearningTemplate,
  TimerPreset,
  UpdateLearningSessionRequest,
} from "@/types/learning";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
const LEARNING_BASE = "/api/learning";

type RequestOptions = RequestInit & { silent?: boolean };

export class LearningApiError extends Error {
  status: number;
  errors?: unknown[];

  constructor(message: string, status: number, errors?: unknown[]) {
    super(message);
    this.name = "LearningApiError";
    this.status = status;
    this.errors = errors;
  }
}

function buildQuery(params: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") query.set(key, String(value));
  });
  const search = query.toString();
  return search ? `?${search}` : "";
}

async function learningRequest<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${LEARNING_BASE}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  const body = (await response.json().catch(() => null)) as
    | LearningApiEnvelope<T>
    | null;

  if (!response.ok || body?.success === false) {
    throw new LearningApiError(
      body?.message ?? "Learning request failed",
      response.status,
      body?.errors,
    );
  }

  return (body?.data ?? (body as T)) as T;
}

function normalizeSession(session: LearningSession): LearningSession {
  return {
    ...session,
    _id: session._id ?? session.id ?? "",
    actualMinutes: session.actualMinutes ?? 0,
    tags: session.tags ?? [],
    date: session.date ?? session.studyDate,
    studyDate: session.studyDate ?? session.date,
  };
}

function normalizePagination(
  meta: Partial<LearningPagination> | undefined,
  fallbackLength: number,
): LearningPagination {
  return {
    page: meta?.page ?? 1,
    limit: meta?.limit ?? 10,
    total: meta?.total ?? fallbackLength,
    totalPages: meta?.totalPages ?? 1,
  };
}

export const defaultTimerPresets: TimerPreset[] = [1, 2, 5, 10, 15, 25, 45, 60, 90].map(
  (minutes) => ({ minutes, label: `${minutes} min`, isDefault: true }),
);

export const defaultLearningTemplates: LearningTemplate[] = [
  {
    name: "DSA Practice",
    title: "DSA practice block",
    subject: "Data Structures",
    goal: "Solve focused DSA problems and review mistakes.",
    plannedMinutes: 45,
    learnerMode: "student",
    learningType: "practice",
    difficulty: "medium",
    priority: "high",
    tags: ["dsa", "practice"],
    notes: "Pick 2-3 problems, write clean solutions, then summarize patterns.",
    isDefault: true,
  },
  {
    name: "IELTS Speaking Practice",
    title: "IELTS speaking practice",
    subject: "IELTS",
    goal: "Improve fluency, vocabulary, and answer structure.",
    plannedMinutes: 25,
    learnerMode: "student",
    learningType: "practice",
    difficulty: "medium",
    priority: "medium",
    tags: ["ielts", "speaking"],
    notes: "Record answers for Part 2 and review pronunciation.",
    isDefault: true,
  },
  {
    name: "AWS Certification Study",
    title: "AWS certification study",
    subject: "Cloud",
    goal: "Study one exam domain and test recall.",
    plannedMinutes: 60,
    learnerMode: "job_holder",
    learningType: "course",
    difficulty: "hard",
    priority: "high",
    tags: ["aws", "certification"],
    notes: "Watch lesson, write service notes, and answer practice questions.",
    isDefault: true,
  },
  {
    name: "School Homework",
    title: "School homework",
    subject: "School",
    goal: "Complete assigned work carefully.",
    plannedMinutes: 30,
    learnerMode: "child",
    learningType: "assignment",
    difficulty: "easy",
    priority: "medium",
    tags: ["homework"],
    notes: "Break homework into small steps and check answers.",
    isDefault: true,
  },
  {
    name: "Book Reading",
    title: "Book reading",
    subject: "Reading",
    goal: "Read with attention and capture useful ideas.",
    plannedMinutes: 25,
    learnerMode: "self_learner",
    learningType: "reading",
    difficulty: "easy",
    priority: "medium",
    tags: ["book"],
    notes: "Read one chapter and write three takeaways.",
    isDefault: true,
  },
  {
    name: "Office Skill Learning",
    title: "Office skill learning",
    subject: "Professional Skills",
    goal: "Learn one practical work skill.",
    plannedMinutes: 45,
    learnerMode: "job_holder",
    learningType: "video",
    difficulty: "medium",
    priority: "high",
    tags: ["office", "skill"],
    notes: "Follow a tutorial and apply it to a work example.",
    isDefault: true,
  },
  {
    name: "Language Learning",
    title: "Language learning",
    subject: "Language",
    goal: "Practice vocabulary, listening, and speaking.",
    plannedMinutes: 20,
    learnerMode: "self_learner",
    learningType: "practice",
    difficulty: "medium",
    priority: "medium",
    tags: ["language"],
    notes: "Review vocabulary, listen once, then speak aloud.",
    isDefault: true,
  },
  {
    name: "Exam Revision",
    title: "Exam revision",
    subject: "Exam Prep",
    goal: "Revise important topics and weak areas.",
    plannedMinutes: 60,
    learnerMode: "student",
    learningType: "exam_prep",
    difficulty: "hard",
    priority: "high",
    tags: ["exam", "revision"],
    notes: "Revise notes, solve past questions, and mark weak topics.",
    isDefault: true,
  },
];

export const learningQueryKeys = {
  sessions: (filters: LearningSessionsQuery) => ["learningSessions", filters] as const,
  stats: ["learningStats"] as const,
  presets: ["learningPresets"] as const,
  templates: ["learningTemplates"] as const,
  goals: ["learningGoals"] as const,
  childControls: ["childControls"] as const,
  notes: (sessionId: string) => ["sessionNotes", sessionId] as const,
};

export async function getLearningSessions(
  filters: LearningSessionsQuery,
): Promise<LearningSessionsResponse> {
  const query = buildQuery({
    status: filters.status,
    subject: filters.subject,
    learnerMode: filters.learnerMode,
    studyDate: filters.studyDate,
    fromDate: filters.fromDate ?? filters.startDate,
    toDate: filters.toDate ?? filters.endDate,
    page: filters.page,
    limit: filters.limit,
  });
  const data = await learningRequest<
    LearningSession[] | { data?: LearningSession[]; pagination?: LearningPagination; meta?: LearningPagination }
  >(`/sessions${query}`);
  const sessions = Array.isArray(data) ? data : data.data ?? [];
  const pagination = Array.isArray(data)
    ? normalizePagination(undefined, data.length)
    : normalizePagination(data.pagination ?? data.meta, sessions.length);
  return {
    data: sessions.map(normalizeSession),
    pagination,
  };
}

export const getLearningSession = (id: string) =>
  learningRequest<LearningSession>(`/sessions/${id}`).then(normalizeSession);

export const createLearningSession = (payload: CreateLearningSessionRequest) =>
  learningRequest<LearningSession>("/sessions", {
    method: "POST",
    body: JSON.stringify(payload),
  }).then(normalizeSession);

export const updateLearningSession = (
  id: string,
  payload: UpdateLearningSessionRequest,
) =>
  learningRequest<LearningSession>(`/sessions/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  }).then(normalizeSession);

export const deleteLearningSession = (id: string) =>
  learningRequest<void>(`/sessions/${id}`, { method: "DELETE" });

export const startLearningSession = (id: string) =>
  learningRequest<LearningSession>(`/sessions/${id}/start`, { method: "POST" }).then(normalizeSession);

export const pauseLearningSession = (id: string) =>
  learningRequest<LearningSession>(`/sessions/${id}/pause`, { method: "POST" }).then(normalizeSession);

export const resumeLearningSession = (id: string) =>
  learningRequest<LearningSession>(`/sessions/${id}/resume`, { method: "POST" }).then(normalizeSession);

export const completeLearningSession = (id: string, actualMinutes?: number) =>
  learningRequest<LearningSession>(`/sessions/${id}/complete`, {
    method: "POST",
    body: JSON.stringify(actualMinutes !== undefined ? { actualMinutes } : {}),
  }).then(normalizeSession);

export const cancelLearningSession = (id: string) =>
  learningRequest<LearningSession>(`/sessions/${id}/cancel`, { method: "POST" }).then(normalizeSession);

export const rescheduleLearningSession = (id: string, studyDate: string) =>
  learningRequest<LearningSession>(`/sessions/${id}/reschedule`, {
    method: "POST",
    body: JSON.stringify({ studyDate }),
  }).then(normalizeSession);

export const getTimerPresets = async () => {
  const presets = await learningRequest<TimerPreset[]>("/timer-presets").catch(
    () => defaultTimerPresets,
  );
  return presets.length ? presets : defaultTimerPresets;
};

export const createTimerPreset = (payload: Pick<TimerPreset, "label" | "minutes">) =>
  learningRequest<TimerPreset>("/timer-presets", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const saveTimerPreset = createTimerPreset;

export const updateTimerPreset = (
  id: string,
  payload: Partial<Pick<TimerPreset, "label" | "minutes">>,
) =>
  learningRequest<TimerPreset>(`/timer-presets/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const deleteTimerPreset = (id: string) =>
  learningRequest<void>(`/timer-presets/${id}`, { method: "DELETE" });

export const getLearningTemplates = async () => {
  const templates = await learningRequest<LearningTemplate[]>("/templates").catch(
    () => defaultLearningTemplates,
  );
  return templates.length ? templates : defaultLearningTemplates;
};

export const createLearningTemplate = (payload: LearningTemplate) =>
  learningRequest<LearningTemplate>("/templates", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const getLearningGoals = () =>
  learningRequest<LearningGoal>("/goals").catch(() => ({
    dailyGoalMinutes: 60,
    weeklyGoalMinutes: 300,
  }));

export const updateLearningGoals = (payload: LearningGoal) =>
  learningRequest<LearningGoal>("/goals", {
    method: "PUT",
    body: JSON.stringify(payload),
  });

export const getLearningStats = () =>
  learningRequest<LearningStats>("/stats").catch(() => ({
    todayMinutes: 0,
    weekMinutes: 0,
    monthMinutes: 0,
    totalMinutes: 0,
    completedSessions: 0,
    activeSessions: 0,
    plannedSessions: 0,
    missedSessions: 0,
    completionRate: 0,
    currentStreak: 0,
    longestStreak: 0,
    averageSessionMinutes: 0,
    subjectBreakdown: [],
    dailyBreakdown: [],
    learningTypeBreakdown: [],
    priorityBreakdown: [],
  }));

export const getChildControls = () =>
  learningRequest<ChildLearningControl>("/child-controls").catch(() => ({
    dailyLimitMinutes: 45,
    rewardPointsEnabled: true,
    allowedSubjects: [],
    parentPinSet: false,
    messagePreview: "",
  }));

export const updateChildControls = (payload: ChildLearningControl & { parentPin?: string }) =>
  learningRequest<ChildLearningControl>("/child-controls", {
    method: "PUT",
    body: JSON.stringify(payload),
  });

export const getSessionNotes = (sessionId: string) =>
  learningRequest<LearningNote[]>(`/sessions/${sessionId}/notes`).catch(() => []);

export const createSessionNote = (sessionId: string, content: string) =>
  learningRequest<LearningNote>(`/sessions/${sessionId}/notes`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });

export const updateSessionNote = (noteId: string, content: string) =>
  learningRequest<LearningNote>(`/notes/${noteId}`, {
    method: "PATCH",
    body: JSON.stringify({ content }),
  });

export const deleteSessionNote = (noteId: string) =>
  learningRequest<void>(`/notes/${noteId}`, { method: "DELETE" });
