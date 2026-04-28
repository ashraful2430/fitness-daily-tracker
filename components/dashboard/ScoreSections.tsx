"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import toast from "react-hot-toast";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ─── types ───────────────────────────────────────────────────────
export interface ScoreSection {
  _id: string;
  name: string;
  emoji: string;
  goalType: "count" | "duration" | "boolean";
  goalValue: number;
  currentValue: number;
  order: number;
}

interface Props {
  onScoreChange?: (score: number) => void;
}

const EMOJI_PRESETS = [
  "💧",
  "🏋️",
  "💻",
  "📚",
  "🧘",
  "🏃",
  "🎯",
  "💪",
  "🥗",
  "😴",
  "🎨",
  "🎵",
  "📝",
  "🌿",
  "⚡",
];
const MAX = 10;

// ─── api helpers ─────────────────────────────────────────────────
async function apiFetch(path: string, opts?: RequestInit) {
  const r = await fetch(`${API}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  return r.json();
}

// ─── main component ───────────────────────────────────────────────
export default function ScoreSections({ onScoreChange }: Props) {
  const [sections, setSections] = useState<ScoreSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // form state
  const [form, setForm] = useState({
    name: "",
    emoji: "⭐",
    goalType: "count" as ScoreSection["goalType"],
    goalValue: 1,
  });

  const load = useCallback(async () => {
    const res = await apiFetch("/api/score-sections");
    if (res.success) {
      setSections(res.data);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // recalculate total score whenever sections change
  useEffect(() => {
    if (!sections.length) {
      onScoreChange?.(0);
      return;
    }
    const ptsEach = 100 / sections.length;
    const total = sections.reduce((sum, s) => {
      const ratio = Math.min(s.currentValue / s.goalValue, 1);
      return sum + ratio * ptsEach;
    }, 0);
    onScoreChange?.(Math.round(total));
  }, [sections, onScoreChange]);

  // ── add ──
  const handleAdd = async () => {
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    const res = await apiFetch("/api/score-sections", {
      method: "POST",
      body: JSON.stringify(form),
    });
    if (res.success) {
      setSections((p) => [...p, res.data]);
      setForm({ name: "", emoji: "⭐", goalType: "count", goalValue: 1 });
      setShowAdd(false);
      toast.success(`${res.data.emoji} ${res.data.name} added!`);
    } else {
      toast.error(res.message);
    }
  };

  // ── edit ──
  const handleEdit = async (id: string) => {
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    const res = await apiFetch(`/api/score-sections/${id}`, {
      method: "PATCH",
      body: JSON.stringify(form),
    });
    if (res.success) {
      setSections((p) => p.map((s) => (s._id === id ? res.data : s)));
      setEditId(null);
      toast.success("Section updated!");
    }
  };

  // ── delete ──
  const handleDelete = async (id: string) => {
    const res = await apiFetch(`/api/score-sections/${id}`, {
      method: "DELETE",
    });
    if (res.success) {
      setSections((p) => p.filter((s) => s._id !== id));
      toast.success("Section removed");
    }
  };

  // ── progress ──
  const handleProgress = async (s: ScoreSection, delta: number) => {
    const next = Math.max(0, s.currentValue + delta);
    // optimistic
    setSections((p) =>
      p.map((x) => (x._id === s._id ? { ...x, currentValue: next } : x)),
    );
    await apiFetch(`/api/score-sections/${s._id}/progress`, {
      method: "PATCH",
      body: JSON.stringify({ value: next }),
    });
  };

  // ── toggle boolean ──
  const handleToggle = async (s: ScoreSection) => {
    const next = s.currentValue >= s.goalValue ? 0 : s.goalValue;
    setSections((p) =>
      p.map((x) => (x._id === s._id ? { ...x, currentValue: next } : x)),
    );
    await apiFetch(`/api/score-sections/${s._id}/progress`, {
      method: "PATCH",
      body: JSON.stringify({ value: next }),
    });
  };

  const startEdit = (s: ScoreSection) => {
    setForm({
      name: s.name,
      emoji: s.emoji,
      goalType: s.goalType,
      goalValue: s.goalValue,
    });
    setEditId(s._id);
    setShowAdd(false);
  };

  const ptsEach = sections.length ? Math.round(100 / sections.length) : 0;

  if (loading)
    return (
      <div className="rounded-[28px] border border-white/[0.07] bg-[#0f0c1f] p-6 animate-pulse h-64" />
    );

  return (
    <div className="rounded-[28px] border border-white/[0.07] bg-[#0f0c1f] p-6">
      {/* header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-bold text-white text-sm">Score Breakdown</h3>
          <p className="text-[11px] text-gray-500 mt-0.5">
            {sections.length > 0
              ? `${ptsEach} pts × ${sections.length} section${sections.length > 1 ? "s" : ""}`
              : "Add sections to track your score"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {sections.length > 0 && (
            <span className="text-2xl font-black text-white">
              {Math.round(
                sections.reduce(
                  (sum, s) =>
                    sum + Math.min(s.currentValue / s.goalValue, 1) * ptsEach,
                  0,
                ),
              )}
              <span className="text-sm text-gray-500">/100</span>
            </span>
          )}
          {sections.length < MAX && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                setShowAdd((p) => !p);
                setEditId(null);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/30 text-violet-400 text-xs font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add {sections.length}/{MAX}
            </motion.button>
          )}
        </div>
      </div>

      {/* add form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="mb-4 overflow-hidden"
          >
            <SectionForm
              form={form}
              setForm={setForm}
              onConfirm={handleAdd}
              onCancel={() => setShowAdd(false)}
              label="Add section"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* empty state */}
      {sections.length === 0 && !showAdd && (
        <div className="text-center py-10">
          <div className="text-4xl mb-3">🎯</div>
          <p className="text-sm font-semibold text-gray-400">No sections yet</p>
          <p className="text-xs text-gray-600 mt-1">
            Add up to {MAX} sections to personalise your daily score
          </p>
        </div>
      )}

      {/* section list */}
      <div className="space-y-2">
        <AnimatePresence>
          {sections.map((s, i) => (
            <motion.div
              key={s._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20, height: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              {editId === s._id ? (
                <SectionForm
                  form={form}
                  setForm={setForm}
                  onConfirm={() => handleEdit(s._id)}
                  onCancel={() => setEditId(null)}
                  label="Save changes"
                />
              ) : (
                <SectionRow
                  section={s}
                  ptsEach={ptsEach}
                  onProgress={handleProgress}
                  onToggle={handleToggle}
                  onEdit={() => startEdit(s)}
                  onDelete={() => handleDelete(s._id)}
                />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── section row ──────────────────────────────────────────────────
function SectionRow({
  section: s,
  ptsEach,
  onProgress,
  onToggle,
  onEdit,
  onDelete,
}: {
  section: ScoreSection;
  ptsEach: number;
  onProgress: (s: ScoreSection, d: number) => void;
  onToggle: (s: ScoreSection) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const ratio = Math.min(s.currentValue / s.goalValue, 1);
  const pts = Math.round(ratio * ptsEach);
  const pct = Math.round(ratio * 100);
  const done = s.currentValue >= s.goalValue;

  return (
    <div
      className={`rounded-2xl border p-4 transition-colors ${done ? "border-violet-500/30 bg-violet-500/[0.06]" : "border-white/[0.05] bg-white/[0.03]"}`}
    >
      <div className="flex items-center gap-3">
        <span className="text-xl shrink-0">{s.emoji}</span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-semibold text-white truncate">
              {s.name}
            </span>
            <span className="text-xs font-bold text-white ml-2 shrink-0">
              {pts}
              <span className="text-gray-600">/{ptsEach}</span>
            </span>
          </div>
          <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
            <motion.div
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className={`h-full rounded-full ${done ? "bg-gradient-to-r from-violet-500 to-cyan-400" : "bg-gradient-to-r from-violet-700 to-violet-500"}`}
            />
          </div>
          <p className="text-[10px] text-gray-500 mt-1">
            {s.currentValue}/{s.goalValue}{" "}
            {s.goalType === "duration"
              ? "min"
              : s.goalType === "boolean"
                ? "(done)"
                : ""}
          </p>
        </div>

        {/* controls */}
        <div className="flex items-center gap-1 shrink-0">
          {s.goalType === "boolean" ? (
            <button
              onClick={() => onToggle(s)}
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${done ? "bg-violet-500/30 text-violet-300" : "bg-white/[0.06] text-gray-400 hover:bg-white/[0.12]"}`}
            >
              <Check className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex flex-col gap-0.5">
              <button
                onClick={() => onProgress(s, 1)}
                className="w-6 h-5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center transition-colors"
              >
                <ChevronUp className="w-3 h-3 text-gray-400" />
              </button>
              <button
                onClick={() => onProgress(s, -1)}
                className="w-6 h-5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center transition-colors"
              >
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>
            </div>
          )}
          <button
            onClick={onEdit}
            className="w-7 h-7 rounded-xl bg-white/[0.04] hover:bg-white/[0.10] flex items-center justify-center transition-colors"
          >
            <Pencil className="w-3 h-3 text-gray-500" />
          </button>
          <button
            onClick={onDelete}
            className="w-7 h-7 rounded-xl bg-red-500/[0.08] hover:bg-red-500/20 flex items-center justify-center transition-colors"
          >
            <Trash2 className="w-3 h-3 text-red-400" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── add / edit form ──────────────────────────────────────────────
