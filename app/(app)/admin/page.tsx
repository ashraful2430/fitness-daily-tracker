import { redirect } from "next/navigation";
import {
  ActivitySquare,
  DatabaseZap,
  Gauge,
  Shield,
  ShieldCheck,
  UserRoundCog,
  Users,
} from "lucide-react";
import { connectDB } from "@/lib/mongodb";
import { getCurrentUserId } from "@/lib/auth";
import User from "@/models/Users";
import RouteShowcase from "@/components/ui/RouteShowcase";

export default async function AdminPage() {
  await connectDB();

  const userId = await getCurrentUserId();

  if (!userId) {
    redirect("/auth");
  }

  const user = await User.findById(userId).select("-password");

  if (!user || user.role !== "admin") {
    redirect("/dashboard");
  }

  const userCount = await User.countDocuments();

  return (
    <RouteShowcase
      eyebrow="Admin Command"
      title="Monitor the platform without losing the human context."
      description="A modern control surface for user visibility, health signals, operational checks, and protected administrative actions."
      icon={Shield}
      tone="rose"
      metrics={[
        {
          label: "Users",
          value: String(userCount),
          detail: "Registered accounts currently visible to the admin system.",
          icon: Users,
          tone: "rose",
        },
        {
          label: "Access",
          value: "Protected",
          detail: "This route is server-gated and redirects non-admin users.",
          icon: ShieldCheck,
          tone: "emerald",
        },
        {
          label: "Health",
          value: "Ready",
          detail: "Database-backed surfaces can be layered into this route next.",
          icon: Gauge,
          tone: "cyan",
        },
      ]}
      features={[
        {
          title: "User Management",
          description:
            "A future panel for roles, profiles, login streaks, and account-level health.",
          icon: UserRoundCog,
          tone: "rose",
        },
        {
          title: "Activity Signals",
          description:
            "Review usage across learning, fitness, money, habits, and focus tools.",
          icon: ActivitySquare,
          tone: "cyan",
        },
        {
          title: "Data Operations",
          description:
            "A safe home for database checks, import/export workflows, and maintenance views.",
          icon: DatabaseZap,
          tone: "amber",
        },
        {
          title: "Permission Review",
          description:
            "Keep elevated controls visually distinct from everyday user-facing routes.",
          icon: ShieldCheck,
          tone: "emerald",
        },
      ]}
      workflow={[
        {
          title: "Verify access",
          description:
            "Server checks keep the admin route available only to approved users.",
        },
        {
          title: "Inspect signals",
          description:
            "Use top-level metrics to understand user and platform state quickly.",
        },
        {
          title: "Take action",
          description:
            "Add operational tools here without crowding the normal dashboard.",
        },
      ]}
      sideTitle="A protected surface for serious controls."
      sideDescription="The admin page now has a real product layout and can accept tables, charts, audit logs, and management actions as the backend expands."
    />
  );
}
