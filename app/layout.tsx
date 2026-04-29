// app/layout.tsx
import type { Metadata } from "next";
import { Roboto_Serif } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/components/providers/AuthProvider";

const robotoSerif = Roboto_Serif({
  subsets: ["latin"],
  variable: "--font-roboto-serif",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Planify Life | Personal Productivity Tracker",
  description:
    "Track learning, fitness, habits, focus time, expenses, and progress reports in one personal productivity system.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // ✅ add dark class here so entire app respects dark mode
    <html lang="en" className="dark">
      <body className={`${robotoSerif.variable} font-serif antialiased`}>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                borderRadius: "16px",
                background: "#0f172a",
                color: "#fff",
                padding: "14px 18px",
                fontWeight: "600",
                fontFamily: "var(--font-roboto-serif)",
              },
              success: { iconTheme: { primary: "#22c55e", secondary: "#fff" } },
              error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
