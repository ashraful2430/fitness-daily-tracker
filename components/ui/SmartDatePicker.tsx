"use client";

import { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

type PickerMode = "date" | "month";
type ViewMode = "day" | "month" | "year";

type SmartDatePickerProps = {
  value: string;
  onChange: (value: string) => void;
  mode?: PickerMode;
  className?: string;
  buttonClassName?: string;
  accentClassName?: string;
  minYear?: number;
  maxYear?: number;
};

const baseButtonClass =
  "flex w-full cursor-pointer items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-bold text-slate-900 outline-none transition hover:bg-white focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-500/10 dark:border-white/[0.08] dark:bg-slate-950/90 dark:text-slate-100 dark:hover:bg-slate-900";

function toLocalDateValue(date: Date) {
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return offsetDate.toISOString().slice(0, 10);
}

function currentMonthValue() {
  return toLocalDateValue(new Date()).slice(0, 7);
}

function parsePickerValue(value: string, mode: PickerMode) {
  const fallback = new Date();
  const normalized = mode === "month" ? `${value || currentMonthValue()}-01` : value;
  const [year, month, day] = normalized.split("-").map(Number);
  if (!year || !month || !day) return fallback;

  const parsed = new Date(year, month - 1, day);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
}

function formatPickerValue(value: string, mode: PickerMode) {
  if (!value) return mode === "month" ? "Choose month" : "Choose date";
  const date = parsePickerValue(value, mode);

  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    ...(mode === "date" ? { day: "numeric" } : {}),
  });
}

function monthLabel(monthIndex: number, format: "short" | "long" = "short") {
  return new Date(2026, monthIndex, 1).toLocaleDateString("en-US", {
    month: format,
  });
}

