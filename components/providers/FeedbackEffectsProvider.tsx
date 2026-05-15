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
  const [preview, setPreview] = useState<FeedbackEffect | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previewTimerRef = useRef<number | null>(null);

  const playResolvedEffect = useCallback(async (effect: FeedbackEffect) => {
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
      setPreview(effect);

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

      return playResolvedEffect(effect);
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
        <div className="fixed right-4 top-4 z-[70] w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-3xl border border-white/20 bg-slate-950/95 text-white shadow-[0_24px_80px_rgba(0,0,0,0.36)] backdrop-blur-xl">
          <div className="flex items-start gap-3 p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview.memeImageUrl}
              alt=""
              className="h-20 w-20 shrink-0 rounded-2xl object-cover"
            />
            <div className="min-w-0 flex-1 py-1">
              <p className="truncate text-sm font-black">
                {preview.label || "Action completed"}
              </p>
              <p className="mt-1 line-clamp-2 text-xs font-semibold text-slate-300">
                {preview.description || "Custom admin reaction"}
              </p>
              <p className="mt-2 truncate text-[0.65rem] font-black uppercase tracking-[0.16em] text-cyan-200">
                {getEffectId(preview)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPreview(null)}
              className="rounded-full bg-white/10 p-1.5 text-white transition hover:bg-white/20"
              aria-label="Dismiss feedback preview"
            >
              <X size={15} />
            </button>
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
