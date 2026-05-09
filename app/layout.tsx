// app/layout.tsx
import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/components/providers/AuthProvider";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["400", "500", "600", "700", "800"],
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
      <body className={`${manrope.variable} font-sans antialiased`}>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 2600,
              style: {
                borderRadius: "14px",
                background: "#111827",
                color: "#fff",
                padding: "12px 16px",
                fontWeight: "600",
                fontFamily: "var(--font-manrope)",
                border: "1px solid rgba(255,255,255,0.08)",
              },
              success: {
                duration: 1800,
                style: {
                  background: "#052e2b",
                  color: "#d1fae5",
                  border: "1px solid rgba(20,184,166,0.22)",
                },
                iconTheme: { primary: "#2dd4bf", secondary: "#052e2b" },
              },
              error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
