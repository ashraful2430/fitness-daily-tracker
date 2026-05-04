"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

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
  sm: "max-w-md",
  md: "max-w-2xl",
  lg: "max-w-4xl",
};

const variantHeaderStyles: Record<PremiumModalVariant, string> = {
  default: "from-[#184286] via-[#2C2F3D] to-[#F05B2D]",
  info: "from-[#2D8B74] via-[#2C2F3D] to-[#F05B2D]",
  error: "from-[#E53E3E] via-[#2C2F3D] to-[#F05B2D]",
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
  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, translateY: 24, scale: 0.98 }}
            animate={{ opacity: 1, translateY: 0, scale: 1 }}
            exit={{ opacity: 0, translateY: 24, scale: 0.98 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`fixed inset-x-0 top-1/2 z-[110] mx-auto w-full ${sizeClasses[size]} -translate-y-1/2 px-4`}
          >
            <div className="relative overflow-hidden rounded-xl border border-gray-700/60 bg-gradient-to-r from-[#184286] to-[#F05B2D] shadow-xl">
              <div
                className={`absolute inset-x-0 top-0 h-2 bg-gradient-to-r ${variantHeaderStyles[variant]} opacity-80`}
              />

              <div className="relative px-6 pb-6 pt-6 sm:px-8">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-3">
                    <div className="inline-flex items-center rounded-full border border-white/20 bg-white/20 px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.2em] text-white shadow-sm shadow-[#184286]/30">
                      {subtitle ?? "Confirmation"}
                    </div>

                    <div className="space-y-2">
                      <h2 className="text-3xl font-extrabold text-white tracking-tight">
                        {title}
                      </h2>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-slate-800 text-white shadow-lg transition hover:bg-slate-700"
                    aria-label="Close modal"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Display children or description only once */}
                {(children || description) && (
                  <div className="mt-6 rounded-[1.75rem] border border-slate-800/80 bg-slate-900/95 p-6 shadow-inner shadow-slate-950/20">
                    {children ?? (
                      <p className="text-sm leading-6 text-slate-300">
                        {description}
                      </p>
                    )}
                  </div>
                )}

                {footer ? (
                  <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                    {footer}
                  </div>
                ) : null}
              </div>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
