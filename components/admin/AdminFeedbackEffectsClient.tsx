"use client";

import { useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  BellRing,
  CheckCircle2,
  Edit3,
  Filter,
  ImageIcon,
  Loader2,
  Play,
  Plus,
  RotateCcw,
  Save,
  Search,
  Trash2,
  Upload,
  Volume2,
} from "lucide-react";
import { adminAPI } from "@/lib/api";
import { useFeedbackEffects } from "@/components/providers/FeedbackEffectsProvider";
import type {
  FeedbackCategory,
  FeedbackEffect,
  FeedbackEffectInput,
} from "@/types/feedback";

const categories: Array<FeedbackCategory | "all"> = [
  "all",
  "auth",
  "dashboard",
  "money",
  "lending",
  "learning",
  "fitness",
  "habits",
  "admin",
  "generic",
];

const allowedSoundTypes = [
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
  "audio/mp4",
];
const allowedImageTypes = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const maxSoundUploadSize = 360 * 1024;
const maxImageUploadSize = 1.5 * 1024 * 1024;
const maxEffectPayloadSize = 850 * 1024;

const eventTemplates: FeedbackEffectInput[] = [
  ["auth.register.success", "Register success", "auth"],
  ["auth.login.success", "Login success", "auth"],
  ["auth.logout.success", "Logout success", "auth"],
  ["dashboard.water.update.success", "Water updated", "dashboard"],
  ["dashboard.focus.create.success", "Focus created", "dashboard"],
  ["dashboard.weekly-goal.update.success", "Weekly goal updated", "dashboard"],
  ["dashboard.weekly-stats.update.success", "Weekly stats updated", "dashboard"],
  ["money.category.create.success", "Money category created", "money"],
  ["money.category.delete.success", "Money category deleted", "money"],
  ["money.expense.create.success", "Expense created", "money"],
  ["money.expense.update.success", "Expense updated", "money"],
  ["money.expense.delete.success", "Expense deleted", "money"],
  ["money.salary.create.success", "Salary created", "money"],
  ["money.salary.delete.success", "Salary deleted", "money"],
  ["money.balance.create.success", "Balance created", "money"],
  ["money.balance.update.success", "Balance updated", "money"],
  ["money.balance.delete.success", "Balance deleted", "money"],
  ["money.income.create.success", "Income created", "money"],
  ["money.savings.create.success", "Savings created", "money"],
  ["money.loan.create.success", "Money loan created", "money"],
  ["money.loan.repay.success", "Money loan repaid", "money"],
  ["money.loan.delete.success", "Money loan deleted", "money"],
  ["lending.loan.create.success", "Loan created", "lending"],
  ["lending.loan.repay.success", "Loan repaid", "lending"],
  ["lending.loan.delete.success", "Loan deleted", "lending"],
  ["lending.lending.create.success", "Lending created", "lending"],
  ["lending.lending.repay.success", "Lending repaid", "lending"],
  ["lending.lending.delete.success", "Lending deleted", "lending"],
  ["learning.session.create.success", "Learning session created", "learning"],
  ["learning.session.update.success", "Learning session updated", "learning"],
  ["learning.session.delete.success", "Learning session deleted", "learning"],
  ["fitness.workout.create.success", "Workout created", "fitness"],
  ["fitness.workout.update.success", "Workout updated", "fitness"],
  ["fitness.workout.delete.success", "Workout deleted", "fitness"],
  ["fitness.template.create.success", "Fitness template created", "fitness"],
  ["fitness.template.update.success", "Fitness template updated", "fitness"],
  ["fitness.template.delete.success", "Fitness template deleted", "fitness"],
  ["fitness.recovery.create.success", "Recovery check created", "fitness"],
  ["fitness.recovery.update.success", "Recovery check updated", "fitness"],
  ["fitness.recovery.delete.success", "Recovery check deleted", "fitness"],
  ["habits.section.create.success", "Habit section created", "habits"],
  ["habits.section.update.success", "Habit section updated", "habits"],
  ["habits.section.delete.success", "Habit section deleted", "habits"],
  ["habits.section.progress.update.success", "Habit progress updated", "habits"],
  ["admin.user.role.update.success", "Admin role updated", "admin"],
  ["admin.user.block.update.success", "Admin block updated", "admin"],
  ["admin.feedback-effect.create.success", "Feedback effect created", "admin"],
  ["admin.feedback-effect.update.success", "Feedback effect updated", "admin"],
  ["admin.feedback-effect.delete.success", "Feedback effect deleted", "admin"],
  ["admin.feedback-effect.upload.success", "Feedback asset uploaded", "admin"],
  ["generic.success", "Generic success", "generic"],
  ["generic.error", "Generic error", "generic"],
].map(([key, label, category]) => ({
  key,
  label,
  category: category as FeedbackCategory,
  description: "",
  soundUrl: "",
  memeImageUrl: "",
  enabled: true,
}));

