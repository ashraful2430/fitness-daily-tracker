export default function RouteLoading({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex min-h-[50dvh] items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-xl shadow-slate-200/40 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:shadow-black/20">
        <div className="flex items-center gap-3">
          <span className="h-3 w-3 animate-pulse rounded-full bg-cyan-400" />
          <p className="text-sm font-black text-slate-700 dark:text-slate-200">
            {label}
          </p>
        </div>
        <div className="mt-4 space-y-2">
          <div className="h-3 rounded-full bg-slate-200 dark:bg-white/10" />
          <div className="h-3 w-2/3 rounded-full bg-slate-200 dark:bg-white/10" />
        </div>
      </div>
    </div>
  );
}
