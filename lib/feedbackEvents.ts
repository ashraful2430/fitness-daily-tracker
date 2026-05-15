import type { PlayFeedbackOptions } from "@/types/feedback";

export const FEEDBACK_EFFECT_EVENT = "planify:feedback-effect";
const PENDING_FEEDBACK_EFFECT_KEY = "planify:pending-feedback-effect";

export function emitFeedbackEffect(
  key: string,
  options?: PlayFeedbackOptions,
) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(FEEDBACK_EFFECT_EVENT, {
      detail: { key, options },
    }),
  );
}

export function queueFeedbackEffect(key: string) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(PENDING_FEEDBACK_EFFECT_KEY, key);
}

export function consumeQueuedFeedbackEffect() {
  if (typeof window === "undefined") return null;
  const key = window.sessionStorage.getItem(PENDING_FEEDBACK_EFFECT_KEY);
  if (key) {
    window.sessionStorage.removeItem(PENDING_FEEDBACK_EFFECT_KEY);
  }
  return key;
}
