"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import {
  Activity,
  ArrowLeft,
  BriefcaseBusiness,
  ChevronDown,
  Eye,
  EyeOff,
  GraduationCap,
  Loader2,
  Lock,
  Mail,
  Mars,
  ShieldCheck,
  Sparkles,
  User,
  Venus,
} from "lucide-react";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { ApiError } from "@/lib/api";

type Mode = "login" | "register";

const occupationOptions = [
  "Student",
  "Worker",
  "Founder",
  "Freelancer",
  "Teacher",
  "Developer",
  "Designer",
  "Athlete",
  "Creator",
  "Other",
];

const genderOptions = [
  { value: "", label: "Select gender" },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "non_binary", label: "Non-binary" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

export default function AuthForm() {
  const { login, register } = useAuth();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState("");
  const [occupation, setOccupation] = useState("Student");
  const [customOccupation, setCustomOccupation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const blockedReason = searchParams.get("reason");
  const finalOccupation = useMemo(
    () =>
      occupation === "Other"
        ? customOccupation.trim()
        : occupation.trim(),
    [customOccupation, occupation],
  );

  const handleSubmit = async () => {
    if (!email || !password || (mode === "register" && (!name || !gender || !finalOccupation))) {
      toast.error("Fill the blanks first, baby. No shortcuts");
      return;
    }

    setLoading(true);
    setAuthError(null);

    try {
      if (mode === "login") {
        await login({ email, password });
      } else {
        await register({
          name,
          email,
          password,
          gender,
          occupation: finalOccupation,
        });
      }

      window.location.href = "/dashboard";
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        if (error.status === 403) {
          setAuthError(error.message);
        } else {
          toast.error(`${error.message} Try again sharper`);
        }
      } else {
        toast.error("Connection said no. Run it back in a second");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f4f7fb] text-slate-950 dark:bg-[#050914] dark:text-white">
      <div className="relative min-h-screen overflow-hidden px-4 py-5 sm:px-6 lg:px-8">
        <div className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.22),transparent_34%),radial-gradient(circle_at_80%_10%,rgba(99,102,241,0.2),transparent_32%)]" />
        <div className="absolute bottom-0 left-1/2 h-72 w-[44rem] -translate-x-1/2 rounded-full bg-emerald-400/10 blur-3xl" />

        <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-cyan-300 shadow-lg shadow-slate-300/70 dark:bg-white/10 dark:shadow-none">
              <Activity size={22} />
            </div>
            <div>
              <h1 className="text-lg font-black">Planify Life</h1>
              <p className="hidden text-xs font-semibold text-slate-500 dark:text-slate-400 sm:block">
                Personal operating system
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/"
              className="hidden items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-cyan-300 hover:text-cyan-700 dark:border-white/10 dark:bg-white/10 dark:text-white sm:flex"
            >
              <ArrowLeft size={16} />
              Home
            </Link>
          </div>
        </nav>

        <section className="relative z-10 mx-auto grid min-h-[calc(100vh-5.5rem)] max-w-7xl items-center gap-6 py-8 lg:grid-cols-[minmax(0,1fr)_minmax(24rem,30rem)]">
          <div className="hidden lg:block">
            <div className="max-w-2xl">
              <p className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm font-black text-cyan-700 dark:text-cyan-200">
                <Sparkles size={16} />
                Built around your real life
              </p>
              <h2 className="mt-5 text-6xl font-black leading-[1.02] tracking-tight">
                A sharper home for every routine you care about.
              </h2>
              <p className="mt-6 text-lg font-semibold leading-8 text-slate-600 dark:text-slate-300">
                Your learning, fitness, money, focus, and habits sit in one polished dashboard with profile context that actually understands your day.
              </p>
            </div>

            <div className="mt-8 grid max-w-3xl gap-3 sm:grid-cols-3">
              {[
                [GraduationCap, "Students", "Study blocks and deadlines"],
                [BriefcaseBusiness, "Workers", "Focus, money, routines"],
                [ShieldCheck, "Everyone", "Goals that stay visible"],
              ].map(([Icon, title, text]) => {
                const CardIcon = Icon as typeof GraduationCap;
                return (
                  <div key={String(title)} className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/[0.06]">
                    <CardIcon className="h-5 w-5 text-cyan-500" />
                    <p className="mt-4 text-lg font-black">{String(title)}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">{String(text)}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mx-auto w-full max-w-[30rem]">
            <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white/92 shadow-[0_30px_90px_rgba(15,23,42,0.14)] backdrop-blur-xl dark:border-white/10 dark:bg-[#08101f]/95">
              <div className="h-1 bg-gradient-to-r from-cyan-400 via-emerald-300 to-violet-500" />
              <div className="p-5 sm:p-6">
                <Link
                  href="/"
                  className="mb-5 inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-cyan-50 hover:text-cyan-700 dark:bg-white/10 dark:text-white sm:hidden"
                >
                  <ArrowLeft size={16} />
                  Back to Home
                </Link>

                <div className="mb-6 flex rounded-2xl border border-slate-200 bg-slate-50 p-1 dark:border-white/10 dark:bg-white/[0.04]">
                  {(["login", "register"] as Mode[]).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setMode(item);
                        setAuthError(null);
                      }}
                      className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-black capitalize transition ${
                        mode === item
                          ? "bg-slate-950 text-white shadow-sm dark:bg-cyan-400 dark:text-slate-950"
                          : "text-slate-500 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>

                <div className="mb-6">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-300">
                    {mode === "login" ? "Welcome back" : "Create profile"}
                  </p>
                  <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                    {mode === "login" ? "Login to Planify" : "Tell Planify who you are"}
                  </h1>
                  <p className="mt-2 text-sm font-semibold leading-6 text-slate-500 dark:text-slate-400">
                    {mode === "login"
                      ? "Jump back into your daily command center."
                      : "Gender and occupation help personalize your experience across learning, fitness, and habits."}
                  </p>
                </div>

                {blockedReason || authError ? (
                  <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
                    {authError ?? blockedReason}
                  </div>
                ) : null}

                <div className="space-y-3">
                  {mode === "register" ? (
                    <InputShell icon={<User size={18} />} label="Full name">
                      <input className={fieldClass} placeholder="Ashraful Islam" value={name} onChange={(event) => setName(event.target.value)} />
                    </InputShell>
                  ) : null}

                  <InputShell icon={<Mail size={18} />} label="Email">
                    <input className={fieldClass} placeholder="you@example.com" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
                  </InputShell>

                  <InputShell icon={<Lock size={18} />} label="Password">
                    <input className={`${fieldClass} pr-12`} placeholder="Your password" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-cyan-600 dark:hover:bg-white/10">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </InputShell>

                  {mode === "register" ? (
                    <>
                      <InputShell icon={gender === "female" ? <Venus size={18} /> : <Mars size={18} />} label="Gender">
                        <select className={`${fieldClass} appearance-none pr-10`} value={gender} onChange={(event) => setGender(event.target.value)}>
                          {genderOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      </InputShell>

                      <InputShell icon={<BriefcaseBusiness size={18} />} label="Occupation">
                        <select className={`${fieldClass} appearance-none pr-10`} value={occupation} onChange={(event) => setOccupation(event.target.value)}>
                          {occupationOptions.map((item) => <option key={item} value={item}>{item}</option>)}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      </InputShell>

                      {occupation === "Other" ? (
                        <InputShell icon={<Sparkles size={18} />} label="Custom role">
                          <input className={fieldClass} placeholder="Your custom role" value={customOccupation} onChange={(event) => setCustomOccupation(event.target.value)} />
                        </InputShell>
                      ) : null}
                    </>
                  ) : null}

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-4 text-sm font-black text-white shadow-[0_18px_45px_rgba(37,99,235,0.24)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                    {mode === "login" ? "Login" : "Create account"}
                  </button>
                </div>

                <p className="mt-5 text-center text-sm font-semibold text-slate-500 dark:text-slate-400">
                  {mode === "login" ? "No account yet?" : "Already registered?"}{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode(mode === "login" ? "register" : "login");
                      setAuthError(null);
                    }}
                    className="font-black text-cyan-700 dark:text-cyan-300"
                  >
                    {mode === "login" ? "Create one" : "Login instead"}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

const fieldClass =
  "w-full bg-transparent px-11 py-3.5 text-sm font-bold text-slate-950 outline-none placeholder:text-slate-400 dark:text-white";

function InputShell({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[0.65rem] font-black uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
        {label}
      </span>
      <span className="relative block rounded-2xl border border-slate-200 bg-slate-50 transition focus-within:border-cyan-400 focus-within:bg-white dark:border-white/10 dark:bg-white/[0.04] dark:focus-within:bg-white/[0.07]">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </span>
        {children}
      </span>
    </label>
  );
}
