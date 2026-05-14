import {
  Activity,
  BarChart3,
  CalendarRange,
  ChartNoAxesCombined,
  ClipboardList,
  LineChart,
  PieChart,
  TrendingUp,
} from "lucide-react";
import RouteShowcase from "@/components/ui/RouteShowcase";

export default function ReportsPage() {
  return (
    <RouteShowcase
      eyebrow="Reports Observatory"
      title="Turn scattered daily logs into clear progress signals."
      description="A responsive reporting surface for weekly review, category comparison, personal streaks, learning output, money flow, and health momentum."
      icon={LineChart}
      tone="cyan"
      metrics={[
        {
          label: "Cadence",
          value: "Daily to yearly",
          detail: "A clean structure for short reviews and long-range analysis.",
          icon: CalendarRange,
          tone: "cyan",
        },
        {
          label: "Signals",
          value: "Cross-tracker",
          detail: "Learning, habits, fitness, focus, and money can be compared together.",
          icon: ChartNoAxesCombined,
          tone: "violet",
        },
        {
          label: "Review",
          value: "Actionable",
          detail: "Reports are designed to explain what changed and what needs attention.",
          icon: ClipboardList,
          tone: "emerald",
        },
      ]}
      features={[
        {
          title: "Weekly Momentum",
          description:
            "A report section for workouts, study minutes, focus blocks, habit streaks, and completion score.",
          icon: TrendingUp,
          tone: "emerald",
        },
        {
          title: "Category Breakdown",
          description:
            "Compare learning subjects, spending categories, routine types, and fitness activities.",
          icon: PieChart,
          tone: "amber",
        },
        {
          title: "Performance Timeline",
          description:
            "A chart-friendly layout for trends, dips, spikes, and recurring life patterns.",
          icon: BarChart3,
          tone: "cyan",
        },
        {
          title: "Health of the System",
          description:
            "Bring activity, consistency, and recovery into one view so progress feels balanced.",
          icon: Activity,
          tone: "rose",
        },
      ]}
      workflow={[
        {
          title: "Collect",
          description:
            "Use each tracker to gather the daily data that powers meaningful reports.",
        },
        {
          title: "Compare",
          description:
            "Review progress across time, category, and life area without changing routes.",
        },
        {
          title: "Adjust",
          description:
            "Spot the next best habit, budget, study, or fitness adjustment from the evidence.",
        },
      ]}
      sideTitle="A reporting layer with room for real analytics."
      sideDescription="The design gives reports a strong visual destination now and can later accept charts, filters, exports, and AI summaries."
    />
  );
}
