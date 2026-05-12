import type { LucideIcon } from "lucide-react";

type Tone = "cyan" | "emerald" | "violet" | "amber" | "rose";

type Metric = {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  tone: Tone;
};

type Feature = {
  title: string;
  description: string;
  icon: LucideIcon;
  tone: Tone;
};

type WorkflowItem = {
  title: string;
  description: string;
};

type RouteShowcaseProps = {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  tone: Tone;
  metrics: Metric[];
  features: Feature[];
  workflow: WorkflowItem[];
  sideTitle: string;
  sideDescription: string;
};

const toneStyles: Record<
  Tone,
  {
    text: string;
    soft: string;
    solid: string;
    border: string;
    glow: string;
    hero: string;
  }
> = {
  cyan: {
    text: "text-cyan-600 dark:text-cyan-300",
    soft: "bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-200",
    solid: "from-cyan-500 to-blue-600",
    border: "border-cyan-200/80 dark:border-cyan-300/20",
    glow: "bg-cyan-400/16",
    hero: "from-cyan-500/18 via-white/85 to-blue-500/14 dark:from-cyan-500/16 dark:via-white/[0.04] dark:to-blue-500/10",
  },
  emerald: {
    text: "text-emerald-600 dark:text-emerald-300",
    soft:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200",
    solid: "from-emerald-500 to-teal-600",
    border: "border-emerald-200/80 dark:border-emerald-300/20",
    glow: "bg-emerald-400/16",
    hero: "from-emerald-500/18 via-white/85 to-teal-500/14 dark:from-emerald-500/16 dark:via-white/[0.04] dark:to-teal-500/10",
  },
  violet: {
    text: "text-violet-600 dark:text-violet-300",
    soft: "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-200",
    solid: "from-violet-600 to-fuchsia-600",
    border: "border-violet-200/80 dark:border-violet-300/20",
    glow: "bg-violet-400/16",
    hero: "from-violet-500/18 via-white/85 to-fuchsia-500/14 dark:from-violet-500/16 dark:via-white/[0.04] dark:to-fuchsia-500/10",
  },
  amber: {
    text: "text-amber-600 dark:text-amber-300",
    soft: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200",
    solid: "from-amber-500 to-orange-600",
    border: "border-amber-200/80 dark:border-amber-300/20",
    glow: "bg-amber-400/16",
    hero: "from-amber-500/18 via-white/85 to-orange-500/14 dark:from-amber-500/16 dark:via-white/[0.04] dark:to-orange-500/10",
  },
  rose: {
    text: "text-rose-600 dark:text-rose-300",
    soft: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-200",
    solid: "from-rose-500 to-orange-600",
    border: "border-rose-200/80 dark:border-rose-300/20",
    glow: "bg-rose-400/16",
    hero: "from-rose-500/18 via-white/85 to-orange-500/14 dark:from-rose-500/16 dark:via-white/[0.04] dark:to-orange-500/10",
  },
};

