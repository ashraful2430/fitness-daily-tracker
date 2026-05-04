"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, AlertTriangle, Info, Sparkles } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Config Maps ──────────────────────────────────────────────────────────────

const sizeClasses: Record<PremiumModalSize, string> = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

const variantConfig: Record<
  PremiumModalVariant,
  {
    accentGradient: string;
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
    icon: ReactNode;
    iconBg: string;
    defaultSubtitle: string;
  }
> = {
  default: {
    accentGradient: "from-cyan-400 via-violet-500 to-cyan-400",
    badgeBg: "bg-cyan-400/10",
    badgeText: "text-cyan-400",
    badgeBorder: "border-cyan-400/20",
    icon: <Sparkles className="h-5 w-5 text-cyan-400" />,
    iconBg: "bg-cyan-400/10",
    defaultSubtitle: "Premium Access",
  },
  info: {
    accentGradient: "from-sky-400 via-blue-500 to-sky-400",
    badgeBg: "bg-sky-400/10",
    badgeText: "text-sky-400",
    badgeBorder: "border-sky-400/20",
    icon: <Info className="h-5 w-5 text-sky-400" />,
    iconBg: "bg-sky-400/10",
    defaultSubtitle: "Information",
  },
  error: {
    accentGradient: "from-rose-500 via-orange-400 to-rose-500",
    badgeBg: "bg-rose-500/10",
    badgeText: "text-rose-400",
    badgeBorder: "border-rose-500/20",
    icon: <AlertTriangle className="h-5 w-5 text-rose-400" />,
    iconBg: "bg-rose-500/10",
    defaultSubtitle: "Confirmation",
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

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
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md"
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.28, ease: [0.34, 1.3, 0.64, 1] }}
            className={`
              fixed inset-x-0 top-1/2 z-[110] mx-auto w-full
              ${sizeClasses[size]} -translate-y-1/2 px-4
            `}
          >
            <div
              className="
                relative overflow-hidden rounded-[1.5rem]
                border border-white/[0.08]
                bg-slate-950/95 dark:bg-slate-950/95
                shadow-[0_32px_80px_rgba(0,0,0,0.5),0_0_0_0.5px_rgba(255,255,255,0.06)]
                backdrop-blur-xl
              "
            >
              {/* ── Shimmer accent line (animated) */}
              <div className="relative h-[2px] w-full overflow-hidden">
                <div
                  className={`
                    absolute inset-0 bg-gradient-to-r ${config.accentGradient}
                    animate-[shimmer_3s_linear_infinite]
                    bg-[length:200%_100%]
                  `}
                />
              </div>

              {/* ── Subtle glow orb behind header */}
              <div
                className={`
                  pointer-events-none absolute -top-20 left-1/2 h-48 w-64
                  -translate-x-1/2 rounded-full
                  ${
                    variant === "error"
                      ? "bg-rose-500/10"
                      : variant === "info"
                        ? "bg-sky-400/10"
                        : "bg-cyan-400/10"
                  }
                  blur-3xl
                `}
              />

              {/* ── Inner content */}
              <div className="relative px-6 pb-6 pt-6 sm:px-7 sm:pb-7 sm:pt-7">
                {/* Header row */}
                <div className="flex items-start justify-between gap-4">
                  {/* Left: icon + badge + title */}
                  <div className="flex items-start gap-3.5">
                    {/* Icon circle */}
                    <div
                      className={`
                        mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center
                        rounded-[10px] ${config.iconBg}
                        border border-white/[0.07]
                      `}
                    >
                      {config.icon}
                    </div>

                    {/* Text block */}
                    <div className="space-y-1.5">
                      {/* Badge pill */}
                      <span
                        className={`
                          inline-flex items-center gap-1.5 rounded-md
                          border ${config.badgeBorder}
                          ${config.badgeBg} ${config.badgeText}
                          px-2.5 py-[3px]
                          text-[10px] font-semibold uppercase tracking-[0.14em]
                        `}
                      >
                        {subtitle ?? config.defaultSubtitle}
                      </span>

                      {/* Title */}
                      <h2 className="text-[1.35rem] font-bold leading-snug tracking-[-0.02em] text-white sm:text-2xl">
                        {title}
                      </h2>

                      {/* Description */}
                      {description && (
                        <p className="max-w-sm text-[13.5px] leading-relaxed text-slate-400">
                          {description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Close button */}
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close modal"
                    className="
                      mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center
                      rounded-[9px] border border-white/[0.1]
                      bg-white/[0.05] text-slate-400
                      transition-all duration-150
                      hover:border-white/20 hover:bg-white/10 hover:text-white
                      active:scale-95
                    "
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* ── Divider */}
                {(children || footer) && (
                  <div className="my-5 h-px w-full bg-white/[0.07]" />
                )}

                {/* ── Children slot */}
                {children && (
                  <div
                    className="
                      rounded-xl border border-white/[0.07]
                      bg-white/[0.03] p-4
                      text-[13.5px] leading-relaxed text-slate-300
                    "
                  >
                    {children}
                  </div>
                )}

                {/* ── Footer slot */}
                {footer && (
                  <div className="mt-5 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
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

// ─── Button helpers (use inside `footer` prop) ────────────────────────────────

export function ModalCancelButton({
  onClick,
  children = "Cancel",
}: {
  onClick: () => void;
  children?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        rounded-xl border border-white/[0.1]
        bg-white/[0.04] px-5 py-2.5
        text-sm font-medium text-slate-300
        transition-all duration-150
        hover:border-white/20 hover:bg-white/[0.08] hover:text-white
        active:scale-[0.98]
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
}: {
  onClick: () => void;
  variant?: PremiumModalVariant;
  children: ReactNode;
}) {
  const styles: Record<PremiumModalVariant, string> = {
    default:
      "bg-gradient-to-br from-cyan-400 to-violet-500 text-white shadow-[0_4px_18px_rgba(13,217,196,0.3)] hover:shadow-[0_6px_28px_rgba(13,217,196,0.45)]",
    info: "bg-gradient-to-br from-sky-400 to-blue-500 text-white shadow-[0_4px_18px_rgba(56,189,248,0.3)] hover:shadow-[0_6px_28px_rgba(56,189,248,0.45)]",
    error:
      "bg-gradient-to-br from-rose-500 to-orange-400 text-white shadow-[0_4px_18px_rgba(244,63,94,0.3)] hover:shadow-[0_6px_28px_rgba(244,63,94,0.45)]",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        rounded-xl px-5 py-2.5
        text-sm font-semibold
        transition-all duration-150
        hover:-translate-y-px active:scale-[0.98]
        ${styles[variant]}
      `}
    >
      {children}
    </button>
  );
}

// ─── Usage example ────────────────────────────────────────────────────────────
//
// <PremiumModal
//   open={isOpen}
//   onClose={() => setIsOpen(false)}
//   variant="error"
//   title="Delete category"
//   subtitle="Confirmation"
//   description='Delete category "travel"? This only works if no expenses use it.'
//   footer={
//     <>
//       <ModalCancelButton onClick={() => setIsOpen(false)} />
//       <ModalConfirmButton variant="error" onClick={handleDelete}>
//         Delete category
//       </ModalConfirmButton>
//     </>
//   }
// />
