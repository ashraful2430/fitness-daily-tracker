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
  requestedKey?: string;
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

const FeedbackEffectsContext = createContext<
  FeedbackEffectsContextValue | undefined
>(undefined);

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

function getReactionCopy(
  effect: FeedbackEffect,
  message?: string,
  requestedKey?: string,
) {
  const key = requestedKey ?? effect.key;
  const successCopy: Record<string, { title: string; message: string }> = {
    "auth.login.success": {
      title: "Welcome back, baby 🥵",
      message: "You are in now 😏. Now go make the dashboard jealous.",
    },
    "auth.register.success": {
      title: "Welcome to the playground, baby 🥵",
      message: "You are in now 😏. Explore the dashboard and make it your own.",
    },
    "auth.logout.success": {
      title: "Done leave me baby... 🥵",
      message:
        "Come to mommy when you miss me, I will be waiting with open arms and a fresh cup of tea with my milk 😏",
    },

    "dashboard.water.update.success": {
      title: "Hydrated and dangerous 💧😏",
      message:
        "Water logged. Your cells stood up, clapped, and called you fine.",
    },
    "dashboard.focus.create.success": {
      title: "Focus mode activated 🎯🔥",
      message:
        "Distractions got blocked at the door. They looked desperate anyway.",
    },
    "dashboard.weekly-goal.update.success": {
      title: "Weekly goal upgraded 📈😌",
      message: "New target locked. Now make the week sweat a little.",
    },
    "dashboard.weekly-stats.update.success": {
      title: "Stats looking spicy 📊🥵",
      message: "Progress updated. The numbers are flirting back now.",
    },

    "money.category.create.success": {
      title: "Category created 💸✨",
      message: "Money got a new lane. Budget chaos is losing confidence.",
    },
    "money.category.delete.success": {
      title: "Category removed 🗑️😎",
      message: "Cleaned it up. That category had no business being that loud.",
    },
    "money.expense.create.success": {
      title: "Expense logged 🧾👀",
      message: "Spending recorded. Your wallet tried to hide, cute attempt.",
    },
    "money.expense.update.success": {
      title: "Expense corrected ✍️💅",
      message: "Fixed the numbers. The budget got humbled in public.",
    },
    "money.expense.delete.success": {
      title: "Expense deleted 🗑️💸",
      message: "Gone. Your wallet got one tiny breath of peace.",
    },
    "money.salary.create.success": {
      title: "Salary added 💰😏",
      message:
        "Income entered. The dashboard suddenly started acting interested.",
    },
    "money.salary.delete.success": {
      title: "Salary removed 🧹💸",
      message: "Salary record gone. Clean books, clean moves, no drama.",
    },
    "money.balance.create.success": {
      title: "Balance added 🏦✨",
      message: "Fresh balance saved. Financial glow-up loading.",
    },
    "money.balance.update.success": {
      title: "Balance updated 🔄💰",
      message: "Numbers refreshed. Your money map got sharper and cuter.",
    },
    "money.balance.delete.success": {
      title: "Balance deleted 🗑️🏦",
      message: "Removed cleanly. That account left without making a scene.",
    },
    "money.income.create.success": {
      title: "Income logged 💵🔥",
      message: "Money came in. We love a productive entrance.",
    },
    "money.savings.create.success": {
      title: "Savings stacked 🐷💰",
      message: "Future you is blushing and pretending to stay professional.",
    },
    "money.loan.create.success": {
      title: "Loan recorded 📌💸",
      message: "Debt tracked. Now it cannot act mysterious anymore.",
    },
    "money.loan.repay.success": {
      title: "Repayment landed ✅💥",
      message: "Debt got punched in the balance sheet. Beautiful behavior.",
    },
    "money.loan.delete.success": {
      title: "Loan deleted 🗑️😎",
      message: "That loan left the chat. Savage cleanup.",
    },

    "lending.loan.create.success": {
      title: "Loan created 🤝💸",
      message: "Borrowing tracked. The paper trail is looking expensive.",
    },
    "lending.loan.repay.success": {
      title: "Loan repaid ✅🔥",
      message:
        "Repayment handled. Responsibility looks dangerously good on you.",
    },
    "lending.loan.delete.success": {
      title: "Loan erased 🧹😌",
      message: "Gone from the list. Clean slate energy, no tears.",
    },
    "lending.lending.create.success": {
      title: "Lending added 💸👀",
      message: "You gave money a mission. Now the tracker is watching.",
    },
    "lending.lending.repay.success": {
      title: "Money came back 💰😏",
      message: "Repayment received. Love when the plot pays off.",
    },
    "lending.lending.delete.success": {
      title: "Lending removed 🗑️🤝",
      message: "Record deleted. That deal lost screen time.",
    },

    "learning.session.create.success": {
      title: "Study session born 📚🔥",
      message: "Brain gains scheduled. Knowledge better behave.",
    },
    "learning.session.update.success": {
      title: "Session tuned ✍️😏",
      message: "Updated cleanly. The study plan got prettier.",
    },
    "learning.session.delete.success": {
      title: "Session deleted 🗑️📚",
      message: "Removed. That study block did not survive the edit.",
    },
    "learning.session.start.success": {
      title: "Study started 🎯🧠",
      message: "Focus locked. Time to make your brain expensive.",
    },
    "learning.session.pause.success": {
      title: "Paused with style ⏸️😌",
      message:
        "Quick breather approved. Do not let momentum get too comfortable.",
    },
    "learning.session.resume.success": {
      title: "Back to work ▶️🔥",
      message: "Resumed. The comeback is louder than the pause.",
    },
    "learning.session.complete.success": {
      title: "Session complete ✅🧠",
      message: "Brain cooked, goal served. That was a clean finish.",
    },
    "learning.session.cancel.success": {
      title: "Session cancelled 🚫📚",
      message: "Cancelled cleanly. Sometimes the power move is rescheduling.",
    },
    "learning.session.reschedule.success": {
      title: "Session moved 📅😏",
      message: "Rescheduled. The plan bent, but it did not break.",
    },
    "learning.timer.finish.success": {
      title: "Timer finished ⏰🔥",
      message: "Time is up. Your focus dropped the mic and walked away.",
    },
    "learning.timer-preset.create.success": {
      title: "Preset created ⏱️✨",
      message: "New timer saved. Future focus got one-tap pretty.",
    },
    "learning.timer-preset.update.success": {
      title: "Preset updated 🔄⏱️",
      message: "Preset tuned. Efficiency is acting cute today.",
    },
    "learning.timer-preset.delete.success": {
      title: "Preset deleted 🗑️⏱️",
      message: "Removed. That timer setting had its last dance.",
    },
    "learning.template.create.success": {
      title: "Template created 🧩🔥",
      message: "Reusable greatness saved. Future you just won.",
    },
    "learning.goals.update.success": {
      title: "Goals updated 🎯💅",
      message: "Targets refreshed. Now make the progress bar blush.",
    },
    "learning.child-controls.update.success": {
      title: "Controls saved 🛡️✨",
      message: "Boundaries locked. Responsible and still stylish.",
    },
    "learning.note.create.success": {
      title: "Note created 📝😌",
      message: "Thought captured. Your brain left a receipt.",
    },
    "learning.note.update.success": {
      title: "Note polished ✍️✨",
      message: "Updated. That note got smarter and a little prettier.",
    },
    "learning.note.delete.success": {
      title: "Note deleted 🗑️📝",
      message: "Cleared out. Mental clutter got handled.",
    },

    "fitness.workout.create.success": {
      title: "Workout added 💪🔥",
      message: "Movement logged. Your excuses are sweating.",
    },
    "fitness.workout.update.success": {
      title: "Workout updated 🏋️😏",
      message: "Training record tuned. Gains love accuracy.",
    },
    "fitness.workout.delete.success": {
      title: "Workout deleted 🗑️💪",
      message: "Removed cleanly. The tracker forgives, but it remembers.",
    },

    "habits.section.create.success": {
      title: "Habit section added 🧱✨",
      message: "New routine lane opened. Discipline got organized.",
    },
    "habits.section.update.success": {
      title: "Habit section updated 🔄😌",
      message: "Routine refined. Consistency is getting dangerous.",
    },
    "habits.section.delete.success": {
      title: "Habit section deleted 🗑️🧱",
      message: "Gone. Your habit board got leaner and meaner.",
    },
    "habits.section.progress.update.success": {
      title: "Progress updated ✅🔥",
      message: "Step logged. Tiny win, loud energy.",
    },

    "admin.user.role.update.success": {
      title: "Role updated 👑😏",
      message: "Permissions changed. Admin power used with style.",
    },
    "admin.user.block.update.success": {
      title: "User status handled 🚧👀",
      message: "Access updated. The gatekeeper did not miss.",
    },
    "admin.feedback-effect.create.success": {
      title: "Reaction saved 🎭🔥",
      message: "New effect loaded. The app has more attitude now.",
    },
    "admin.feedback-effect.update.success": {
      title: "Reaction updated 🔄🎭",
      message: "Effect tuned. Meme energy successfully upgraded.",
    },
    "admin.feedback-effect.delete.success": {
      title: "Reaction deleted 🗑️🎭",
      message: "Removed. That effect had a good run.",
    },
    "admin.feedback-effect.upload.success": {
      title: "Asset uploaded 📤✨",
      message: "Fresh media ready. The reaction vault is eating good.",
    },

    "generic.success": {
      title: "Well played, baby 🥵",
      message: "You nailed it. The app is impressed and trying to act normal.",
    },
  };
  const errorCopy: Record<string, { title: string; message: string }> = {
    "auth.login.error": {
      title: "Login got humbled 😬🚪",
      message:
        "That entry missed. Check the details and walk back in sharper, baby.",
    },
    "auth.register.error": {
      title: "Signup tripped 😵‍💫📝",
      message: "Almost there. Fix the details and make that entrance again.",
    },
    "auth.logout.error": {
      title: "Logout got clingy 😮‍💨🚪",
      message:
        "The exit got messy. Try again and leave like the main character.",
    },

    "dashboard.error": {
      title: "Dashboard said nope 📊😒",
      message: "Something slipped. Refresh the move and make it behave.",
    },
    "money.error": {
      title: "Money move blocked 💸🚫",
      message: "The numbers hated that one. Adjust it and hit back harder.",
    },
    "lending.error": {
      title: "Lending move flopped 🤝😬",
      message:
        "That record did not land. Tighten the details and try again, smooth operator.",
    },
    "learning.error": {
      title: "Study plan stumbled 📚😵‍💫",
      message:
        "Tiny setback. Fix the session and keep those brain gains flirting.",
    },
    "fitness.error": {
      title: "Workout move failed 💪😮‍💨",
      message: "No shame, just reps. Fix it and run the set again.",
    },
    "habits.error": {
      title: "Habit move missed 🧱😬",
      message:
        "Consistency blinked. Tap it back into place and act like it never happened.",
    },
    "admin.error": {
      title: "Admin move denied 👑🚫",
      message: "Power tool said pause. Check the setup and come back cleaner.",
    },
    "generic.error": {
      title: "Not today, baby 🥵🚫",
      message:
        "Something went sideways. Fix it, retry, and pretend this little drama never happened.",
    },
  };

  const categoryErrorKey = `${key.split(".")[0]}.error`;
  const fallback = isErrorKey(key)
    ? errorCopy["generic.error"]
    : successCopy["generic.success"];
  const copy =
    successCopy[key] ??
    errorCopy[key] ??
    errorCopy[categoryErrorKey] ??
    fallback;

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

  const playResolvedEffect = useCallback(
    async (
      effect: FeedbackEffect,
      options?: PlayFeedbackOptions,
      requestedKey?: string,
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
        setPreview({ effect, requestedKey, message: options?.message });

        if (previewTimerRef.current) {
          window.clearTimeout(previewTimerRef.current);
        }

        previewTimerRef.current = window.setTimeout(() => {
          setPreview(null);
        }, 4200);
      }

      return true;
    },
    [],
  );

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
            void playResolvedEffect(queuedEffect, undefined, queuedKey);
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

      return playResolvedEffect(effect, options, eventKey);
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
                {
                  getReactionCopy(
                    preview.effect,
                    preview.message,
                    preview.requestedKey,
                  ).title
                }
              </p>
              <p className="mx-auto mt-2 max-w-md text-sm font-bold leading-6 text-slate-300 sm:text-base">
                {
                  getReactionCopy(
                    preview.effect,
                    preview.message,
                    preview.requestedKey,
                  ).message
                }
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