export default function RouteShowcase({
  eyebrow,
  title,
  description,
  icon: Icon,
  tone,
  metrics,
  features,
  workflow,
  sideTitle,
  sideDescription,
}: RouteShowcaseProps) {
  const accent = toneStyles[tone];

  return (
    <section className="relative min-h-screen overflow-hidden px-4 py-6 text-slate-950 dark:text-white sm:px-6 lg:px-8 xl:px-10">
      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <div className={`absolute right-[8%] top-[5%] h-80 w-80 rounded-[5rem] ${accent.glow} blur-[120px]`} />
        <div className="absolute left-[18%] top-0 h-px w-[42rem] max-w-[70vw] bg-gradient-to-r from-transparent via-slate-300/70 to-transparent dark:via-white/12" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1500px] space-y-5">
        <div className={`relative overflow-hidden rounded-[2rem] border border-slate-200 bg-gradient-to-br ${accent.hero} p-5 shadow-[0_30px_90px_rgba(148,163,184,0.16)] backdrop-blur-xl dark:border-white/[0.08] dark:shadow-[0_30px_90px_rgba(0,0,0,0.32)] sm:p-7 lg:p-8`}>
          <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/20" />
          <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rotate-12 rounded-[3rem] border border-white/30 bg-white/20 shadow-2xl backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.04]" />

          <div className="relative grid gap-7 xl:grid-cols-[minmax(0,1fr)_430px] xl:items-end">
            <div className="max-w-4xl">
              <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] ${accent.border} ${accent.soft}`}>
                <Icon className="h-4 w-4" />
                {eyebrow}
              </div>
              <h1 className="mt-5 text-[clamp(2.3rem,5vw,4.8rem)] font-black leading-[0.95] tracking-[-0.04em] text-slate-950 dark:text-white">
                {title}
              </h1>
              <p className="mt-5 max-w-2xl text-base font-medium leading-8 text-slate-600 dark:text-slate-300">
                {description}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              {metrics.map((metric) => {
                const MetricIcon = metric.icon;
                const metricTone = toneStyles[metric.tone];

                return (
                  <div
                    key={metric.label}
                    className="rounded-[1.45rem] border border-slate-200/80 bg-white/82 p-4 shadow-lg shadow-slate-200/40 backdrop-blur dark:border-white/[0.08] dark:bg-white/[0.055] dark:shadow-none"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                          {metric.label}
                        </p>
                        <p className="mt-2 text-2xl font-black tracking-[-0.03em] text-slate-950 dark:text-white">
                          {metric.value}
                        </p>
                      </div>
                      <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${metricTone.soft}`}>
                        <MetricIcon className="h-5 w-5" />
                      </span>
                    </div>
                    <p className="mt-3 text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">
                      {metric.detail}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="grid gap-4 md:grid-cols-2">
            {features.map((feature) => {
              const FeatureIcon = feature.icon;
              const featureTone = toneStyles[feature.tone];

              return (
                <article
                  key={feature.title}
                  className="group relative min-h-[210px] overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white/88 p-5 shadow-xl shadow-slate-200/55 transition duration-200 hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-300/50 dark:border-white/[0.08] dark:bg-[#0f0c1f]/88 dark:shadow-black/22"
                >
                  <div className={`absolute -right-12 -top-12 h-36 w-36 rounded-[2.6rem] bg-gradient-to-br ${featureTone.solid} opacity-10 blur-3xl transition group-hover:opacity-18`} />
                  <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${featureTone.solid} text-white shadow-lg shadow-slate-900/10`}>
                    <FeatureIcon className="h-5 w-5" />
                  </div>
                  <h2 className="text-xl font-black tracking-[-0.02em] text-slate-950 dark:text-white">
                    {feature.title}
                  </h2>
                  <p className="mt-3 text-sm font-medium leading-7 text-slate-500 dark:text-slate-400">
                    {feature.description}
                  </p>
                </article>
              );
            })}
          </div>

          <aside className="relative overflow-hidden rounded-[1.9rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_34px_100px_rgba(15,23,42,0.24)] dark:border-white/[0.08] dark:bg-[#10111b] dark:shadow-black/35 lg:p-7">
            <div className="pointer-events-none absolute -right-14 top-8 h-44 w-44 rotate-12 rounded-[3rem] border border-white/10 bg-white/[0.04]" />
            <div className={`pointer-events-none absolute -left-16 bottom-0 h-56 w-56 rounded-[4rem] ${accent.glow} blur-[100px]`} />
            <div className="relative">
              <p className={`text-[11px] font-black uppercase tracking-[0.24em] ${accent.text}`}>
                Section Design
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-[-0.03em]">
                {sideTitle}
              </h2>
              <p className="mt-4 text-sm font-medium leading-7 text-slate-300">
                {sideDescription}
              </p>

              <div className="mt-7 space-y-4">
                {workflow.map((item, index) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-sm font-black">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                    <div>
                      <h3 className="font-black">{item.title}</h3>
                      <p className="mt-1 text-sm font-medium leading-6 text-slate-300">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
