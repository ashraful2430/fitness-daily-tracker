import {
  BookMarked,
  Dumbbell,
  FolderKanban,
  Layers3,
  ListChecks,
  PiggyBank,
  Tags,
  Workflow,
} from "lucide-react";
import RouteShowcase from "@/components/ui/RouteShowcase";

export default function CategoriesPage() {
  return (
    <RouteShowcase
      eyebrow="Category System"
      title="Give every part of your life a cleaner filing system."
      description="Custom categories help learning, money, workouts, habits, and personal goals stay organized without turning the app into a messy spreadsheet."
      icon={FolderKanban}
      tone="amber"
      metrics={[
        {
          label: "Coverage",
          value: "All trackers",
          detail: "A shared concept for study, spending, health, habits, and goals.",
          icon: Layers3,
          tone: "amber",
        },
        {
          label: "Clarity",
          value: "Cleaner reports",
          detail: "Better category labels make future reporting easier to scan.",
          icon: Tags,
          tone: "cyan",
        },
        {
          label: "Control",
          value: "Custom fit",
          detail: "Users can shape the app around their real routines and priorities.",
          icon: Workflow,
          tone: "emerald",
        },
      ]}
      features={[
        {
          title: "Learning Groups",
          description:
            "Group sessions by subject, course, skill track, or certification path.",
          icon: BookMarked,
          tone: "cyan",
        },
        {
          title: "Money Labels",
          description:
            "Separate bills, food, savings, subscriptions, family support, and custom spending buckets.",
          icon: PiggyBank,
          tone: "emerald",
        },
        {
          title: "Fitness Types",
          description:
            "Make cardio, strength, mobility, running, recovery, and sport-specific work easier to review.",
          icon: Dumbbell,
          tone: "rose",
        },
        {
          title: "Habit Themes",
          description:
            "Organize routines by health, faith, learning, home, career, or personal growth.",
          icon: ListChecks,
          tone: "violet",
        },
      ]}
      workflow={[
        {
          title: "Name the bucket",
          description:
            "Create labels that match the way you naturally think about your life.",
        },
        {
          title: "Attach to entries",
          description:
            "Use categories while logging study, money, workouts, habits, and goals.",
        },
        {
          title: "Review patterns",
          description:
            "Let categories become the foundation for cleaner charts and better decisions.",
        },
      ]}
      sideTitle="A taxonomy layer for the whole product."
      sideDescription="This route is designed as the future home for category creation, color tagging, usage counts, and cross-feature organization."
    />
  );
}
