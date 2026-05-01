import type { Metadata, Viewport } from "next";
import HomeLanding from "@/components/home/HomeLanding";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://fitness-daily-tracker.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title:
    "Planify Life | Personal Growth Dashboard for Learning, Focus, Fitness, and Money",
  description:
    "Planify Life helps students, professionals, and creators track study sessions, focus blocks, fitness progress, habits, money, and reports in one modern dashboard.",
  keywords: [
    "personal dashboard",
    "study tracker",
    "learning timer",
    "expense tracker",
    "habit tracker",
    "fitness tracker",
    "productivity app",
  ],
  openGraph: {
    title: "Planify Life",
    description:
      "Track learning, focus, money, fitness, and habits in one polished personal dashboard.",
    url: "/",
    siteName: "Planify Life",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Planify Life",
    description:
      "A modern personal tracking hub for study, focus, fitness, habits, and money.",
  },
  alternates: {
    canonical: "/",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5efe3" },
    { media: "(prefers-color-scheme: dark)", color: "#09090f" },
  ],
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Planify Life",
  applicationCategory: "ProductivityApplication",
  operatingSystem: "Web",
  description:
    "A personal productivity dashboard for tracking learning, focus sessions, fitness, habits, reports, and money.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <HomeLanding />
    </>
  );
}
