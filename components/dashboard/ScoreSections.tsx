// frontend/components/dashboard/ScoreSections.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Minus, Pencil, Plus, Target, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import PremiumModal from "@/components/ui/PremiumModal";
import {
  scoreSectionAPI,
  type ScoreGoalType,
  type ScoreSection,
  type ScoreSectionInput,
} from "@/lib/api";

interface Props {
  onScoreChange?: (score: number) => void;
  onSectionsChange?: (sections: ScoreSection[]) => void;
}

const MAX_SECTIONS = 10;

const EMOJIS = ["⭐", "💻", "📚", "🏋️", "🧘", "🏃", "💧", "🎯", "💰", "📝"];

const DEFAULT_FORM: ScoreSectionInput = {
  name: "",
  emoji: "⭐",
  goalType: "count",
  goalValue: 1,
};

const goalTypes: { label: string; value: ScoreGoalType }[] = [
  { label: "Count", value: "count" },
  { label: "Time", value: "duration" },
  { label: "Done", value: "boolean" },
];

function calculateScore(sections: ScoreSection[]) {
  if (!sections.length) return 0;

  const each = 100 / sections.length;

  const total = sections.reduce((sum, section) => {
    const ratio = Math.min(section.currentValue / section.goalValue, 1);
    return sum + ratio * each;
  }, 0);

  return Math.min(Math.round(total), 100);
}

function getProgress(section: ScoreSection) {
  return Math.min(
    Math.round((section.currentValue / section.goalValue) * 100),
    100,
  );
}

function getUnit(type: ScoreGoalType) {
  if (type === "duration") return "min";
  if (type === "boolean") return "done";
  return "count";
}