const visibleLearningEffectKeys = new Set([
  "learning.session.create.success",
  "learning.session.update.success",
  "learning.session.delete.success",
]);

const visibleFitnessEffectKeys = new Set([
  "fitness.workout.create.success",
  "fitness.workout.update.success",
  "fitness.workout.delete.success",
  "fitness.template.create.success",
  "fitness.template.update.success",
  "fitness.template.delete.success",
  "fitness.recovery.create.success",
  "fitness.recovery.update.success",
  "fitness.recovery.delete.success",
]);

function shouldShowEffect(effect: Pick<FeedbackEffect, "category" | "key">) {
  if (effect.category === "learning") {
    return visibleLearningEffectKeys.has(effect.key);
  }

  if (effect.category === "fitness") {
    return visibleFitnessEffectKeys.has(effect.key);
  }

  return true;
}

function getEffectId(effect: FeedbackEffect) {
  return effect.id ?? effect._id ?? "";
}

function emptyForm(): FeedbackEffectInput {
  return {
    key: "",
    label: "",
    category: "generic",
    description: "",
    soundUrl: "",
    memeImageUrl: "",
    enabled: true,
  };
}

function effectToForm(effect: FeedbackEffect): FeedbackEffectInput {
  return {
    key: effect.key,
    label: effect.label,
    category: effect.category,
    description: effect.description ?? "",
    soundUrl: effect.soundUrl ?? "",
    memeImageUrl: effect.memeImageUrl ?? "",
    enabled: effect.enabled,
  };
}

function validateForm(form: FeedbackEffectInput) {
  const errors: Record<string, string> = {};
  if (!form.key.trim()) errors.key = "Event key is required.";
  if (!/^[a-z0-9.-]+$/.test(form.key.trim())) {
    errors.key = "Use lowercase letters, numbers, dots, or hyphens.";
  }
  if (!form.label.trim()) errors.label = "Label is required.";
  if (!form.category) errors.category = "Category is required.";
  const payloadBytes = getEffectPayloadBytes(form);
  if (payloadBytes > maxEffectPayloadSize) {
    errors.payload =
      "This sound/image combo is too large to save. Use a shorter MP3 or a smaller image.";
  }
  return errors;
}

function getEffectPayloadBytes(form: FeedbackEffectInput) {
  return new Blob([
    JSON.stringify({
      soundUrl: form.soundUrl ?? "",
      memeImageUrl: form.memeImageUrl ?? "",
    }),
  ]).size;
}

function getUrlHint(value: string, type: "sound" | "image") {
  const url = value.trim().toLowerCase();
  if (!url) return "";

  if (url.includes("myinstants.com") && !url.includes("/media/sounds/")) {
    return "That MyInstants page/embed URL will not play here. Open the sound page, use Download MP3, then paste the direct /media/sounds/... file URL.";
  }

  if (url.includes("/embed/") || url.includes("<iframe")) {
    return "Embed codes are for iframes. This field needs a direct media URL or an uploaded asset.";
  }

  const directExtensions =
    type === "sound"
      ? [".mp3", ".wav", ".ogg", ".m4a", ".mp4"]
      : [".png", ".jpg", ".jpeg", ".webp", ".gif", ".avif"];
  const hasExtension = directExtensions.some((extension) =>
    url.split("?")[0].endsWith(extension),
  );
  const isDataOrBlob = url.startsWith("data:") || url.startsWith("blob:");

  if (!hasExtension && !isDataOrBlob) {
    return type === "sound"
      ? "Best result: paste a direct audio file URL ending in MP3, WAV, OGG, M4A, or MP4."
      : "Best result: paste a direct image file URL ending in PNG, JPG, WebP, GIF, or AVIF.";
  }

  return "";
}

