"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";

type Mode = "login" | "register";

export default function AuthForm() {
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async () => {
    const url = mode === "login" ? "/api/auth/login" : "/api/auth/register";

    const payload =
      mode === "login" ? { email, password } : { name, email, password };

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.message || "Something went wrong");
      return;
    }

    toast.success(
      mode === "login" ? "Login successful" : "Account created successfully",
    );

    setTimeout(() => {
      window.location.href = "/?login=success";
    }, 800);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F7F7FB] px-4">
      <div className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-2xl shadow-slate-200">
        <Link
          href="/"
          className="mb-6 inline-flex rounded-2xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-600"
        >
          Back to Home
        </Link>
        <h1 className="text-3xl font-black text-slate-950">
          {mode === "login" ? "Welcome back" : "Create account"}
        </h1>

        <p className="mt-2 text-sm font-medium text-slate-500">
          {mode === "login"
            ? "Login to continue tracking your progress."
            : "Start your fitness and daily tracking journey."}
        </p>

        <div className="mt-8 space-y-4">
          {mode === "register" && (
            <input
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}

          <input
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={handleSubmit}
            className="w-full rounded-2xl bg-indigo-600 px-5 py-3 font-bold text-white shadow-lg shadow-indigo-200 transition hover:scale-[1.02]"
          >
            {mode === "login" ? "Login" : "Create account"}
          </button>
        </div>

        <button
          onClick={() => setMode(mode === "login" ? "register" : "login")}
          className="mt-5 w-full text-sm font-bold text-indigo-600"
        >
          {mode === "login"
            ? "Need an account? Register"
            : "Already have an account? Login"}
        </button>
      </div>
    </div>
  );
}
