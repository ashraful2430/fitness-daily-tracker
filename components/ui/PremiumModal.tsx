"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Info, Sparkles, X } from "lucide-react";

type PremiumModalSize = "sm" | "md" | "lg";
type PremiumModalVariant = "default" | "info" | "error";

interface PremiumModalProps {
  open: boolean;
  title: string;
  subtitle?: string;
  description?: string;
  onClose: () => void;
  children?: ReactNode;
  footer?: ReactNode;
  variant?: PremiumModalVariant;
  size?: PremiumModalSize;
}

const sizeClasses: Record<PremiumModalSize, string> = {
  sm: "sm:max-w-[460px]",
  md: "sm:max-w-lg",
  lg: "sm:max-w-2xl",
};

const variantConfig: Record<
  PremiumModalVariant,
  {
    accent: string;
    badge: string;
    iconWrap: string;
    iconColor: string;
    icon: ReactNode;
    defaultSubtitle: string;
  }
> = {
  default: {
    accent: "bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500",
    badge:
      "border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-200",
    iconWrap:
      "border-cyan-200 bg-cyan-50 shadow-cyan-900/5 dark:border-cyan-400/20 dark:bg-cyan-400/10",
    iconColor: "text-cyan-600 dark:text-cyan-200",
    icon: <Sparkles className="h-5 w-5" />,
    defaultSubtitle: "Premium Access",
  },
  info: {
    accent: "bg-gradient-to-r from-blue-500 to-cyan-500",
    badge:
      "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-200",
    iconWrap:
      "border-blue-200 bg-blue-50 shadow-blue-900/5 dark:border-blue-400/20 dark:bg-blue-400/10",
    iconColor: "text-blue-600 dark:text-blue-200",
    icon: <Info className="h-5 w-5" />,
    defaultSubtitle: "Information",
  },
  error: {
    accent: "bg-gradient-to-r from-rose-500 via-red-500 to-orange-400",
    badge:
      "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-200",
    iconWrap:
      "border-rose-200 bg-rose-50 shadow-rose-900/5 dark:border-rose-400/20 dark:bg-rose-400/10",
    iconColor: "text-rose-600 dark:text-rose-200",
    icon: <AlertTriangle className="h-5 w-5" />,
    defaultSubtitle: "Confirmation",
  },
};

export default function PremiumModal({
  open,
  title,
  subtitle,
  description,
  onClose,
  children,
  footer,
  variant = "default",
  size = "md",
}: PremiumModalProps) {
  const config = variantConfig[variant];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-sm"
          />

          <motion.div
            key="modal"
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-0 z-[110] flex items-end justify-center p-3 sm:items-center sm:p-6"
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="premium-modal-title"
              className={`
                relative max-h-[calc(100vh-1.5rem)] w-full overflow-hidden
                rounded-[22px] border border-slate-200/80
                bg-white shadow-[0_24px_70px_rgba(15,23,42,0.28)]
                ring-1 ring-white/70
                dark:border-white/10 dark:bg-slate-900
                dark:ring-white/5 dark:shadow-[0_28px_90px_rgba(0,0,0,0.55)]
                ${sizeClasses[size]}
              `}
            >
              <div className={`h-1.5 w-full ${config.accent}`} />

              <div className="max-h-[calc(100vh-1.75rem)] overflow-y-auto p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3 sm:gap-4">
                  <div className="flex min-w-0 items-start gap-3.5 sm:gap-4">
                    <div
                      className={`
                        flex h-12 w-12 shrink-0 items-center justify-center
                        rounded-2xl border shadow-sm ring-4 ring-slate-100/80
                        dark:ring-white/5 ${config.iconWrap}
                        ${config.iconColor}
                      `}
                    >
                      {config.icon}
                    </div>

                    <div className="min-w-0">
                      <h2
                        id="premium-modal-title"
                        className="text-xl font-bold leading-tight text-slate-950 dark:text-white sm:text-2xl"
                      >
                        {title}
                      </h2>

                      <span
                        className={`
                          mt-2 inline-flex max-w-full items-center rounded-full
                          border px-2.5 py-1 text-[11px] font-bold
                          uppercase tracking-[0.12em] ${config.badge}
                        `}
                      >
                        {subtitle ?? config.defaultSubtitle}
                      </span>

                      {description && (
                        <p className="mt-3 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-300">
                          {description}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close modal"
                    className="
                      flex h-9 w-9 shrink-0 items-center justify-center
                      rounded-xl border border-slate-200 bg-white/90
                      text-slate-500 shadow-sm transition
                      hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950
                      active:scale-95
                      dark:border-white/10 dark:bg-white/5 dark:text-slate-300
                      dark:hover:border-white/20 dark:hover:bg-white/10 dark:hover:text-white
                    "
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {(children || footer) && (
                  <div className="my-5 h-px w-full bg-slate-200/80 dark:bg-white/10" />
                )}

                {children && (
                  <div
                    className="
                      rounded-2xl border border-slate-200 bg-slate-50 p-4
                      text-sm leading-6 text-slate-700
                      dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300
                    "
                  >
                    {children}
                  </div>
                )}

                {footer && (
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    {footer}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function ModalCancelButton({
  onClick,
  children = "Cancel",
  disabled = false,
}: {
  onClick: () => void;
  children?: ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="
        inline-flex min-h-11 items-center justify-center rounded-xl
        w-full border border-slate-200 bg-white px-5 py-2.5
        text-sm font-semibold text-slate-700 shadow-sm
        transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950
        active:scale-[0.98]
        disabled:pointer-events-none disabled:opacity-50
        dark:border-white/10 dark:bg-white/5 dark:text-slate-200
        dark:hover:border-white/20 dark:hover:bg-white/10 dark:hover:text-white
      "
    >
      {children}
    </button>
  );
}

export function ModalConfirmButton({
  onClick,
  variant = "default",
  children,
  disabled = false,
}: {
  onClick: () => void;
  variant?: PremiumModalVariant;
  children: ReactNode;
  disabled?: boolean;
}) {
  const styles: Record<PremiumModalVariant, string> = {
    default:
      "bg-slate-950 text-white shadow-[0_12px_24px_rgba(15,23,42,0.22)] hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200",
    info: "bg-blue-600 text-white shadow-[0_12px_24px_rgba(37,99,235,0.24)] hover:bg-blue-500",
    error:
      "bg-rose-600 text-white shadow-[0_12px_24px_rgba(225,29,72,0.24)] hover:bg-rose-500",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex min-h-11 w-full items-center justify-center gap-2
        rounded-xl px-5 py-2.5 text-sm font-semibold
        transition hover:-translate-y-px active:scale-[0.98]
        disabled:pointer-events-none disabled:translate-y-0 disabled:opacity-60
        ${styles[variant]}
      `}
    >
      {children}
    </button>
  );
}
