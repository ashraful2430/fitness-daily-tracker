export default function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-[#09090f] animate-pulse">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-8 space-y-5">
        {/* hero */}
        <div className="rounded-[32px] bg-[#0f0c1f] border border-white/[0.05] h-72 w-full" />

        {/* stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="rounded-[24px] bg-[#0f0c1f] border border-white/[0.05] p-5 space-y-4 h-40"
            >
              <div className="w-10 h-10 rounded-xl bg-white/[0.06]" />
              <div className="space-y-2">
                <div className="h-2.5 w-20 bg-white/[0.06] rounded-full" />
                <div className="h-8 w-16 bg-white/[0.08] rounded-lg" />
                <div className="h-2 w-24 bg-white/[0.04] rounded-full" />
              </div>
            </div>
          ))}
        </div>

        {/* breakdown + chart */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2 rounded-[28px] bg-[#0f0c1f] border border-white/[0.05] h-64" />
          <div className="lg:col-span-3 rounded-[28px] bg-[#0f0c1f] border border-white/[0.05] h-64" />
        </div>

        {/* recent + actions */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3 rounded-[28px] bg-[#0f0c1f] border border-white/[0.05] h-56" />
          <div className="lg:col-span-2 rounded-[28px] bg-[#0f0c1f] border border-white/[0.05] h-56" />
        </div>
      </div>
    </div>
  );
}
