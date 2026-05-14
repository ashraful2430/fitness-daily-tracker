import {
  BellRing,
  Fingerprint,
  Palette,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  UserCog,
} from "lucide-react";
import RouteShowcase from "@/components/ui/RouteShowcase";

export default function SettingsPage() {
  return (
    <RouteShowcase
      eyebrow="Settings Studio"
      title="Tune the app around your daily rhythm."
      description="A polished settings foundation for profile preferences, theme behavior, privacy controls, notifications, and smarter defaults across every tracker."
      icon={Settings}
      tone="violet"
      metrics={[
        {
          label: "Theme",
          value: "Light + Dark",
          detail: "The interface is prepared for comfortable use at any time of day.",
          icon: Palette,
          tone: "violet",
        },
        {
          label: "Security",
          value: "Account first",
          detail: "Profile and session surfaces are grouped for clearer control.",
          icon: ShieldCheck,
          tone: "emerald",
        },
        {
          label: "Defaults",
          value: "Personalized",
          detail: "Future preference controls can plug into this layout cleanly.",
          icon: SlidersHorizontal,
          tone: "cyan",
        },
      ]}
      features={[
        {
          title: "Profile Preferences",
          description:
            "A dedicated area for name, email, account identity, and personal tracker defaults.",
          icon: UserCog,
          tone: "violet",
        },
        {
          title: "Theme Behavior",
          description:
            "Light and dark themes stay accessible from navigation while this page gives the setting a natural home.",
          icon: Palette,
          tone: "cyan",
        },
        {
          title: "Notification Planning",
          description:
            "A future-ready panel for focus reminders, study alarms, habit nudges, and money alerts.",
          icon: BellRing,
          tone: "amber",
        },
        {
          title: "Privacy Controls",
          description:
            "Security and session preferences can live beside account tools without cluttering daily workflows.",
          icon: Fingerprint,
          tone: "emerald",
        },
      ]}
      workflow={[
        {
          title: "Set identity",
          description:
            "Keep profile and account-level preferences in one predictable place.",
        },
        {
          title: "Tune experience",
          description:
            "Adjust theme, notification style, and personal defaults as the product grows.",
        },
        {
          title: "Protect access",
          description:
            "Keep security settings close to the controls that affect your data.",
        },
      ]}
      sideTitle="Built for preferences that scale."
      sideDescription="The design gives this route real product weight now, while staying ready for forms and account APIs later."
    />
  );
}