function validateUpload(file: File) {
  const isSound = allowedSoundTypes.includes(file.type);
  const isImage = allowedImageTypes.includes(file.type);

  if (!isSound && !isImage) {
    return "Use MP3, WAV, OGG, MP4 audio or PNG, JPG, WebP, GIF images.";
  }

  if (isSound && file.size > maxSoundUploadSize) {
    return "Use a short compressed sound under 360 KB. Data URLs get bigger when saved.";
  }

  if (isImage && file.size > maxImageUploadSize) {
    return "Use an image under 1.5 MB. It will be compressed before saving.";
  }

  return "";
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }
      reject(new Error("Unable to read that asset."));
    };
    reader.onerror = () => {
      reject(reader.error ?? new Error("Unable to read that asset."));
    };
    reader.readAsDataURL(file);
  });
}

function loadImage(dataUrl: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Unable to process that image."));
    image.src = dataUrl;
  });
}

async function compressImageFile(file: File) {
  if (file.type === "image/gif") {
    return readFileAsDataUrl(file);
  }

  const dataUrl = await readFileAsDataUrl(file);
  const image = await loadImage(dataUrl);
  const maxSide = 720;
  const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) return dataUrl;
  context.drawImage(image, 0, 0, width, height);

  const qualities = [0.78, 0.68, 0.58, 0.48];
  let best = canvas.toDataURL("image/jpeg", qualities[0]);

  for (const quality of qualities) {
    const next = canvas.toDataURL("image/jpeg", quality);
    best = next;
    if (new Blob([next]).size <= 260 * 1024) break;
  }

  return best;
}

