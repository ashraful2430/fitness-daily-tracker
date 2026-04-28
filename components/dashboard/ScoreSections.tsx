"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Minus, Pencil, Plus, Target, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import {
  scoreSectionAPI,
  type ScoreGoalType,
  type ScoreSection,
  type ScoreSectionInput,
} from "@/lib/api";

interface Props {
  onScoreChange?: (score: number) => void;
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

export default function ScoreSections({ onScoreChange }: Props) {
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
      const res = await scoreSectionAPI.getSections();
      setSections(res.data || []);
    } catch {
      toast.error("Failed to load daily sections");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSections();
  }, [loadSections]);

  useEffect(() => {
    onScoreChange?.(score);
  }, [score, onScoreChange]);

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
        const res = await scoreSectionAPI.updateSection(editId, payload);

        setSections((prev) =>
          prev.map((section) => (section._id === editId ? res.data : section)),
        );

        toast.success("Section updated");
      } else {
        if (sections.length >= MAX_SECTIONS) {
          toast.error(`Maximum ${MAX_SECTIONS} sections allowed`);
          return;
        }

        const res = await scoreSectionAPI.createSection(payload);
        setSections((prev) => [...prev, res.data]);
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
      const res = await scoreSectionAPI.updateProgress(section._id, safeValue);

      setSections((prev) =>
        prev.map((item) => (item._id === section._id ? res.data : item)),
      );
    } catch {
      setSections(previous);
      toast.error("Failed to update progress");
    }
  };

  if (loading) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-[#0f0c1f] p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-5 w-36 rounded-full bg-white/10" />
          <div className="h-20 rounded-3xl bg-white/10" />
          <div className="h-20 rounded-3xl bg-white/10" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-[2rem] border border-white/10 bg-[#0f0c1f] p-5 shadow-xl shadow-black/20">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-violet-300">
              <Target size={14} />
              Daily Score
            </div>

            <h3 className="text-xl font-black text-white">Daily Sections</h3>

            <p className="mt-1 text-sm text-slate-400">
              {sections.length
                ? `${sections.length} section${sections.length > 1 ? "s" : ""} · ${pointsEach.toFixed(1)}% each`
                : "Create your own daily sections."}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/[0.06] px-4 py-3 text-center">
              <p className="text-[11px] font-bold text-slate-500">Score</p>
              <p className="text-xl font-black text-white">{score}%</p>
            </div>

            <button
              onClick={openAddModal}
              disabled={sections.length >= MAX_SECTIONS}
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-950/30 transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>

        {sections.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-white/[0.03] p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.06] text-3xl">
              🎯
            </div>

            <h4 className="text-lg font-black text-white">No sections yet</h4>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-400">
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
          <div className="space-y-3">
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
    <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.035] p-4 transition hover:border-violet-400/30 hover:bg-white/[0.055]">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/[0.07] text-2xl">
          {section.emoji}
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h4 className="truncate text-sm font-black text-white">
                {section.name}
              </h4>
              <p className="text-xs font-medium text-slate-500">
                {section.currentValue}/{section.goalValue}{" "}
                {getUnit(section.goalType)}
              </p>
            </div>

            <div className="rounded-full bg-white/[0.07] px-3 py-1 text-[11px] font-black text-white">
              {earned}/{Math.round(pointsEach)}
            </div>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-white/[0.07]">
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

      <div className="mt-4 flex flex-wrap gap-2 pl-16">
        {section.goalType === "boolean" ? (
          <button
            onClick={() => onProgress(completed ? 0 : 1)}
            className={`rounded-xl px-4 py-2 text-xs font-black transition ${
              completed
                ? "bg-gradient-to-r from-emerald-500 to-lime-400 text-white"
                : "bg-white/[0.07] text-slate-300 hover:bg-white/[0.12]"
            }`}
          >
            {completed ? "Completed" : "Mark Done"}
          </button>
        ) : (
          <>
            <button
              onClick={() => onProgress(section.currentValue - step)}
              className="rounded-xl bg-white/[0.07] px-3 py-2 text-xs font-black text-slate-300 transition hover:bg-white/[0.12]"
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
          className="rounded-xl bg-white/[0.07] px-3 py-2 text-xs font-black text-slate-300 transition hover:bg-white/[0.12]"
        >
          <Pencil size={14} />
        </button>

        <button
          onClick={onDelete}
          className="rounded-xl bg-red-500/[0.10] px-3 py-2 text-xs font-black text-red-300 transition hover:bg-red-500/20"
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
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            className="relative w-full max-w-lg rounded-[2rem] border border-violet-400/20 bg-[#120f24] p-6 shadow-2xl shadow-violet-950/30"
          >
            <button
              onClick={onClose}
              className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.07] text-slate-400 transition hover:bg-white/[0.12] hover:text-white"
            >
              <X size={18} />
            </button>

            <div className="mb-6">
              <p className="mb-2 text-xs font-black uppercase tracking-[0.25em] text-violet-300">
                {editMode ? "Edit Section" : "New Section"}
              </p>

              <h2 className="text-3xl font-black text-white">
                {editMode ? "Update section" : "Create section"}
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Add a goal like Coding, Meditation, Study, Workout, or Reading.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <p className="mb-3 text-sm font-black text-white">Icon</p>
                <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
                  {EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setForm((prev) => ({ ...prev, emoji }))}
                      className={`flex h-10 w-10 items-center justify-center rounded-2xl text-lg transition ${
                        form.emoji === emoji
                          ? "bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-950/30"
                          : "bg-white/[0.06] hover:bg-white/[0.12]"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <input
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Section name"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-4 text-sm font-bold text-white outline-none placeholder:text-slate-500 focus:border-violet-400/50"
              />

              <div className="grid gap-2 sm:grid-cols-3">
                {goalTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        goalType: type.value,
                        goalValue:
                          type.value === "boolean" ? 1 : prev.goalValue || 1,
                      }))
                    }
                    className={`rounded-2xl border px-4 py-3 text-sm font-black transition ${
                      form.goalType === type.value
                        ? "border-violet-400/40 bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-950/30"
                        : "border-white/10 bg-white/[0.05] text-white hover:bg-white/[0.10]"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>

              {form.goalType !== "boolean" && (
                <input
                  type="number"
                  min={1}
                  value={form.goalValue}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      goalValue: Number(e.target.value),
                    }))
                  }
                  placeholder="Daily goal value"
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-4 text-sm font-bold text-white outline-none placeholder:text-slate-500 focus:border-violet-400/50"
                />
              )}

              <button
                onClick={onSubmit}
                disabled={saving}
                className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-4 text-sm font-black text-white shadow-lg shadow-violet-950/30 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : editMode
                    ? "Save Changes"
                    : "Create Section"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
