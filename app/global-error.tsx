"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en" className="dark">
      <body className="flex min-h-screen items-center justify-center bg-[#070912] p-6 font-sans text-white antialiased">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-500/10 ring-1 ring-rose-500/20">
            <AlertTriangle className="h-9 w-9 text-rose-400" />
          </div>
          <h1 className="text-2xl font-black tracking-[-0.03em]">
            Something went wrong
          </h1>
          <p className="mt-3 text-sm font-medium leading-6 text-slate-400">
            An unexpected error occurred. Try refreshing the page.
          </p>
          {error.digest && (
            <p className="mt-2 font-mono text-xs text-slate-600">
              {error.digest}
            </p>
          )}
          <button
            onClick={reset}
            className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-cyan-500 px-6 py-3 text-sm font-black text-white shadow-lg shadow-emerald-950/30 transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            <RefreshCcw className="h-4 w-4" />
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