export default function AdminFeedbackEffectsClient() {
  const queryClient = useQueryClient();
  const { refreshEffects } = useFeedbackEffects();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number]>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FeedbackEffectInput>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const effectsQuery = useQuery({
    queryKey: ["admin", "feedback-effects"],
    queryFn: adminAPI.getFeedbackEffects,
  });

  const configuredEffects = useMemo(
    () => effectsQuery.data ?? [],
    [effectsQuery.data],
  );
  const configuredByKey = useMemo(
    () => new Map(configuredEffects.map((effect) => [effect.key, effect])),
    [configuredEffects],
  );

  const effects = useMemo(() => {
    const merged = new Map<string, FeedbackEffect>();

    eventTemplates.forEach((template) => {
      merged.set(template.key, {
        ...template,
        ...(configuredByKey.get(template.key) ?? {}),
      });
    });

    configuredEffects.forEach((effect) => {
      if (shouldShowEffect(effect)) {
        merged.set(effect.key, effect);
      }
    });

    return Array.from(merged.values()).sort((a, b) =>
      a.key.localeCompare(b.key),
    );
  }, [configuredByKey, configuredEffects]);

  const filteredEffects = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return effects.filter((effect) => {
      const matchesCategory = category === "all" || effect.category === category;
      const matchesQuery =
        !normalizedQuery ||
        effect.key.toLowerCase().includes(normalizedQuery) ||
        effect.label.toLowerCase().includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [category, effects, query]);

  const selectedEffect = editingId
    ? configuredEffects.find((effect) => getEffectId(effect) === editingId)
    : null;

  const saveMutation = useMutation({
    mutationFn: async (payload: FeedbackEffectInput) => {
      if (editingId) {
        return adminAPI.updateFeedbackEffect(editingId, payload);
      }
      return adminAPI.upsertFeedbackEffect(payload);
    },
    onSuccess: async () => {
      toast.success(editingId ? "Feedback effect updated" : "Feedback effect saved");
      await queryClient.invalidateQueries({ queryKey: ["admin", "feedback-effects"] });
      await refreshEffects();
      setEditingId(null);
      setForm(emptyForm());
      setErrors({});
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to save effect");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: adminAPI.deleteFeedbackEffect,
    onSuccess: async () => {
      toast.success("Feedback effect deleted");
      await queryClient.invalidateQueries({ queryKey: ["admin", "feedback-effects"] });
      await refreshEffects();
      setEditingId(null);
      setForm(emptyForm());
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to delete effect");
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const isSound = file.type.startsWith("audio/");
      const url = isSound
        ? await readFileAsDataUrl(file)
        : await compressImageFile(file);

      return {
        url,
        type: isSound ? "sound" : "image",
      };
    },
    onSuccess: (result) => {
      setForm((current) => ({
        ...current,
        soundUrl: result.type === "sound" ? result.url : current.soundUrl,
        memeImageUrl:
          result.type === "image" ? result.url : current.memeImageUrl,
      }));
      toast.success("Asset uploaded");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to upload asset");
    },
  });

  const startCreateFromTemplate = (effect: FeedbackEffect) => {
    const existingId = getEffectId(effect);
    setEditingId(existingId || null);
    setForm(effectToForm(effect));
    setErrors({});
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateForm(form);
    setErrors(nextErrors);
    if (nextErrors.payload) {
      toast.error(nextErrors.payload);
    }
    if (Object.keys(nextErrors).length > 0) return;
    saveMutation.mutate({
      ...form,
      key: form.key.trim(),
      label: form.label.trim(),
      description: form.description?.trim(),
      soundUrl: form.soundUrl?.trim(),
      memeImageUrl: form.memeImageUrl?.trim(),
    });
  };

  const handleUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const error = validateUpload(file);
    if (error) {
      toast.error(error);
      return;
    }

    uploadMutation.mutate(file);
  };

  const previewSound = () => {
    if (!form.soundUrl) {
      toast("Add a sound URL or upload an audio file first.");
      return;
    }

    const warning = getUrlHint(form.soundUrl, "sound");
    if (warning && form.soundUrl.toLowerCase().includes("myinstants.com")) {
      toast.error(warning);
      return;
    }

    try {
      void new Audio(form.soundUrl).play().catch(() => undefined);
    } catch {
      toast.error("Unable to preview that sound.");
    }
  };

  const configuredCount = configuredEffects.length;
  const enabledCount = configuredEffects.filter((effect) => effect.enabled).length;
  const soundUrlHint = getUrlHint(form.soundUrl ?? "", "sound");
  const imageUrlHint = getUrlHint(form.memeImageUrl ?? "", "image");

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-5 pb-10 text-slate-950 dark:bg-[#050914] dark:text-white sm:px-6 lg:px-8">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-5">
        <div className="overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white shadow-sm dark:border-white/[0.08] dark:bg-[#08101f]">
          <div className="h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500" />
          <div className="p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-cyan-700 dark:text-cyan-200">
                <BellRing size={14} />
                Admin
              </p>
              <h1 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">
                Feedback Effects Manager
              </h1>
              <p className="mt-2 max-w-2xl text-sm font-semibold text-slate-600 dark:text-slate-400">
                Configure optional global sounds and meme images for app actions.
                Missing effects keep the existing default experience.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:min-w-80">
              <Stat label="Available" value={effects.length.toString()} />
              <Stat label="Custom" value={configuredCount.toString()} />
              <Stat label="Enabled" value={enabledCount.toString()} />
            </div>
          </div>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_26rem]">
          <section className="rounded-[1.6rem] border border-slate-200 bg-white p-4 shadow-sm dark:border-white/[0.08] dark:bg-[#08101f] sm:p-5">
            <div className="flex flex-col gap-3">
              <label className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-white/[0.08] dark:bg-white/[0.04]">
                <Search size={18} className="text-slate-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search key or label"
                  className="min-w-0 flex-1 bg-transparent text-sm font-bold outline-none placeholder:text-slate-400"
                />
              </label>

              <div className="flex items-center gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-slate-50 p-2 [scrollbar-width:none] dark:border-white/[0.08] dark:bg-white/[0.035] [&::-webkit-scrollbar]:hidden">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm dark:bg-white/[0.06] dark:text-slate-300">
                  <Filter size={16} />
                </span>
                {categories.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCategory(item)}
                    className={`shrink-0 cursor-pointer rounded-xl border px-3.5 py-2 text-xs font-black capitalize transition ${
                      category === item
                        ? "border-cyan-400 bg-cyan-500 text-white shadow-[0_12px_28px_rgba(6,182,212,0.2)]"
                        : "border-transparent bg-white text-slate-600 hover:border-cyan-300 hover:text-cyan-700 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:text-cyan-200"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              {effectsQuery.isLoading ? (
                <div className="col-span-full flex justify-center rounded-2xl border border-slate-200 p-10 dark:border-white/[0.08]">
                  <Loader2 className="animate-spin text-cyan-500" />
                </div>
              ) : filteredEffects.map((effect) => {
                const id = getEffectId(effect);
                const isConfigured = Boolean(id);
                const isEditing =
                  (editingId && id === editingId) ||
                  (!editingId && form.key === effect.key);

                return (
                  <article
                    key={effect.key}
                    className={`rounded-2xl border p-4 transition ${
                      isEditing
                        ? "border-cyan-400 bg-cyan-500/10"
                        : "border-slate-200 bg-slate-50 hover:-translate-y-0.5 hover:bg-white dark:border-white/[0.08] dark:bg-white/[0.035] dark:hover:bg-white/[0.06]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black">
                          {effect.label}
                        </p>
                        <p className="mt-1 truncate text-xs font-semibold text-slate-500 dark:text-slate-400">
                          {effect.key}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <Badge
                          label={effect.category}
                          tone="cyan"
                        />
                        <Badge
                          label={effect.enabled ? "Enabled" : "Disabled"}
                          tone={effect.enabled ? "green" : "slate"}
                        />
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                      <span className="inline-flex items-center gap-1">
                        <Volume2 size={14} />
                        {effect.soundUrl ? "Sound" : "Default sound"}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <ImageIcon size={14} />
                        {effect.memeImageUrl ? "Meme" : "Default image"}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => startCreateFromTemplate(effect)}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-slate-950 px-3 py-2 text-xs font-black text-white transition hover:-translate-y-0.5 hover:bg-cyan-600 dark:bg-white dark:text-slate-950"
                      >
                        {isConfigured ? <Edit3 size={14} /> : <Plus size={14} />}
                        {isConfigured ? "Edit" : "Configure"}
                      </button>

                      {isConfigured ? (
                        <button
                          type="button"
                          onClick={() => deleteMutation.mutate(id)}
                          disabled={deleteMutation.isPending}
                          className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-rose-200 px-3 py-2 text-xs font-black text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-500/20 dark:text-rose-300 dark:hover:bg-rose-500/10"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <aside className="overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white shadow-sm dark:border-white/[0.08] dark:bg-[#08101f] xl:sticky xl:top-5 xl:max-h-[calc(100dvh-2.5rem)] xl:self-start">
            <form onSubmit={handleSubmit} className="flex max-h-[calc(100dvh-2.5rem)] flex-col xl:max-h-[calc(100dvh-2.5rem)]">
              <div className="shrink-0 border-b border-slate-200 bg-white/95 p-5 backdrop-blur dark:border-white/[0.08] dark:bg-[#08101f]/95">
                <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700 dark:text-cyan-300">
                    {editingId ? "Edit effect" : "Create/upsert"}
                  </p>
                  <h2 className="mt-2 text-xl font-black">
                    {form.label || "Feedback effect"}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setForm(emptyForm());
                    setErrors({});
                  }}
                  className="cursor-pointer rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:border-cyan-300 hover:text-cyan-600 dark:border-white/[0.08]"
                  aria-label="Reset form"
                >
                  <RotateCcw size={17} />
                </button>
              </div>
              </div>

              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5 pb-8 [scrollbar-width:thin]">
              <Field label="Event key" error={errors.key}>
                <input
                  value={form.key}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, key: event.target.value }))
                  }
                  placeholder="money.expense.create.success"
                  className={inputClass}
                />
              </Field>

              <Field label="Label" error={errors.label}>
                <input
                  value={form.label}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, label: event.target.value }))
                  }
                  placeholder="Expense created"
                  className={inputClass}
                />
              </Field>

              <Field label="Category" error={errors.category}>
                <select
                  value={form.category}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      category: event.target.value as FeedbackCategory,
                    }))
                  }
                  className={inputClass}
                >
                  {categories
                    .filter((item) => item !== "all")
                    .map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                </select>
              </Field>

              <Field label="Description">
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  rows={3}
                  placeholder="Optional note for this effect"
                  className={inputClass}
                />
              </Field>

              <Field label="Sound URL">
                <div className="flex gap-2">
                  <input
                    value={form.soundUrl}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        soundUrl: event.target.value,
                      }))
                    }
                    placeholder="https://..."
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={previewSound}
                    className="cursor-pointer rounded-2xl bg-cyan-500 px-3 text-white transition hover:bg-cyan-400"
                    aria-label="Preview sound"
                  >
                    <Play size={17} />
                  </button>
                </div>
                {soundUrlHint ? (
                  <p className="mt-2 text-xs font-semibold leading-5 text-amber-600 dark:text-amber-300">
                    {soundUrlHint}
                  </p>
                ) : null}
              </Field>

              <Field label="Meme image URL">
                <input
                  value={form.memeImageUrl}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      memeImageUrl: event.target.value,
                    }))
                  }
                  placeholder="https://..."
                  className={inputClass}
                />
                {imageUrlHint ? (
                  <p className="mt-2 text-xs font-semibold leading-5 text-amber-600 dark:text-amber-300">
                    {imageUrlHint}
                  </p>
                ) : null}
              </Field>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-black transition hover:border-cyan-300 hover:text-cyan-700 dark:border-white/[0.08] dark:bg-white/[0.04]">
                  {uploadMutation.isPending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Upload size={16} />
                  )}
                  Upload asset
                  <input
                    type="file"
                    accept={[...allowedSoundTypes, ...allowedImageTypes].join(",")}
                    onChange={handleUpload}
                    className="sr-only"
                  />
                </label>

                <button
                  type="button"
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      enabled: !current.enabled,
                    }))
                  }
                  className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black transition ${
                    form.enabled
                      ? "cursor-pointer bg-emerald-500 text-white hover:bg-emerald-400"
                      : "cursor-pointer bg-slate-200 text-slate-600 hover:bg-slate-300 dark:bg-white/10 dark:text-slate-300"
                  }`}
                >
                  <CheckCircle2 size={16} />
                  {form.enabled ? "Enabled" : "Disabled"}
                </button>
              </div>

              <p className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-xs font-bold leading-5 text-cyan-800 dark:text-cyan-200">
                Upload fills the URL field automatically. Click{" "}
                <span className="font-black">
                  {editingId ? "Update effect" : "Save effect"}
                </span>{" "}
                after uploading so every user gets it. For bigger sounds or images,
                upload them to a media host and paste the direct URL above.
              </p>

              {errors.payload ? (
                <p className="rounded-2xl border border-rose-500/25 bg-rose-500/10 px-3 py-2 text-xs font-bold leading-5 text-rose-600 dark:text-rose-200">
                  {errors.payload}
                </p>
              ) : null}

              {form.memeImageUrl ? (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 dark:border-white/[0.08]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={form.memeImageUrl}
                    alt=""
                    className="h-40 w-full object-contain"
                  />
                </div>
              ) : null}

              <button
                type="submit"
                disabled={saveMutation.isPending}
                className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-sm font-black text-white shadow-[0_18px_42px_rgba(37,99,235,0.22)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saveMutation.isPending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                {editingId ? "Update effect" : "Save effect"}
              </button>

              {selectedEffect ? (
                <p className="text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Editing backend id {getEffectId(selectedEffect)}
                </p>
              ) : null}
              </div>
            </form>
          </aside>
        </div>
      </section>
    </main>
  );
}

const inputClass =
  "w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm font-bold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:bg-white dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white dark:focus:bg-[#050914]";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-white/[0.08] dark:bg-white/[0.04]">
      <p className="text-[0.65rem] font-black uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-lg font-black">{value}</p>
    </div>
  );
}

function Badge({
  label,
  tone,
}: {
  label: string;
  tone: "cyan" | "green" | "slate";
}) {
  const classes = {
    cyan: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-200",
    green: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    slate: "bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-slate-300",
  };

  return (
    <span
      className={`rounded-full px-2 py-1 text-[0.65rem] font-black uppercase ${classes[tone]}`}
    >
      {label}
    </span>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
        {label}
      </span>
      {children}
      {error ? (
        <span className="mt-1 block text-xs font-bold text-rose-500">
          {error}
        </span>
      ) : null}
    </label>
  );
}