function SectionForm({
  form,
  setForm,
  onConfirm,
  onCancel,
  label,
}: {
  form: {
    name: string;
    emoji: string;
    goalType: ScoreSection["goalType"];
    goalValue: number;
  };
  setForm: React.Dispatch<React.SetStateAction<typeof form>>;
  onConfirm: () => void;
  onCancel: () => void;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-violet-500/20 bg-violet-500/[0.05] p-4 space-y-3">
      {/* emoji picker */}
      <div className="flex flex-wrap gap-1.5">
        {EMOJI_PRESETS.map((e) => (
          <button
            key={e}
            onClick={() => setForm((p) => ({ ...p, emoji: e }))}
            className={`w-8 h-8 rounded-xl text-base flex items-center justify-center transition-colors ${form.emoji === e ? "bg-violet-500/30 ring-1 ring-violet-400" : "bg-white/[0.04] hover:bg-white/[0.10]"}`}
          >
            {e}
          </button>
        ))}
      </div>

      {/* name */}
      <input
        value={form.name}
        onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
        placeholder="Section name (e.g. Coding, Exercise)"
        maxLength={40}
        className="w-full px-3 py-2 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white text-sm placeholder-gray-500 focus:outline-none focus:border-violet-500/50"
      />

      <div className="grid grid-cols-2 gap-2">
        {/* type */}
        <select
          value={form.goalType}
          onChange={(e) =>
            setForm((p) => ({
              ...p,
              goalType: e.target.value as ScoreSection["goalType"],
            }))
          }
          className="px-3 py-2 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-violet-500/50"
        >
          <option value="count">Count (e.g. glasses)</option>
          <option value="duration">Duration (minutes)</option>
          <option value="boolean">Done / Not done</option>
        </select>

        {/* goal */}
        {form.goalType !== "boolean" && (
          <input
            type="number"
            min={1}
            value={form.goalValue}
            onChange={(e) =>
              setForm((p) => ({ ...p, goalValue: Number(e.target.value) }))
            }
            placeholder="Goal value"
            className="px-3 py-2 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-violet-500/50"
          />
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={onConfirm}
          className="flex-1 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition-colors"
        >
          {label}
        </button>
        <button
          onClick={onCancel}
          className="w-10 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>
    </div>
  );
}
