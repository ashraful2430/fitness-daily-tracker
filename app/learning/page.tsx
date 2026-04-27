import { redirect } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import { getCurrentUserId } from "@/lib/auth";

export default async function LearningPage() {
  const userId = await getCurrentUserId();

  if (!userId) redirect("/auth");

  return (
    <main className="min-h-screen bg-[#F7F7FB] text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar />
        <section className="flex-1 p-6 lg:p-10">
          <h1 className="text-4xl font-black">Learning Tracker</h1>
          <p className="mt-3 text-slate-600">
            Track courses, subjects, study sessions, and practice time.
          </p>
        </section>
      </div>
    </main>
  );
}
