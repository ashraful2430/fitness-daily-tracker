export type FeedbackCategory =
  | "auth"
  | "dashboard"
  | "money"
  | "lending"
  | "learning"
  | "fitness"
  | "habits"
  | "admin"
  | "generic";

export interface FeedbackEffect {
  id?: string;
  _id?: string;
  key: string;
  label: string;
  category: FeedbackCategory;
  description?: string;
  soundUrl?: string;
  memeImageUrl?: string;
  enabled: boolean;
}

export interface FeedbackEffectInput {
  key: string;
  label: string;
  category: FeedbackCategory;
  description?: string;
  soundUrl?: string;
  memeImageUrl?: string;
  enabled: boolean;
}

export interface FeedbackUploadResponse {
  url: string;
  type: "sound" | "image";
  mimeType: string;
  size: number;
}

export interface PlayFeedbackOptions {
  fallback?: () => void;
  message?: string;
}
