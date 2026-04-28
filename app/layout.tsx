import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter", // ← add this
  weight: ["400", "500", "600", "700", "800", "900"], // ← add this
  display: "swap", // ← add this
});

export const metadata: Metadata = {
  title: "Planify Life | Personal Productivity Tracker",
  description:
    "Track learning, fitness, habits, focus time, expenses, and progress reports in one personal productivity system.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* ← change className to use the variable */}
      <body className={`${inter.variable} font-sans antialiased`}>
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
            },
            success: {
              iconTheme: {
                primary: "#22c55e",
                secondary: "#fff",
              },
            },
            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: "#fff",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
