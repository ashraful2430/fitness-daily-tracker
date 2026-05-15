"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  consumeQueuedFeedbackEffect,
  FEEDBACK_EFFECT_EVENT,
} from "@/lib/feedbackEvents";
import type { FeedbackEffect, PlayFeedbackOptions } from "@/types/feedback";

interface FeedbackEventDetail {
  key: string;
  options?: PlayFeedbackOptions;
}

interface FeedbackPreview {
  effect: FeedbackEffect;
  message?: string;
}

interface FeedbackEffectsContextValue {
  effectsByKey: Record<string, FeedbackEffect>;
  loading: boolean;
  refreshEffects: () => Promise<void>;
  playFeedbackEffect: (
    eventKey: string,
    options?: PlayFeedbackOptions,
  ) => Promise<boolean>;
}

const FeedbackEffectsContext =
  createContext<FeedbackEffectsContextValue | undefined>(undefined);

function isSuccessKey(key: string) {
  return key.endsWith(".success");
}

function isErrorKey(key: string) {
  return key.endsWith(".error");
}

function getEffectId(effect: FeedbackEffect) {
  return effect.id ?? effect._id ?? effect.key;
}

function getFallbackKey(key: string) {
  if (isSuccessKey(key)) return "generic.success";
  if (isErrorKey(key)) return "generic.error";
  return null;
}

function resolveEffect(
  effects: Record<string, FeedbackEffect>,
  eventKey: string,
) {
  const fallbackKey = getFallbackKey(eventKey);
  return effects[eventKey] ?? (fallbackKey ? effects[fallbackKey] : null);
}

function getReactionCopy(effect: FeedbackEffect, message?: string) {
  const successCopy: Record<string, { title: string; message: string }> = {
    "auth.login.success": {
      title: "Welcome back, baby",
      message: "You are in. Now go make the dashboard jealous.",
    },
    "auth.register.success": {
      title: "Account born gorgeous",
      message: "Fresh profile, fresh power move. Let us build.",
    },
    "auth.logout.success": {
      title: "Logged out smooth",
      message: "Exit clean, comeback dangerous.",
    },
    "generic.success": {
      title: "Done like a boss",
      message: "Clean move. The system felt that one.",
    },
  };
  const errorCopy: Record<string, { title: string; message: string }> = {
    "generic.error": {
      title: "Not today, baby",
      message: "Fix the move and run it back stronger.",
    },
  };

  const fallback = isErrorKey(effect.key)
    ? errorCopy["generic.error"]
    : successCopy["generic.success"];
  const copy = successCopy[effect.key] ?? errorCopy[effect.key] ?? fallback;

  return {
    title: message?.trim() || copy.title,
    message: effect.description?.trim() || copy.message,
  };
}

