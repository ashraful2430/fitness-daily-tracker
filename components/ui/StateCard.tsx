import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  tone: "orange" | "blue" | "purple" | "green";
};

const tones = {
  orange: "from-orange-500 to-amber-400 shadow-orange-100",
  blue: "from-sky-500 to-cyan-400 shadow-sky-100",
  purple: "from-violet-500 to-fuchsia-400 shadow-violet-100",
  green: "from-emerald-500 to-lime-400 shadow-emerald-100",
};

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  tone,
}: StatCardProps) {
  return (
    <div className="rounded-[2rem] bg-white p-5 shadow-xl shadow-slate-200/70">
      <div
        className={`mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${tones[tone]} text-white shadow-lg`}
      >
        <Icon size={22} />
      </div>

      <p className="text-sm font-bold text-slate-500">{title}</p>
      <p className="mt-2 text-4xl font-black text-slate-950">{value}</p>
      <p className="mt-1 text-sm font-semibold text-slate-400">{subtitle}</p>
    </div>
  );
}
