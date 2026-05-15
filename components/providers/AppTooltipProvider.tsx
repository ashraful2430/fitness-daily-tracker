"use client";

import { useEffect, useRef, useState } from "react";

type TooltipState = {
  text: string;
  x: number;
  y: number;
  placement: "top" | "bottom";
};

const tooltipSelector = [
  "[data-tooltip]",
  "button",
  "a",
  "[role='button']",
  "section[aria-label]",
].join(",");

function cleanText(value: string | null | undefined) {
  return value?.replace(/\s+/g, " ").trim() ?? "";
}

function getTooltipText(element: HTMLElement) {
  const explicit = cleanText(element.dataset.tooltip);
  if (explicit) return explicit;

  const ariaLabel = cleanText(element.getAttribute("aria-label"));
  if (ariaLabel) return ariaLabel;

  const title = cleanText(element.getAttribute("title"));
  if (title) return title;

  const isAction =
    element.matches("button") ||
    element.matches("a") ||
    element.getAttribute("role") === "button";
  const text = isAction ? cleanText(element.textContent) : "";

  return text.length > 0 && text.length <= 64 ? text : "";
}

function getTooltipPosition(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const placement = rect.top > 74 ? "top" : "bottom";
  const preferredY =
    placement === "top"
      ? Math.max(14, rect.top - 12)
      : Math.min(viewportHeight - 14, rect.bottom + 12);

  return {
    x: Math.min(Math.max(rect.left + rect.width / 2, 18), viewportWidth - 18),
    y: preferredY,
    placement,
  } as const;
}

function storeNativeTitle(element: HTMLElement) {
  const title = element.getAttribute("title");
  if (!title) return;

  element.dataset.nativeTitle = title;
  element.removeAttribute("title");
}

function restoreNativeTitle(element: HTMLElement | null) {
  if (!element?.dataset.nativeTitle) return;

  element.setAttribute("title", element.dataset.nativeTitle);
  delete element.dataset.nativeTitle;
}

export function AppTooltipProvider() {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const activeElementRef = useRef<HTMLElement | null>(null);
  const showTimerRef = useRef<number | null>(null);

  useEffect(() => {
    function clearShowTimer() {
      if (showTimerRef.current) {
        window.clearTimeout(showTimerRef.current);
        showTimerRef.current = null;
      }
    }

    function hideTooltip() {
      clearShowTimer();
      restoreNativeTitle(activeElementRef.current);
      activeElementRef.current = null;
      setTooltip(null);
    }

    function showTooltip(element: HTMLElement) {
      const text = getTooltipText(element);
      if (!text) {
        hideTooltip();
        return;
      }

      clearShowTimer();
      restoreNativeTitle(activeElementRef.current);
      activeElementRef.current = element;
      storeNativeTitle(element);

      showTimerRef.current = window.setTimeout(() => {
        const position = getTooltipPosition(element);
        setTooltip({
          text,
          x: position.x,
          y: position.y,
          placement: position.placement,
        });
      }, 120);
    }

    function findTooltipElement(target: EventTarget | null) {
      if (!(target instanceof Element)) return null;
      return target.closest(tooltipSelector) as HTMLElement | null;
    }

    function handlePointerOver(event: PointerEvent) {
      if (event.pointerType === "touch") return;
      const element = findTooltipElement(event.target);
      if (!element || element === activeElementRef.current) return;
      showTooltip(element);
    }

    function handlePointerMove() {
      const element = activeElementRef.current;
      if (!element) return;
      const position = getTooltipPosition(element);
      setTooltip((current) =>
        current
          ? {
              ...current,
              x: position.x,
              y: position.y,
              placement: position.placement,
            }
          : current,
      );
    }

    function handlePointerOut(event: PointerEvent) {
      const element = activeElementRef.current;
      if (!element) return;
      const nextTarget = event.relatedTarget;
      if (nextTarget instanceof Node && element.contains(nextTarget)) return;
      hideTooltip();
    }

    function handleFocusIn(event: FocusEvent) {
      const element = findTooltipElement(event.target);
      if (element) showTooltip(element);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") hideTooltip();
    }

    document.addEventListener("pointerover", handlePointerOver);
    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerout", handlePointerOut);
    document.addEventListener("pointerdown", hideTooltip);
    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("focusout", hideTooltip);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", hideTooltip, true);
    window.addEventListener("resize", hideTooltip);

    return () => {
      document.removeEventListener("pointerover", handlePointerOver);
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerout", handlePointerOut);
      document.removeEventListener("pointerdown", hideTooltip);
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("focusout", hideTooltip);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", hideTooltip, true);
      window.removeEventListener("resize", hideTooltip);
      hideTooltip();
    };
  }, []);

  if (!tooltip) return null;

  return (
    <div
      className="pointer-events-none fixed z-[120] max-w-[min(18rem,calc(100vw-2rem))] -translate-x-1/2 rounded-xl border border-white/15 bg-slate-950/95 px-3 py-2 text-center text-xs font-black leading-5 text-white shadow-[0_18px_50px_rgba(0,0,0,0.34)] backdrop-blur-xl dark:border-cyan-200/15 dark:bg-[#06101f]/95"
      style={{
        left: tooltip.x,
        top: tooltip.y,
        transform:
          tooltip.placement === "top"
            ? "translate(-50%, -100%)"
            : "translate(-50%, 0)",
      }}
      role="tooltip"
    >
      <span className="absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent" />
      {tooltip.text}
      <span
        className={`absolute left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-white/15 bg-slate-950/95 dark:border-cyan-200/15 dark:bg-[#06101f]/95 ${
          tooltip.placement === "top"
            ? "-bottom-1 border-b border-r"
            : "-top-1 border-l border-t"
        }`}
      />
    </div>
  );
}