export default function ScoreSections({
  onScoreChange,
  onSectionsChange,
}: Props) {
  const [sections, setSections] = useState<ScoreSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ScoreSectionInput>(DEFAULT_FORM);

  const score = useMemo(() => calculateScore(sections), [sections]);
  const pointsEach = sections.length ? 100 / sections.length : 0;

  const loadSections = useCallback(async () => {
    try {
      setLoading(true);
      const nextSections = await scoreSectionAPI.getSections();
      setSections(nextSections || []);
    } catch {
      toast.error("Failed to load daily sections");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void loadSections();
    });
  }, [loadSections]);

  useEffect(() => {
    onScoreChange?.(score);
  }, [score, onScoreChange]);

  useEffect(() => {
    onSectionsChange?.(sections);
  }, [sections, onSectionsChange]);

  const openAddModal = () => {
    setEditId(null);
    setForm(DEFAULT_FORM);
    setModalOpen(true);
  };

  const openEditModal = (section: ScoreSection) => {
    setEditId(section._id);
    setForm({
      name: section.name,
      emoji: section.emoji,
      goalType: section.goalType,
      goalValue: section.goalValue,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditId(null);
    setForm(DEFAULT_FORM);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error("Section name is required");
      return;
    }

    try {
      setSaving(true);

      const payload: ScoreSectionInput = {
        ...form,
        name: form.name.trim(),
        goalValue:
          form.goalType === "boolean" ? 1 : Number(form.goalValue || 1),
      };

      if (editId) {
        const updatedSection = await scoreSectionAPI.updateSection(
          editId,
          payload,
        );

        setSections((prev) =>
          prev.map((section) =>
            section._id === editId ? updatedSection : section,
          ),
        );

        toast.success("Section updated");
      } else {
        if (sections.length >= MAX_SECTIONS) {
          toast.error(`Maximum ${MAX_SECTIONS} sections allowed`);
          return;
        }

        const createdSection = await scoreSectionAPI.createSection(payload);
        setSections((prev) => [...prev, createdSection]);
        toast.success("Section added");
      }

      closeModal();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await scoreSectionAPI.deleteSection(id);
      setSections((prev) => prev.filter((section) => section._id !== id));
      toast.success("Section removed");
    } catch {
      toast.error("Failed to delete section");
    }
  };

  const updateProgress = async (section: ScoreSection, nextValue: number) => {
    const previous = sections;
    const safeValue = Math.max(0, nextValue);

    setSections((prev) =>
      prev.map((item) =>
        item._id === section._id ? { ...item, currentValue: safeValue } : item,
      ),
    );

    try {
      const updatedSection = await scoreSectionAPI.updateProgress(
        section._id,
        safeValue,
      );

      setSections((prev) =>
        prev.map((item) => (item._id === section._id ? updatedSection : item)),
      );
    } catch {
      setSections(previous);
      toast.error("Failed to update progress");
    }
  };

  if (loading) {
    return (
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 dark:border-white/10 dark:bg-[#0f0c1f] dark:shadow-black/20">
        <div className="animate-pulse space-y-4">
          <div className="h-5 w-36 rounded-full bg-slate-100 dark:bg-white/10" />
          <div className="h-20 rounded-3xl bg-slate-100 dark:bg-white/10" />
          <div className="h-20 rounded-3xl bg-slate-100 dark:bg-white/10" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative flex h-full flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 dark:border-white/10 dark:bg-[#0f0c1f] dark:shadow-black/20">
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/40 to-transparent" />

        <div className="relative z-10 mb-6 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-violet-500 dark:text-violet-300">
              <Target size={14} />
              Daily Score
            </div>

            <h3 className="text-xl font-black text-slate-950 dark:text-white">
              Daily Sections
            </h3>

            <p className="mt-1 text-sm font-medium text-slate-500">
              {sections.length
                ? `${sections.length} section${
                    sections.length > 1 ? "s" : ""
                  } · ${pointsEach.toFixed(1)}% each`
                : "Create your own daily sections."}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-14 min-w-[110px] items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.06] px-4 dark:bg-white/[0.06]">
              <p className="whitespace-nowrap text-xl font-black text-slate-950 dark:text-white">
                Score {score}%
              </p>
            </div>
            <button
              onClick={openAddModal}
              disabled={sections.length >= MAX_SECTIONS}
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 text-white shadow-[0_15px_45px_-12px_rgba(139,92,246,0.8)] transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus size={22} />
            </button>
          </div>
        </div>

        {sections.length === 0 ? (
          <div className="relative z-10 flex min-h-[260px] flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 p-8 text-center dark:border-white/10 dark:bg-white/[0.03]">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm dark:bg-white/[0.06]">
              🎯
            </div>

            <h4 className="text-lg font-black text-slate-950 dark:text-white">
              No sections yet
            </h4>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
              Add Coding, Learning, Exercise, Meditation, or anything you want
              to track today.
            </p>

            <button
              onClick={openAddModal}
              className="mt-5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-violet-950/30 transition hover:scale-[1.02]"
            >
              Add First Section
            </button>
          </div>
        ) : (
          <div
            className={`relative z-10 space-y-3 ${
              sections.length > 2
                ? "max-h-[30rem] overflow-y-auto pr-2 [scrollbar-gutter:stable] [scrollbar-width:thin]"
                : ""
            }`}
          >
            {sections.map((section) => (
              <SectionCard
                key={section._id}
                section={section}
                pointsEach={pointsEach}
                onEdit={() => openEditModal(section)}
                onDelete={() => handleDelete(section._id)}
                onProgress={(next) => updateProgress(section, next)}
              />
            ))}
          </div>
        )}
      </div>

      <SectionModal
        open={modalOpen}
        editMode={Boolean(editId)}
        form={form}
        setForm={setForm}
        saving={saving}
        onSubmit={handleSubmit}
        onClose={closeModal}
      />
    </>
  );
}

function SectionCard({
  section,
  pointsEach,
  onEdit,
  onDelete,
  onProgress,
}: {
  section: ScoreSection;
  pointsEach: number;
  onEdit: () => void;
  onDelete: () => void;
  onProgress: (nextValue: number) => void;
}) {
  const progress = getProgress(section);
  const completed = section.currentValue >= section.goalValue;
  const earned = Math.round((progress / 100) * pointsEach);
  const step = section.goalType === "duration" ? 5 : 1;

  return (
    <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50 p-4 transition hover:border-violet-300 hover:bg-white dark:border-white/10 dark:bg-white/[0.035] dark:hover:border-violet-400/30 dark:hover:bg-white/[0.055]">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm dark:bg-white/[0.07]">
          {section.emoji}
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h4 className="truncate text-sm font-black text-slate-950 dark:text-white">
                {section.name}
              </h4>

              <p className="text-xs font-medium text-slate-500">
                {section.currentValue}/{section.goalValue}{" "}
                {getUnit(section.goalType)}
              </p>
            </div>

            <div className="shrink-0 rounded-full bg-white px-3 py-1 text-[11px] font-black text-slate-700 shadow-sm dark:bg-white/[0.07] dark:text-white">
              {earned}/{Math.round(pointsEach)}
            </div>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/[0.07]">
            <motion.div
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.35 }}
              className={`h-full rounded-full ${
                completed
                  ? "bg-gradient-to-r from-emerald-400 to-lime-300"
                  : "bg-gradient-to-r from-violet-500 to-cyan-400"
              }`}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 pl-0 sm:pl-16">
        {section.goalType === "boolean" ? (
          <button
            onClick={() => onProgress(completed ? 0 : 1)}
            className={`rounded-xl px-4 py-2 text-xs font-black transition ${
              completed
                ? "bg-gradient-to-r from-emerald-500 to-lime-400 text-white"
                : "bg-white text-slate-600 shadow-sm hover:bg-slate-100 dark:bg-white/[0.07] dark:text-slate-300 dark:hover:bg-white/[0.12]"
            }`}
          >
            {completed ? "Completed" : "Mark Done"}
          </button>
        ) : (
          <>
            <button
              onClick={() => onProgress(section.currentValue - step)}
              className="rounded-xl bg-white px-3 py-2 text-xs font-black text-slate-600 shadow-sm transition hover:bg-slate-100 dark:bg-white/[0.07] dark:text-slate-300 dark:hover:bg-white/[0.12]"
            >
              <Minus size={14} />
            </button>

            <button
              onClick={() => onProgress(section.currentValue + step)}
              className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-xs font-black text-white shadow-md shadow-violet-950/30 transition hover:scale-105"
            >
              Add Progress
            </button>
          </>
        )}

        <button
          onClick={onEdit}
          className="rounded-xl bg-white px-3 py-2 text-xs font-black text-slate-600 shadow-sm transition hover:bg-slate-100 dark:bg-white/[0.07] dark:text-slate-300 dark:hover:bg-white/[0.12]"
        >
          <Pencil size={14} />
        </button>

        <button
          onClick={onDelete}
          className="rounded-xl bg-red-50 px-3 py-2 text-xs font-black text-red-500 transition hover:bg-red-100 dark:bg-red-500/[0.10] dark:text-red-300 dark:hover:bg-red-500/20"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

function SectionModal({
  open,
  editMode,
  form,
  setForm,
  saving,
  onSubmit,
  onClose,
}: {
  open: boolean;
  editMode: boolean;
  form: ScoreSectionInput;
  setForm: React.Dispatch<React.SetStateAction<ScoreSectionInput>>;
  saving: boolean;
  onSubmit: () => void;
  onClose: () => void;
}) {
  return (
    <PremiumModal
      open={open}
      title={editMode ? "Update section" : "Create section"}
      subtitle={editMode ? "Edit Section" : "New Section"}
      description="Add a goal like Coding, Meditation, Study, Workout, or Reading."
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-3xl border border-white/10 bg-slate-950/80 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-900"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={saving}
            className="rounded-3xl bg-gradient-to-r from-violet-500 to-cyan-400 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : editMode ? "Save changes" : "Add section"}
          </button>
        </>
      }
    >
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">
            Section name
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="e.g. Workout"
            className="w-full rounded-3xl border border-slate-700/80 bg-slate-950/80 px-4 py-3 text-slate-100 shadow-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Emoji
            </label>
            <select
              value={form.emoji}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, emoji: e.target.value }))
              }
              className="w-full rounded-3xl border border-slate-700/80 bg-slate-950/80 px-4 py-3 text-slate-100 shadow-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
            >
              {EMOJIS.map((emoji) => (
                <option key={emoji} value={emoji}>
                  {emoji}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Goal type
            </label>
            <select
              value={form.goalType}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  goalType: e.target.value as ScoreGoalType,
                }))
              }
              className="w-full rounded-3xl border border-slate-700/80 bg-slate-950/80 px-4 py-3 text-slate-100 shadow-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
            >
              {goalTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">
            Goal value
          </label>
          <input
            type="number"
            value={form.goalValue}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                goalValue: Number(e.target.value),
              }))
            }
            min={form.goalType === "boolean" ? 1 : 0}
            className="w-full rounded-3xl border border-slate-700/80 bg-slate-950/80 px-4 py-3 text-slate-100 shadow-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
          />
        </div>
      </div>
    </PremiumModal>
  );
}