export function FeedbackEffectsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [effectsByKey, setEffectsByKey] = useState<
    Record<string, FeedbackEffect>
  >({});
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<FeedbackPreview | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previewTimerRef = useRef<number | null>(null);

  const playResolvedEffect = useCallback(async (
    effect: FeedbackEffect,
    options?: PlayFeedbackOptions,
  ) => {
    if (!effect.enabled) return false;

    if (effect.soundUrl) {
      try {
        audioRef.current?.pause();
        const audio = new Audio(effect.soundUrl);
        audioRef.current = audio;
        await audio.play().catch(() => undefined);
      } catch {
        // Feedback is decorative. Never block the user flow for audio errors.
      }
    }

    if (effect.memeImageUrl) {
      setPreview({ effect, message: options?.message });

      if (previewTimerRef.current) {
        window.clearTimeout(previewTimerRef.current);
      }

      previewTimerRef.current = window.setTimeout(() => {
        setPreview(null);
      }, 4200);
    }

    return true;
  }, []);

  const refreshEffects = useCallback(async () => {
    if (!isAuthenticated) {
      setEffectsByKey({});
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/feedback-effects", {
        credentials: "include",
        cache: "no-store",
      });
      const body = (await response.json().catch(() => null)) as {
        data?: FeedbackEffect[];
      } | null;

      if (!response.ok) return;

      const nextEffects = (body?.data ?? []).reduce<
        Record<string, FeedbackEffect>
      >((acc, effect) => {
        if (effect?.key && effect.enabled) {
          acc[effect.key] = effect;
        }
        return acc;
      }, {});

      setEffectsByKey(nextEffects);

      const queuedKey = consumeQueuedFeedbackEffect();
      if (queuedKey) {
        const queuedEffect = resolveEffect(nextEffects, queuedKey);
        if (queuedEffect) {
          window.setTimeout(() => {
            void playResolvedEffect(queuedEffect);
          }, 120);
        }
      }
    } catch {
      setEffectsByKey({});
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, playResolvedEffect]);

  useEffect(() => {
    if (authLoading) return;
    const timer = window.setTimeout(() => {
      void refreshEffects();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [authLoading, refreshEffects]);

  const playFeedbackEffect = useCallback(
    async (eventKey: string, options?: PlayFeedbackOptions) => {
      const effect = resolveEffect(effectsByKey, eventKey);

      if (!effect || !effect.enabled) {
        options?.fallback?.();
        return false;
      }

      return playResolvedEffect(effect, options);
    },
    [effectsByKey, playResolvedEffect],
  );

  useEffect(() => {
    function handleFeedbackEvent(event: Event) {
      const customEvent = event as CustomEvent<FeedbackEventDetail>;
      if (!customEvent.detail?.key) return;
      void playFeedbackEffect(
        customEvent.detail.key,
        customEvent.detail.options,
      );
    }

    window.addEventListener(FEEDBACK_EFFECT_EVENT, handleFeedbackEvent);

    return () => {
      window.removeEventListener(FEEDBACK_EFFECT_EVENT, handleFeedbackEvent);
    };
  }, [playFeedbackEffect]);

  useEffect(
    () => () => {
      if (previewTimerRef.current) {
        window.clearTimeout(previewTimerRef.current);
      }
      audioRef.current?.pause();
    },
    [],
  );

  const value = useMemo<FeedbackEffectsContextValue>(
    () => ({
      effectsByKey,
      loading,
      refreshEffects,
      playFeedbackEffect,
    }),
    [effectsByKey, loading, playFeedbackEffect, refreshEffects],
  );

  return (
    <FeedbackEffectsContext.Provider value={value}>
      {children}

      {preview ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm">
          <div className="relative w-[min(34rem,calc(100vw-2rem))] overflow-hidden rounded-[1.75rem] border border-white/20 bg-slate-950/95 text-center text-white shadow-[0_32px_110px_rgba(0,0,0,0.5)]">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-fuchsia-400 via-cyan-300 to-emerald-300" />
            <button
              type="button"
              onClick={() => setPreview(null)}
              className="absolute right-3 top-3 z-10 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
              aria-label="Dismiss feedback preview"
            >
              <X size={17} />
            </button>

            <div className="p-4 pt-5 sm:p-5 sm:pt-6">
              <div className="mx-auto aspect-[4/3] w-full max-w-[24rem] overflow-hidden rounded-[1.35rem] border border-white/10 bg-white/5 shadow-[0_18px_50px_rgba(0,0,0,0.32)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview.effect.memeImageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>

              <p className="mt-5 text-2xl font-black tracking-normal sm:text-3xl">
                {getReactionCopy(preview.effect, preview.message).title}
              </p>
              <p className="mx-auto mt-2 max-w-md text-sm font-bold leading-6 text-slate-300 sm:text-base">
                {getReactionCopy(preview.effect, preview.message).message}
              </p>
              <p className="mt-4 truncate text-[0.65rem] font-black uppercase tracking-[0.18em] text-cyan-200">
                {preview.effect.label || getEffectId(preview.effect)}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </FeedbackEffectsContext.Provider>
  );
}

export function useFeedbackEffects() {
  const context = useContext(FeedbackEffectsContext);

  if (!context) {
    throw new Error(
      "useFeedbackEffects must be used inside FeedbackEffectsProvider",
    );
  }

  return context;
}