export default function SmartDatePicker({
  value,
  onChange,
  mode = "date",
  className = "",
  buttonClassName = "",
  accentClassName = "text-cyan-600 dark:text-cyan-300",
  minYear = 2000,
  maxYear = new Date().getFullYear() + 5,
}: SmartDatePickerProps) {
  const selectedDate = parsePickerValue(value, mode);
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(
    () => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
  );
  const [viewMode, setViewMode] = useState<ViewMode>(mode === "month" ? "month" : "day");
  const today = new Date();
  const currentValue = mode === "month" ? currentMonthValue() : toLocalDateValue(today);
  const yearStart = Math.max(minYear, Math.floor(viewDate.getFullYear() / 12) * 12);
  const yearOptions = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => yearStart + index).filter(
        (year) => year >= minYear && year <= maxYear,
      ),
    [maxYear, minYear, yearStart],
  );

  const chooseMonth = (monthIndex: number) => {
    const nextDate = new Date(viewDate.getFullYear(), monthIndex, 1);
    setViewDate(nextDate);

    if (mode === "month") {
      onChange(toLocalDateValue(nextDate).slice(0, 7));
      setOpen(false);
      return;
    }

    setViewMode("day");
  };

  const chooseDay = (day: number) => {
    onChange(toLocalDateValue(new Date(viewDate.getFullYear(), viewDate.getMonth(), day)));
    setOpen(false);
  };

  const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const dayCells = Array.from({ length: startOffset + daysInMonth }, (_, index) => {
    const day = index - startOffset + 1;
    return day > 0 ? day : null;
  });

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={`${baseButtonClass} ${buttonClassName}`}
        aria-expanded={open}
      >
        <span>{formatPickerValue(value, mode)}</span>
        <CalendarDays className={`h-4 w-4 shrink-0 ${accentClassName}`} />
      </button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-full min-w-[18rem] rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-200/80 dark:border-cyan-300/10 dark:bg-[#07101e] dark:shadow-black/40">
          <div className="mb-3 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                if (viewMode === "year") {
                  setViewDate((current) => new Date(current.getFullYear() - 12, current.getMonth(), 1));
                  return;
                }
                setViewDate((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1));
              }}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-100 dark:border-cyan-300/10 dark:text-cyan-200 dark:hover:bg-cyan-400/10"
              aria-label="Previous"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => setViewMode(viewMode === "year" ? "month" : "year")}
              className="cursor-pointer rounded-xl px-3 py-2 text-sm font-black text-slate-900 transition hover:bg-slate-100 dark:text-white dark:hover:bg-cyan-400/10"
            >
              {viewMode === "year"
                ? `${yearOptions[0]} - ${yearOptions[yearOptions.length - 1]}`
                : viewDate.toLocaleDateString("en-US", {
                    month: viewMode === "day" ? "long" : undefined,
                    year: "numeric",
                  })}
            </button>

            <button
              type="button"
              onClick={() => {
                if (viewMode === "year") {
                  setViewDate((current) => new Date(current.getFullYear() + 12, current.getMonth(), 1));
                  return;
                }
                setViewDate((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1));
              }}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-100 dark:border-cyan-300/10 dark:text-cyan-200 dark:hover:bg-cyan-400/10"
              aria-label="Next"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {viewMode === "year" ? (
            <div className="grid grid-cols-3 gap-2">
              {yearOptions.map((year) => (
                <button
                  key={year}
                  type="button"
                  onClick={() => {
                    setViewDate((current) => new Date(year, current.getMonth(), 1));
                    setViewMode("month");
                  }}
                  className={`h-11 cursor-pointer rounded-xl text-sm font-black transition ${
                    year === viewDate.getFullYear()
                      ? "bg-cyan-500 text-white dark:bg-cyan-300 dark:text-slate-950"
                      : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-cyan-400/10"
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          ) : null}

          {viewMode === "month" ? (
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 12 }, (_, monthIndex) => (
                <button
                  key={monthIndex}
                  type="button"
                  onClick={() => chooseMonth(monthIndex)}
                  className={`h-11 cursor-pointer rounded-xl text-sm font-black transition ${
                    monthIndex === viewDate.getMonth()
                      ? "bg-cyan-500 text-white dark:bg-cyan-300 dark:text-slate-950"
                      : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-cyan-400/10"
                  }`}
                >
                  {monthLabel(monthIndex)}
                </button>
              ))}
            </div>
          ) : null}

          {viewMode === "day" ? (
            <>
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>
              <div className="mt-2 grid grid-cols-7 gap-1">
                {dayCells.map((day, index) => {
                  const dateValue = day
                    ? toLocalDateValue(new Date(viewDate.getFullYear(), viewDate.getMonth(), day))
                    : "";
                  const selected = dateValue === value;
                  const isToday = dateValue === currentValue;

                  return day ? (
                    <button
                      key={dateValue}
                      type="button"
                      onClick={() => chooseDay(day)}
                      className={`flex h-9 cursor-pointer items-center justify-center rounded-xl text-sm font-black transition ${
                        selected
                          ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/25 dark:bg-cyan-300 dark:text-slate-950"
                          : isToday
                            ? "border border-cyan-300 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 dark:border-cyan-300/35 dark:bg-cyan-400/10 dark:text-cyan-200"
                            : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-cyan-400/10"
                      }`}
                    >
                      {day}
                    </button>
                  ) : (
                    <span key={`empty-${index}`} />
                  );
                })}
              </div>
            </>
          ) : null}

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                onChange(currentValue);
                setViewDate(parsePickerValue(currentValue, mode));
                setViewMode(mode === "month" ? "month" : "day");
                setOpen(false);
              }}
              className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-black text-slate-700 transition hover:bg-slate-100 dark:border-cyan-200/10 dark:bg-[#07101e] dark:text-slate-200 dark:hover:bg-[#0d1b2e]"
            >
              {mode === "month" ? "This month" : "Today"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-black text-slate-700 transition hover:bg-slate-100 dark:border-cyan-200/10 dark:bg-[#07101e] dark:text-slate-200 dark:hover:bg-[#0d1b2e]"
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
