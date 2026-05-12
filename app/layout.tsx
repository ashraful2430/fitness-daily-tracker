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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{const t=localStorage.getItem("theme");const d=t?t==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d)}catch{document.documentElement.classList.add("dark")}`,
          }}
        />
      </head>
      <body className={`${manrope.variable} font-sans antialiased`}>
        <AuthProvider>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 2600,
              style: {
                maxWidth: "min(92vw, 560px)",
                borderRadius: "16px",
                background: "rgba(15,23,42,0.96)",
                color: "#fff",
                padding: "13px 16px",
                fontWeight: "600",
                fontFamily: "var(--font-manrope)",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.28)",
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
              error: {
                duration: 3200,
                style: {
                  background: "rgba(76,5,25,0.96)",
                  color: "#ffe4e6",
                  border: "1px solid rgba(244,63,94,0.28)",
                },
                iconTheme: { primary: "#fb7185", secondary: "#fff" },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
